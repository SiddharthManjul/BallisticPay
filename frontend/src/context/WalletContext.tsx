import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define wallet provider interface
interface WalletProviderProps {
  children: ReactNode;
}

// Define wallet context interface
interface WalletContextType {
  connected: boolean;
  connecting: boolean;
  address: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  signAndExecuteTransaction: (transaction: any) => Promise<any>;
}

// Create wallet context with default values
const WalletContext = createContext<WalletContextType>({
  connected: false,
  connecting: false,
  address: null,
  connect: async () => {},
  disconnect: () => {},
  signAndExecuteTransaction: async () => ({}),
});

// Hook to use wallet context
export const useWallet = () => useContext(WalletContext);

// Wallet provider component
export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [connected, setConnected] = useState<boolean>(false);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [address, setAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<unknown>(null);

  // Check if wallet is already connected on component mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Check if window.suiWallet exists (browser extension)
        if (typeof window !== 'undefined' && 'suiWallet' in window) {
          const wallet = (window as any).suiWallet;
          
          // Check if already connected
          const { connected, accounts } = await wallet.getAccounts();
          
          if (connected && accounts.length > 0) {
            setConnected(true);
            setAddress(accounts[0].address);
            setProvider(wallet);
          }
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    };

    checkConnection();
  }, []);

  // Connect wallet function
  const connect = async () => {
    try {
      setConnecting(true);
      
      // Check if wallet extension exists
      if (typeof window !== 'undefined' && 'suiWallet' in window) {
        const wallet = (window as any).suiWallet;
        
        // Request connection
        const { connected, accounts } = await wallet.requestPermissions();
        
        if (connected && accounts.length > 0) {
          setConnected(true);
          setAddress(accounts[0].address);
          setProvider(wallet);
        }
      } else {
        // Wallet extension not found
        alert('Sui wallet extension not found. Please install it to continue.');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    } finally {
      setConnecting(false);
    }
  };

  // Disconnect wallet function
  const disconnect = () => {
    setConnected(false);
    setAddress(null);
    setProvider(null);
  };

  // Sign and execute transaction function
  const signAndExecuteTransaction = async (transaction: any) => {
    if (!connected || !provider) {
      throw new Error('Wallet not connected');
    }

    try {
      // Sign and execute the transaction
      const response = await provider.signAndExecuteTransaction({
        transaction,
      });

      return response;
    } catch (error) {
      console.error('Error executing transaction:', error);
      throw error;
    }
  };

  // Context value
  const value: WalletContextType = {
    connected,
    connecting,
    address,
    connect,
    disconnect,
    signAndExecuteTransaction,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};
