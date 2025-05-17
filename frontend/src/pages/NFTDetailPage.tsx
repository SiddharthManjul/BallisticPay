import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useNFT } from '../context/NFTContext';
import { WalletContext } from '../context/WalletContext';

// Define interfaces for our types
interface NFTAttribute {
  trait_type: string;
  value: string | number;
}

interface NFTMetadata {
  attributes?: NFTAttribute[];
  [key: string]: unknown;
}

interface NFT {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  creator: string;
  owner: string;
  listed: boolean;
  price: string;
  metadata: NFTMetadata;
}

// Define the types for our context
interface NFTContextType {
  getNFTById: (id: string) => NFT | undefined;
  buyNFT: (id: string) => Promise<boolean>;
  listNFT: (id: string, price: string) => Promise<boolean>;
  unlistNFT: (id: string) => Promise<boolean>;
  fetchNFTs: () => Promise<void>;
}

interface WalletContextType {
  connected: boolean;
  connect: () => Promise<void>;
  address: string | null;
}

const NFTDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getNFTById, buyNFT, listNFT, unlistNFT, fetchNFTs } = useNFT() as NFTContextType;
  const { connected, connect, address } = useContext(WalletContext) as WalletContextType;
  
  const [nft, setNft] = useState<NFT | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isPurchasing, setIsPurchasing] = useState<boolean>(false);
  const [isListing, setIsListing] = useState<boolean>(false);
  const [isUnlisting, setIsUnlisting] = useState<boolean>(false);
  const [listingPrice, setListingPrice] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Fetch NFT data
  useEffect(() => {
    const loadNFT = async () => {
      setLoading(true);
      try {
        await fetchNFTs();
        const nftData = getNFTById(id || '');
        if (nftData) {
          setNft(nftData);
        }
      } catch (error) {
        console.error('Error loading NFT:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadNFT();
  }, [id, getNFTById, fetchNFTs]);
  
  // Handle NFT purchase
  const handleBuyNFT = async () => {
    if (!connected) {
      setError('Please connect your wallet to make a purchase');
      return;
    }
    
    if (!id) return;
    
    setIsPurchasing(true);
    setError(null);
    
    try {
      const result = await buyNFT(id);
      
      if (result) {
        setSuccess(`Successfully purchased ${nft?.name || 'NFT'}!`);
        
        // Update NFT data
        const updatedNFT = getNFTById(id);
        if (updatedNFT) {
          setNft(updatedNFT);
        }
        
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
      setIsPurchasing(false);
    }
  };
  
  // Handle NFT listing
  const handleListNFT = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!connected) {
      setError('Please connect your wallet');
      return;
    }
    
    if (!id) return;
    
    if (!listingPrice || parseFloat(listingPrice) <= 0) {
      setError('Please enter a valid price');
      return;
    }
    
    setIsListing(true);
    setError(null);
    
    try {
      const result = await listNFT(id, listingPrice);
      
      if (result) {
        setSuccess(`Successfully listed ${nft?.name || 'NFT'} for ${listingPrice} SUI!`);
        
        // Update NFT data
        const updatedNFT = getNFTById(id);
        if (updatedNFT) {
          setNft(updatedNFT);
        }
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          setSuccess(null);
        }, 5000);
      } else {
        setError('Transaction failed. Please try again.');
      }
    } catch (error) {
      console.error('Error listing NFT:', error);
      setError('Failed to list NFT. Please try again.');
    } finally {
      setIsListing(false);
    }
  };
  
  // Handle NFT unlisting
  const handleUnlistNFT = async () => {
    if (!connected) {
      setError('Please connect your wallet');
      return;
    }
    
    if (!id) return;
    
    setIsUnlisting(true);
    setError(null);
    
    try {
      const result = await unlistNFT(id);
      
      if (result) {
        setSuccess(`Successfully unlisted ${nft?.name || 'NFT'}!`);
        
        // Update NFT data
        const updatedNFT = getNFTById(id);
        if (updatedNFT) {
          setNft(updatedNFT);
        }
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          setSuccess(null);
        }, 5000);
      } else {
        setError('Transaction failed. Please try again.');
      }
    } catch (error) {
      console.error('Error unlisting NFT:', error);
      setError('Failed to unlist NFT. Please try again.');
    } finally {
      setIsUnlisting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="retro-container py-12 text-center">
        <p className="font-pixel text-xl text-[var(--retro-accent)] animate-pulse">LOADING NFT...</p>
      </div>
    );
  }
  
  if (!nft) {
    return (
      <div className="retro-container py-12">
        <div className="retro-card p-8 text-center">
          <p className="font-pixel text-xl mb-4">NFT NOT FOUND</p>
          <p className="font-mono mb-6">The NFT you're looking for doesn't exist or has been removed.</p>
          <Link to="/marketplace" className="retro-btn bg-[var(--retro-secondary)]">
            BACK TO MARKETPLACE
          </Link>
        </div>
      </div>
    );
  }
  
  const isOwner = connected && address === nft.owner;
  
  return (
    <div className="retro-container py-8">
      <div className="mb-6">
        <Link to="/marketplace" className="font-mono text-[var(--retro-accent)] hover:underline">
          ← Back to Marketplace
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* NFT Image */}
        <div className="retro-card p-4">
          <div className="relative pb-[100%] overflow-hidden border-[3px] border-[var(--retro-white)]">
            <img 
              src={nft.imageUrl} 
              alt={nft.name}
              className="absolute inset-0 w-full h-full object-contain"
            />
          </div>
        </div>
        
        {/* NFT Details */}
        <div>
          <div className="retro-card p-6 mb-6">
            <h1 className="font-pixel text-2xl mb-4 text-[var(--retro-accent)]">{nft.name}</h1>
            
            <div className="mb-4">
              <p className="font-mono text-sm text-[var(--retro-gray)]">Creator</p>
              <p className="font-mono">
                {nft.creator.substring(0, 6)}...{nft.creator.substring(nft.creator.length - 4)}
              </p>
            </div>
            
            <div className="mb-4">
              <p className="font-mono text-sm text-[var(--retro-gray)]">Owner</p>
              <p className="font-mono">
                {nft.owner.substring(0, 6)}...{nft.owner.substring(nft.owner.length - 4)}
              </p>
            </div>
            
            {nft.listed && (
              <div className="mb-6">
                <p className="font-mono text-sm text-[var(--retro-gray)]">Price</p>
                <p className="font-pixel text-xl text-[var(--retro-primary)]">{nft.price} SUI</p>
              </div>
            )}
            
            <div className="mb-6">
              <p className="font-mono text-sm text-[var(--retro-gray)] mb-2">Description</p>
              <p className="font-mono">{nft.description}</p>
            </div>
            
            {/* Action Buttons */}
            {!connected ? (
              <button 
                onClick={connect}
                className="retro-btn bg-[var(--retro-primary)] w-full"
              >
                CONNECT WALLET
              </button>
            ) : isOwner ? (
              nft.listed ? (
                <button
                  onClick={handleUnlistNFT}
                  disabled={isUnlisting}
                  className={`retro-btn bg-[var(--retro-warning)] w-full ${
                    isUnlisting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isUnlisting ? 'UNLISTING...' : 'UNLIST NFT'}
                </button>
              ) : (
                <form onSubmit={handleListNFT} className="space-y-4">
                  <div>
                    <label className="block font-pixel mb-2 text-[var(--retro-accent)]">
                      LISTING PRICE (SUI)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={listingPrice}
                      onChange={(e) => setListingPrice(e.target.value)}
                      className="retro-input w-full"
                      placeholder="Enter price in SUI"
                      required
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isListing}
                    className={`retro-btn bg-[var(--retro-success)] w-full ${
                      isListing ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isListing ? 'LISTING...' : 'LIST FOR SALE'}
                  </button>
                </form>
              )
            ) : nft.listed ? (
              <button
                onClick={handleBuyNFT}
                disabled={isPurchasing}
                className={`retro-btn bg-[var(--retro-primary)] w-full ${
                  isPurchasing ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isPurchasing ? 'BUYING...' : `BUY FOR ${nft.price} SUI`}
              </button>
            ) : (
              <p className="font-pixel text-center text-[var(--retro-gray)]">
                NOT FOR SALE
              </p>
            )}
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
          
          {/* Attributes */}
          {nft.metadata.attributes && nft.metadata.attributes.length > 0 && (
            <div className="retro-card p-6">
              <h2 className="font-pixel text-lg mb-4 text-[var(--retro-accent)]">ATTRIBUTES</h2>
              
              <div className="grid grid-cols-2 gap-4">
                {nft.metadata.attributes.map((attr: NFTAttribute, index: number) => (
                  <div key={index} className="retro-card bg-[var(--retro-dark-gray)] p-3">
                    <p className="font-mono text-xs text-[var(--retro-gray)] mb-1">
                      {attr.trait_type}
                    </p>
                    <p className="font-pixel text-[var(--retro-accent)]">
                      {attr.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NFTDetailPage;