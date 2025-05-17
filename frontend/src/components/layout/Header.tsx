import React from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../../context/WalletContext';

const Header: React.FC = () => {
  const { connected, address, connect, disconnect } = useWallet();

  return (
    <header className="retro-navbar sticky top-0 z-50">
      <div className="flex items-center">
        <Link to="/" className="font-pixel text-xl text-[var(--retro-accent)]">
          SUI NFT MARKET
        </Link>
      </div>
      
      <nav className="hidden md:block">
        <ul className="flex space-x-6">
          <li>
            <Link to="/" className="font-mono hover:text-[var(--retro-accent)] transition-colors">
              Home
            </Link>
          </li>
          <li>
            <Link to="/marketplace" className="font-mono hover:text-[var(--retro-accent)] transition-colors">
              Marketplace
            </Link>
          </li>
          <li>
            <Link to="/create" className="font-mono hover:text-[var(--retro-accent)] transition-colors">
              Create NFT
            </Link>
          </li>
          <li>
            <Link to="/profile" className="font-mono hover:text-[var(--retro-accent)] transition-colors">
              My NFTs
            </Link>
          </li>
        </ul>
      </nav>
      
      <div>
        {connected ? (
          <div className="flex items-center space-x-2">
            <span className="font-mono text-sm truncate max-w-[120px]">
              {address?.substring(0, 6)}...{address?.substring(address.length - 4)}
            </span>
            <button 
              onClick={disconnect}
              className="retro-btn bg-[var(--retro-error)] text-xs py-1"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button 
            onClick={connect}
            className="retro-btn bg-[var(--retro-success)] text-sm"
          >
            Connect Wallet
          </button>
        )}
      </div>
      
      {/* Mobile menu button */}
      <button className="md:hidden retro-btn p-1">
        <span className="sr-only">Open menu</span>
        ≡
      </button>
    </header>
  );
};

export default Header;
