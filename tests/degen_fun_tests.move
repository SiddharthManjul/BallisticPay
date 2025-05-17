#[test_only]
module degen_fun::degen_fun_tests;

use degen_fun::non_fungible_token::{
    NonFungibleToken, 
    mint_to_sender, 
    transfer, 
    update_description, 
    burn, 
    name, 
    description, 
    url
};
use std::{string, ascii};
use sui::{ 
    url::{Self}, 
};
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
