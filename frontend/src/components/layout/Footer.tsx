import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="retro-footer">
      <div className="retro-container">
        <p className="font-mono text-sm">
          &copy; {new Date().getFullYear()} SUI NFT MARKETPLACE | Powered by Sui Blockchain
        </p>
        <div className="mt-2 flex justify-center space-x-4">
          <a href="#" className="font-mono text-xs hover:text-[var(--retro-accent)]">Terms</a>
          <a href="#" className="font-mono text-xs hover:text-[var(--retro-accent)]">Privacy</a>
          <a href="#" className="font-mono text-xs hover:text-[var(--retro-accent)]">Help</a>
        </div>
        <div className="mt-4">
          <p className="font-pixel text-xs text-[var(--retro-accent)]">BUILT WITH SUI WALRUS</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
