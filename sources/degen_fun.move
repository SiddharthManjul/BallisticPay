module degen_fun::fungible_token;

use std::string;
use sui::{event, url::{Self, Url}};

public struct FunglibleToken has key, store {
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

public fun name(nft: &FunglibleToken): &string::String {
    &nft.name
}

public fun description(nft: &FunglibleToken): &string::String {
    &nft.description
}

public fun url(nft: &FunglibleToken): &Url {
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
    let nft = FunglibleToken {
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

public fun transfer(nft: FunglibleToken, recipient: address, _: &mut TxContext) {
    transfer::public_transfer(nft, recipient)
}

public fun update_description(
    nft: &mut FunglibleToken,
    new_description: vector<u8>,
    _: &mut TxContext,
) {
    nft.description = string::utf8(new_description);
}

public fun burn(nft: FunglibleToken, _: &mut TxContext) {
    let FunglibleToken {id, name: _, description: _, url: _} = nft;
    id.delete();
}