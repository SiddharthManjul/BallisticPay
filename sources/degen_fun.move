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