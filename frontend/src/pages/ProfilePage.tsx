import React, { useState, useEffect, useContext } from 'react';
import { useNFT } from '../context/NFTContext';
import { WalletContext } from '../context/WalletContext';
import { Link } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const { connected, connect, address } = useContext(WalletContext);
  const { userNFTs, fetchUserNFTs, loadingNFTs, listNFT, unlistNFT } = useNFT();
  
  const [activeTab, setActiveTab] = useState<'collected' | 'created' | 'listed'>('collected');
  const [isListing, setIsListing] = useState<string | null>(null);
  const [isUnlisting, setIsUnlisting] = useState<string | null>(null);
  const [listingPrice, setListingPrice] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Fetch user NFTs on component mount and when wallet connects
  useEffect(() => {
    if (connected) {
      fetchUserNFTs();
    }
  }, [connected, fetchUserNFTs]);
  
  // Filter NFTs based on active tab
  const filteredNFTs = userNFTs.filter(nft => {
    if (activeTab === 'collected') return true;
    if (activeTab === 'created') return nft.creator === address;
    if (activeTab === 'listed') return nft.listed;
    return true;
  });
  
  // Handle NFT listing
  const handleListNFT = async (nftId: string) => {
    if (!connected) {
      setError('Please connect your wallet');
      return;
    }
    
    if (!listingPrice || parseFloat(listingPrice) <= 0) {
      setError('Please enter a valid price');
      return;
    }
    
    setIsListing(nftId);
    setError(null);
    
    try {
      const result = await listNFT(nftId, listingPrice);
      
      if (result) {
        setSuccess(`Successfully listed NFT for ${listingPrice} SUI!`);
        setListingPrice('');
        
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
      setIsListing(null);
    }
  };
  
  // Handle NFT unlisting
  const handleUnlistNFT = async (nftId: string) => {
    if (!connected) {
      setError('Please connect your wallet');
      return;
    }
    
    setIsUnlisting(nftId);
    setError(null);
    
    try {
      const result = await unlistNFT(nftId);
      
      if (result) {
        setSuccess('Successfully unlisted NFT!');
        
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
      setIsUnlisting(null);
    }
  };
  
  if (!connected) {
    return (
      <div className="retro-container py-12">
        <div className="retro-card p-8 text-center max-w-md mx-auto">
          <h1 className="font-pixel text-2xl mb-6 text-[var(--retro-accent)]">MY NFTs</h1>
          <p className="font-mono mb-6">Connect your wallet to view your NFTs</p>
          <button 
            onClick={connect}
            className="retro-btn bg-[var(--retro-primary)]"
          >
            CONNECT WALLET
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="retro-container py-8">
      <h1 className="font-pixel text-3xl mb-8 text-center text-[var(--retro-accent)]">MY NFTs</h1>
      
      {/* Wallet Info */}
      <div className="retro-card p-4 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div>
            <p className="font-mono text-sm text-[var(--retro-gray)]">Connected Wallet</p>
            <p className="font-mono truncate max-w-xs">
              {address}
            </p>
          </div>
          
          <Link to="/create" className="retro-btn bg-[var(--retro-secondary)] mt-4 sm:mt-0">
            CREATE NEW NFT
          </Link>
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
      
      {/* Tabs */}
      <div className="flex border-b-[3px] border-[var(--retro-white)] mb-6">
        <button
          onClick={() => setActiveTab('collected')}
          className={`px-4 py-2 font-pixel ${
            activeTab === 'collected' 
              ? 'bg-[var(--retro-accent)] text-[var(--retro-black)]' 
              : 'text-[var(--retro-white)]'
          }`}
        >
          ALL
        </button>
        <button
          onClick={() => setActiveTab('created')}
          className={`px-4 py-2 font-pixel ${
            activeTab === 'created' 
              ? 'bg-[var(--retro-accent)] text-[var(--retro-black)]' 
              : 'text-[var(--retro-white)]'
          }`}
        >
          CREATED
        </button>
        <button
          onClick={() => setActiveTab('listed')}
          className={`px-4 py-2 font-pixel ${
            activeTab === 'listed' 
              ? 'bg-[var(--retro-accent)] text-[var(--retro-black)]' 
              : 'text-[var(--retro-white)]'
          }`}
        >
          LISTED
        </button>
      </div>
      
      {/* NFT Grid */}
      {loadingNFTs ? (
        <div className="text-center py-12">
          <p className="font-pixel text-xl text-[var(--retro-accent)] animate-pulse">LOADING...</p>
        </div>
      ) : filteredNFTs.length === 0 ? (
        <div className="retro-card p-8 text-center">
          <p className="font-pixel text-xl mb-4">NO NFTs FOUND</p>
          {activeTab === 'collected' && (
            <p className="font-mono mb-6">You don't own any NFTs yet.</p>
          )}
          {activeTab === 'created' && (
            <p className="font-mono mb-6">You haven't created any NFTs yet.</p>
          )}
          {activeTab === 'listed' && (
            <p className="font-mono mb-6">You don't have any NFTs listed for sale.</p>
          )}
          
          <Link to="/create" className="retro-btn bg-[var(--retro-secondary)]">
            CREATE NFT
          </Link>
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
                {nft.listed && (
                  <div className="absolute top-2 right-2 bg-[var(--retro-primary)] px-2 py-1 font-pixel text-xs">
                    FOR SALE
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <h3 className="font-pixel text-lg mb-2 truncate text-[var(--retro-accent)]">
                  {nft.name}
                </h3>
                
                <p className="font-mono text-sm mb-3 line-clamp-2">
                  {nft.description}
                </p>
                
                {nft.listed ? (
                  <div className="mb-4">
                    <p className="font-mono text-xs text-[var(--retro-gray)]">Price</p>
                    <p className="font-pixel text-[var(--retro-primary)]">{nft.price} SUI</p>
                  </div>
                ) : null}
                
                <div className="flex space-x-2">
                  <Link 
                    to={`/nft/${nft.id}`}
                    className="retro-btn bg-[var(--retro-secondary)] text-xs flex-1 text-center"
                  >
                    DETAILS
                  </Link>
                  
                  {nft.listed ? (
                    <button
                      onClick={() => handleUnlistNFT(nft.id)}
                      disabled={isUnlisting === nft.id}
                      className={`retro-btn bg-[var(--retro-warning)] text-xs flex-1 ${
                        isUnlisting === nft.id ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isUnlisting === nft.id ? 'UNLISTING...' : 'UNLIST'}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setListingPrice('');
                        document.getElementById(`listing-modal-${nft.id}`)?.classList.remove('hidden');
                      }}
                      className="retro-btn bg-[var(--retro-success)] text-xs flex-1"
                    >
                      LIST FOR SALE
                    </button>
                  )}
                </div>
              </div>
              
              {/* Listing Modal */}
              <div id={`listing-modal-${nft.id}`} className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="retro-card max-w-md w-full p-6">
                  <h3 className="font-pixel text-xl mb-4 text-[var(--retro-accent)]">LIST NFT FOR SALE</h3>
                  
                  <div className="mb-4">
                    <label className="block font-pixel mb-2 text-[var(--retro-accent)]">
                      PRICE (SUI)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={listingPrice}
                      onChange={(e) => setListingPrice(e.target.value)}
                      className="retro-input w-full"
                      placeholder="Enter price in SUI"
                    />
                  </div>
                  
                  <div className="flex space-x-4">
                    <button
                      onClick={() => document.getElementById(`listing-modal-${nft.id}`)?.classList.add('hidden')}
                      className="retro-btn bg-[var(--retro-error)] flex-1"
                    >
                      CANCEL
                    </button>
                    
                    <button
                      onClick={() => {
                        handleListNFT(nft.id);
                        document.getElementById(`listing-modal-${nft.id}`)?.classList.add('hidden');
                      }}
                      disabled={isListing === nft.id}
                      className={`retro-btn bg-[var(--retro-success)] flex-1 ${
                        isListing === nft.id ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isListing === nft.id ? 'LISTING...' : 'CONFIRM'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
