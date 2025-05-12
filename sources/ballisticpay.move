module ballistic_pay::pyth_price;

    use std::string::{Self, String};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::event;
    use sui::clock;
    use pyth::price;
    use pyth::price_info::PriceInfoObject
    use pyth::price_feed::{Self, PriceFeed};
    use pyth::price_identifier::{Self};
    use pyth::i64::{Self};
    use pyth::pyth;
    use pyth::state;

    // Error codes
    const EInsufficientBalance: u64 = 0;
    const EInvalidPriceFeed: u64 = 1;
    const EPriceFeedNotUpdated: u64 = 2;
    const EInvalidAmount: u64 = 3;
    const EPriceNegative: u64 = 4;

    // Supported Price Feeds: SUI/USD, BTC/USD, ETH/USD
    const SUI_USD_PRICE_FEED_ID: vector<u8> = x"50c67b3fd225db8912a424dd4baed60ffdde625ed2feaaf283724f9608fea266";
    const BTC_USD_PRICE_FEED_ID: vector<u8> = x"f9c0172ba10dfa4d19088d94f5bf61d3b54d5bd7483a322a982e1373ee8ea31b";
    const ETH_USD_PRICE_FEED_ID: vector<u8> = x"754a0a0800247d77751e35efb91638c828046103be3bb3d26989e65bf4010859";

    // Events
    public struct TransferEvent has copy, drop {
        sender: address,
        recipient: address,
        usd_amount: u64,
        crypto_amount: u64,
        price_feed_id: vector<u8>,
        timestamp: u64,
    }

    // Contract state object
    public struct PriceFeedTransfer has key {
        id: UID,
        owner: address,
        supported_feeds: vector<vector<u8>>,
    }

    // Contract Initialization
    fun init(ctx: &mut TxContext) {
        let mut supported_feeds = vector::empty<vector<u8>>();
        vector::push_back(&mut supported_feeds, SUI_USD_PRICE_FEED_ID);
        vector::push_back(&mut supported_feeds, BTC_USD_PRICE_FEED_ID);
        vector::push_back(&mut supported_feeds, ETH_USD_PRICE_FEED_ID);

        let price_feed_transfer = PriceFeedTransfer {
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
            supported_feeds: supported_feeds,
        };

        transfer::share_object(price_feed_transfer);
    }

    // Get supported price feeds
    public fun get_supported_feeds(self: &PriceFeedTransfer): vector<vector<u8>> {
        self.supported_feeds
    }

    // Get price from an updated Pyth price feed
    public fun get_price_from_feed(price_feed: &PriceFeed, ctx: &TxContext): u64 {
        let price = price_feed::get_price(price_feed);
        let price_i64 = price::get_price(&price);

        // Assertion: Price must be valid & positive
        assert!(price::get_timestamp(&price) == tx_context::epoch_timestamp_ms(ctx), EPriceFeedNotUpdated);
        assert!(!i64::get_is_negative(&price_i64), EPriceNegative);

        // Get the price value and exponent
        let price_value = i64::get_magnitude_if_positive(&price::get_price(&price));
        let exponent = i64::get_magnitude_if_positive(&price::get_expo(&price));
        
        // Convert price to USD (handle exponent)
        let mut price_in_usd = price_value;
        if (i64::get_is_negative(&price::get_expo(&price))) {
            // If exponent is negative, divide by 10^|exponent|
            let mut divisor = 1u64;
            let mut i = 0;
            while (i < exponent) {
                divisor = divisor * 10;
                i = i + 1;
            };
            price_in_usd = price_value / divisor;
        } else {
            // If exponent is positive, multiply by 10^exponent
            let mut multiplier = 1u64;
            let mut i = 0;
            while (i < exponent) {
                multiplier = multiplier * 10;
                i = i + 1;
            };
            price_in_usd = price_value * multiplier;
        };
        
        price_in_usd
    }

    public fun get_ballistic_pay_price_feed(pyth_state: &state::State, price_feed_id: vector<u8>, ctx: &TxContext): u64 {
    // Convert byte vector to price identifier
    let price_identifier = price_identifier::from_byte_vec(price_feed_id);
    
    // Get price feed from pyth state using the identifier
    let price_feed_option = pyth::get_price_feed(pyth_state, price_identifier);
    
    // Ensure price feed exists
    assert!(option::is_some(&price_feed_option), 1); // Error code 1 for invalid price feed
    
    // Extract the price feed
    let price_feed = option::borrow(&price_feed_option);
    
    // Get price from the feed
    let price = get_price_from_feed(price_feed, ctx);
    
    price
}

