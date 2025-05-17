import React, { useState, useEffect, useContext } from 'react';
import { useNFT } from '../context/NFTContext';
import { WalletContext } from '../context/WalletContext';
import { Link } from 'react-router-dom';

const MarketplacePage: React.FC = () => {
  const { listedNFTs, loadingNFTs, fetchListedNFTs, buyNFT } = useNFT();
  const { connected, connect } = useContext(WalletContext);
  
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isPurchasing, setIsPurchasing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Fetch listed NFTs on component mount
  useEffect(() => {
    fetchListedNFTs();
  }, [fetchListedNFTs]);
  
  // Filter NFTs based on search term and category
  const filteredNFTs = listedNFTs.filter(nft => {
    const matchesSearch = 
      nft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nft.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedCategory === 'all') {
      return matchesSearch;
    }
    
    // Check if NFT has the selected category as an attribute
    const hasCategory = Array.isArray(nft.metadata.attributes) && nft.metadata.attributes.some(
      (attr: { trait_type: string; value: string }) => 
        attr.trait_type.toLowerCase() === 'category' && 
        attr.value.toLowerCase() === selectedCategory.toLowerCase()
    );
    
    return matchesSearch && hasCategory;
  });
  
  // Handle NFT purchase
  const handleBuyNFT = async (nftId: string) => {
    if (!connected) {
      setError('Please connect your wallet to make a purchase');
      return;
    }
    
    setIsPurchasing(nftId);
    setError(null);
    
    try {
      const result = await buyNFT(nftId);
      
      if (result) {
        const nft = listedNFTs.find(n => n.id === nftId);
        setSuccess(`Successfully purchased ${nft?.name || 'NFT'}!`);
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          setSuccess(null);
        }, 5000);
      } else {
        setError('Transaction failed. Please try again.');
      }
    } catch (error) {
      console.error('Error purchasing NFT:', error);
      setError('Failed to purchase NFT. Please try again.');
    } finally {
      setIsPurchasing(null);
    }
  };
  
  return (
    <div className="retro-container py-8">
      <h1 className="font-pixel text-3xl mb-8 text-center text-[var(--retro-accent)]">NFT MARKETPLACE</h1>
      
      {/* Search and Filter */}
      <div className="retro-card mb-8 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="retro-input w-full"
              placeholder="Search NFTs..."
            />
          </div>
          
          <div className="w-full md:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="retro-input w-full"
            >
              <option value="all">All Categories</option>
              <option value="art">Art</option>
              <option value="game">Game</option>
              <option value="music">Music</option>
              <option value="collectible">Collectible</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Status Messages */}
      {error && (
        <div className="retro-card bg-[var(--retro-error)] text-[var(--retro-white)] p-4 mb-6">
          <p className="font-mono">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="retro-card bg-[var(--retro-success)] text-[var(--retro-white)] p-4 mb-6">
          <p className="font-mono">{success}</p>
        </div>
      )}
      
      {/* NFT Grid */}
      {loadingNFTs ? (
        <div className="text-center py-12">
          <p className="font-pixel text-xl text-[var(--retro-accent)] animate-pulse">LOADING...</p>
        </div>
      ) : filteredNFTs.length === 0 ? (
        <div className="retro-card p-8 text-center">
          <p className="font-pixel text-xl mb-4">NO NFTS FOUND</p>
          <p className="font-mono">Try adjusting your search or filter criteria</p>
          
          {!connected && (
            <div className="mt-6">
              <p className="font-mono mb-4">Connect your wallet to create and list your own NFTs</p>
              <button 
                onClick={connect}
                className="retro-btn bg-[var(--retro-primary)]"
              >
                Connect Wallet
              </button>
            </div>
          )}
          
          {connected && (
            <div className="mt-6">
              <Link to="/create" className="retro-btn bg-[var(--retro-secondary)]">
                Create NFT
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="retro-grid">
          {filteredNFTs.map((nft) => (
            <div key={nft.id} className="retro-card overflow-hidden">
              <div className="relative pb-[100%] overflow-hidden border-b-[3px] border-[var(--retro-white)]">
                <img 
                  src={nft.imageUrl} 
                  alt={nft.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              
              <div className="p-4">
                <h3 className="font-pixel text-lg mb-2 truncate text-[var(--retro-accent)]">
                  {nft.name}
                </h3>
                
                <p className="font-mono text-sm mb-3 line-clamp-2">
                  {nft.description}
                </p>
                
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="font-mono text-xs text-[var(--retro-gray)]">Price</p>
                    <p className="font-pixel text-[var(--retro-primary)]">{nft.price} SUI</p>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-mono text-xs text-[var(--retro-gray)]">Creator</p>
                    <p className="font-mono text-xs truncate max-w-[100px]">
                      {nft.creator.substring(0, 6)}...{nft.creator.substring(nft.creator.length - 4)}
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Link 
                    to={`/nft/${nft.id}`}
                    className="retro-btn bg-[var(--retro-secondary)] text-xs flex-1 text-center"
                  >
                    DETAILS
                  </Link>
                  
                  <button
                    onClick={() => handleBuyNFT(nft.id)}
                    disabled={isPurchasing === nft.id || !connected}
                    className={`retro-btn bg-[var(--retro-primary)] text-xs flex-1 ${
                      (isPurchasing === nft.id || !connected) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isPurchasing === nft.id ? 'BUYING...' : 'BUY NOW'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Create NFT CTA */}
      {connected && filteredNFTs.length > 0 && (
        <div className="text-center mt-12">
          <Link to="/create" className="retro-btn bg-[var(--retro-secondary)] px-8 py-3">
            CREATE YOUR OWN NFT
          </Link>
        </div>
      )}
    </div>
  );
};

export default MarketplacePage;
