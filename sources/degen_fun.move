module degen_fun::non_fungible_token;

use std::{string, ascii};
use sui::{
    event, 
    url::{Self, Url}, 
};

public struct NonFungibleToken has key, store {
    id: UID,
    name: string::String,
    description: string::String,
    url: Url,
}

public struct NFTMinted has copy, drop {
    object_id: ID,
    creator: address,
    name: string::String,
}

public fun name(nft: &NonFungibleToken): &string::String {
    &nft.name
}

public fun description(nft: &NonFungibleToken): &string::String {
    &nft.description
}

public fun url(nft: &NonFungibleToken): &Url {
    &nft.url
}

#[allow(lint(self_transfer))]
public fun mint_to_sender(
    name: vector<u8>,
    description: vector<u8>,
    url: vector<u8>,
    ctx: &mut TxContext,
) {
    let sender = ctx.sender();
    let nft = NonFungibleToken {
        id: object::new(ctx),
        name: string::utf8(name),
        description: string::utf8(description),
        url: url::new_unsafe_from_bytes(url),
    };

    event::emit(NFTMinted {
        object_id: object::id(&nft),
        creator: sender,
        name: nft.name,
    });

    transfer::public_transfer(nft, sender)
}

public fun transfer(nft: NonFungibleToken, recipient: address, _: &mut TxContext) {
    transfer::public_transfer(nft, recipient)
}

public fun update_description(
    nft: &mut NonFungibleToken,
    new_description: vector<u8>,
    _: &mut TxContext,
) {
    nft.description = string::utf8(new_description);
}

public fun burn(nft: NonFungibleToken, _: &mut TxContext) {
    let NonFungibleToken {id, name: _, description: _, url: _} = nft;
    object::delete(id);
}

// ====== Tests ======
#[test_only]
use sui::test_scenario as ts;

#[test_only]
const CREATOR: address = @0xA11CE;
#[test_only]
const USER: address = @0xB0B;

#[test_only]
const NAME: vector<u8> = b"Cool NFT";
#[test_only]
const DESCRIPTION: vector<u8> = b"This is a cool NFT";
#[test_only]
const URL_BYTES: vector<u8> = b"https://example.com/nft.png";
#[test_only]
const NEW_DESCRIPTION: vector<u8> = b"Updated description";

#[test_only]
fun mint_nft_scenario(): ts::Scenario {
    let mut scenario = ts::begin(CREATOR);
    
    {
        let ctx = ts::ctx(&mut scenario);
        mint_to_sender(NAME, DESCRIPTION, URL_BYTES, ctx);
    };

    scenario
}

#[test]
fun test_mint_nft() {
    let mut scenario = mint_nft_scenario();
    
    ts::next_tx(&mut scenario, CREATOR);
    {
        let nft_val = ts::take_from_sender<NonFungibleToken>(&scenario);
        
        assert!(
            string::to_ascii(*name(&nft_val)) == string::to_ascii(string::utf8(NAME)), 
            0
        );
        assert!(
            string::to_ascii(*description(&nft_val)) == string::to_ascii(string::utf8(DESCRIPTION)), 
            0
        );
        assert!(
            string::utf8(ascii::into_bytes(url::inner_url(url(&nft_val)))) 
            == string::utf8(URL_BYTES), 
            0
        );
        
        ts::return_to_sender(&scenario, nft_val);
    };
    
    ts::end(scenario);
}

#[test]
fun test_transfer_nft() {
    let mut scenario = mint_nft_scenario();
    
    ts::next_tx(&mut scenario, CREATOR);
    {
        let nft_val = ts::take_from_sender<NonFungibleToken>(&scenario);
        let ctx = ts::ctx(&mut scenario);
        transfer(nft_val, USER, ctx);
    };
    
    ts::next_tx(&mut scenario, USER);
    {
        let nft_val = ts::take_from_sender<NonFungibleToken>(&scenario);
        
        assert!(
            string::to_ascii(*name(&nft_val)) == string::to_ascii(string::utf8(NAME)), 
            0
        );
        assert!(
            string::to_ascii(*description(&nft_val)) == string::to_ascii(string::utf8(DESCRIPTION)), 
            0
        );
        
        ts::return_to_sender(&scenario, nft_val);
    };
    
    ts::end(scenario);
}

#[test]
fun test_update_description() {
    let mut scenario = mint_nft_scenario();
    
    ts::next_tx(&mut scenario, CREATOR);
    {
        let mut nft_val = ts::take_from_sender<NonFungibleToken>(&scenario);
        let ctx = ts::ctx(&mut scenario);
        
        update_description(&mut nft_val, NEW_DESCRIPTION, ctx);
        
        assert!(
            string::to_ascii(*description(&nft_val)) == string::to_ascii(string::utf8(NEW_DESCRIPTION)), 
            0
        );
        
        ts::return_to_sender(&scenario, nft_val);
    };
    
    ts::end(scenario);
}

#[test]
fun test_burn_nft() {
    let mut scenario = mint_nft_scenario();
    
    ts::next_tx(&mut scenario, CREATOR);
    {
        let nft_val = ts::take_from_sender<NonFungibleToken>(&scenario);
        let ctx = ts::ctx(&mut scenario);
        
        burn(nft_val, ctx);
    };
    
    ts::next_tx(&mut scenario, CREATOR);
    {
        assert!(
            !ts::has_most_recent_for_sender<NonFungibleToken>(&scenario), 
            0
        );
    };
    
    ts::end(scenario);
}

#[test]
fun test_accessor_functions() {
    let mut scenario = mint_nft_scenario();
    
    ts::next_tx(&mut scenario, CREATOR);
    {
        let nft_val = ts::take_from_sender<NonFungibleToken>(&scenario);
        
        let nft_name = name(&nft_val);
        let nft_desc = description(&nft_val);
        let nft_url = url(&nft_val);
        
        assert!(
            string::to_ascii(*nft_name) == string::to_ascii(string::utf8(NAME)), 
            0
        );
        assert!(
            string::to_ascii(*nft_desc) == string::to_ascii(string::utf8(DESCRIPTION)), 
            0
        );
        assert!(
            string::utf8(ascii::into_bytes(url::inner_url(nft_url))) 
            == string::utf8(URL_BYTES), 
            0
        );
        
        ts::return_to_sender(&scenario, nft_val);
    };
    
    ts::end(scenario);
}