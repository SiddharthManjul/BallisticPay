import React, { useContext, useEffect } from 'react';
import { useNFT } from '../context/NFTContext';
import { WalletContext } from '../context/WalletContext';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  const { fetchListedNFTs, listedNFTs, loadingNFTs } = useNFT();
  const { connected, connect } = useContext(WalletContext);
  
  // Fetch NFTs on component mount
  useEffect(() => {
    fetchListedNFTs();
  }, [fetchListedNFTs]);
  
  // Get featured NFTs (just take the first 4 for now)
  const featuredNFTs = listedNFTs.slice(0, 4);
  
  return (
    <div className="crt-screen">
      {/* Hero Section */}
      <div className="bg-[var(--retro-dark-gray)] border-b-[3px] border-[var(--retro-white)]">
        <div className="retro-container py-12 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="font-pixel text-3xl md:text-4xl lg:text-5xl mb-6 text-[var(--retro-accent)]">
                RETRO NFT MARKETPLACE
              </h1>
              
              <p className="font-mono text-lg mb-8">
                Create, collect, and trade unique digital assets on the Sui blockchain with Walrus metadata storage.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/marketplace" className="retro-btn bg-[var(--retro-primary)] text-center px-8 py-3">
                  EXPLORE MARKETPLACE
                </Link>
                
                {!connected ? (
                  <button 
                    onClick={connect}
                    className="retro-btn bg-[var(--retro-secondary)] px-8 py-3"
                  >
                    CONNECT WALLET
                  </button>
                ) : (
                  <Link to="/create" className="retro-btn bg-[var(--retro-secondary)] text-center px-8 py-3">
                    CREATE NFT
                  </Link>
                )}
              </div>
            </div>
            
            <div className="hidden md:block">
              <div className="pixel-border relative">
                <div className="grid grid-cols-2 gap-4">
                  <div className="aspect-square bg-[var(--retro-primary)] p-2">
                    <div className="w-full h-full border-[3px] border-[var(--retro-white)]"></div>
                  </div>
                  <div className="aspect-square bg-[var(--retro-secondary)] p-2">
                    <div className="w-full h-full border-[3px] border-[var(--retro-white)]"></div>
                  </div>
                  <div className="aspect-square bg-[var(--retro-accent)] p-2">
                    <div className="w-full h-full border-[3px] border-[var(--retro-white)]"></div>
                  </div>
                  <div className="aspect-square bg-[var(--retro-success)] p-2">
                    <div className="w-full h-full border-[3px] border-[var(--retro-white)]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Featured NFTs Section */}
      <div className="retro-container py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-pixel text-2xl text-[var(--retro-accent)]">FEATURED NFTs</h2>
          <Link to="/marketplace" className="font-mono text-[var(--retro-accent)] hover:underline">
            View All →
          </Link>
        </div>
        
        {loadingNFTs ? (
          <div className="text-center py-12">
            <p className="font-pixel text-xl text-[var(--retro-accent)] animate-pulse">LOADING...</p>
          </div>
        ) : featuredNFTs.length === 0 ? (
          <div className="retro-card p-8 text-center">
            <p className="font-pixel text-xl mb-4">NO NFTs AVAILABLE YET</p>
            <p className="font-mono mb-6">Be the first to create and list an NFT!</p>
            
            {!connected ? (
              <button 
                onClick={connect}
                className="retro-btn bg-[var(--retro-primary)]"
              >
                Connect Wallet
              </button>
            ) : (
              <Link to="/create" className="retro-btn bg-[var(--retro-secondary)]">
                Create NFT
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredNFTs.map((nft) => (
              <Link key={nft.id} to={`/nft/${nft.id}`} className="retro-card overflow-hidden hover:transform hover:-translate-y-1 transition-transform">
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
                  
                  <div className="flex justify-between items-center">
                    <p className="font-pixel text-[var(--retro-primary)]">{nft.price} SUI</p>
                    <p className="font-mono text-xs truncate max-w-[100px]">
                      {nft.creator.substring(0, 4)}...
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      
      {/* How It Works Section */}
      <div className="bg-[var(--retro-dark-gray)] border-y-[3px] border-[var(--retro-white)]">
        <div className="retro-container py-12">
          <h2 className="font-pixel text-2xl text-center mb-12 text-[var(--retro-accent)]">HOW IT WORKS</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="retro-card p-6 text-center">
              <div className="font-pixel text-4xl mb-4 text-[var(--retro-primary)]">1</div>
              <h3 className="font-pixel text-lg mb-4 text-[var(--retro-accent)]">CONNECT WALLET</h3>
              <p className="font-mono">
                Connect your Sui wallet to get started with creating and trading NFTs.
              </p>
            </div>
            
            <div className="retro-card p-6 text-center">
              <div className="font-pixel text-4xl mb-4 text-[var(--retro-secondary)]">2</div>
              <h3 className="font-pixel text-lg mb-4 text-[var(--retro-accent)]">CREATE OR BUY</h3>
              <p className="font-mono">
                Create your own unique NFTs or browse the marketplace to buy from others.
              </p>
            </div>
            
            <div className="retro-card p-6 text-center">
              <div className="font-pixel text-4xl mb-4 text-[var(--retro-success)]">3</div>
              <h3 className="font-pixel text-lg mb-4 text-[var(--retro-accent)]">COLLECT & TRADE</h3>
              <p className="font-mono">
                Build your collection and trade NFTs in our secure marketplace.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Walrus Integration Section */}
      <div className="retro-container py-12">
        <div className="retro-card p-8">
          <h2 className="font-pixel text-2xl mb-6 text-center text-[var(--retro-accent)]">POWERED BY SUI WALRUS</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="font-mono mb-4">
                Our marketplace uses Sui Walrus for decentralized metadata storage, ensuring your NFTs are truly yours with enhanced security and permanence.
              </p>
              
              <p className="font-mono mb-6">
                Unlike traditional NFT platforms that rely on centralized storage or IPFS, Sui Walrus provides a robust, blockchain-native solution for storing your valuable digital assets.
              </p>
              
              <div className="flex space-x-4">
                <div className="retro-card bg-[var(--retro-dark-gray)] p-3 flex-1 text-center">
                  <p className="font-mono text-xs text-[var(--retro-gray)] mb-1">
                    Decentralized
                  </p>
                </div>
                
                <div className="retro-card bg-[var(--retro-dark-gray)] p-3 flex-1 text-center">
                  <p className="font-mono text-xs text-[var(--retro-gray)] mb-1">
                    Secure
                  </p>
                </div>
                
                <div className="retro-card bg-[var(--retro-dark-gray)] p-3 flex-1 text-center">
                  <p className="font-mono text-xs text-[var(--retro-gray)] mb-1">
                    Permanent
                  </p>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="inline-block pixel-border p-4 bg-[var(--retro-dark-gray)]">
                <div className="font-pixel text-4xl text-[var(--retro-accent)]">WALRUS</div>
                <div className="font-mono text-sm mt-2">Decentralized Storage</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="bg-[var(--retro-primary)] border-y-[3px] border-[var(--retro-white)]">
        <div className="retro-container py-12 text-center">
          <h2 className="font-pixel text-2xl mb-6 text-[var(--retro-white)]">
            READY TO START YOUR NFT JOURNEY?
          </h2>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/marketplace" className="retro-btn bg-[var(--retro-black)] text-center px-8 py-3">
              EXPLORE MARKETPLACE
            </Link>
            
            {!connected ? (
              <button 
                onClick={connect}
                className="retro-btn bg-[var(--retro-accent)] text-[var(--retro-black)] px-8 py-3"
              >
                CONNECT WALLET
              </button>
            ) : (
              <Link to="/create" className="retro-btn bg-[var(--retro-accent)] text-[var(--retro-black)] text-center px-8 py-3">
                CREATE NFT
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
