import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { 
  useCurrentAccount, 
  useSignAndExecuteTransaction, 
  useSuiClient, 
  useConnectWallet, 
  useDisconnectWallet 
} from '@mysten/dapp-kit';
import { SuiTransactionBlockResponse } from '@mysten/sui/client';

// Define wallet provider interface
interface WalletProviderProps {
  children: ReactNode;
}

// Define wallet context interface - keeping the same interface as before
interface WalletContextType {
  connected: boolean;
  connecting: boolean;
  address: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  signAndExecuteTransaction: (transaction: unknown) => Promise<unknown>;
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

// Export WalletContext for the hook
export { WalletContext };

// Wallet provider component
export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  // Use dapp-kit hooks
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const { mutate: connectWallet, isPending: isConnecting } = useConnectWallet();
  const { mutate: disconnectWallet } = useDisconnectWallet();
  const { mutate: signAndExecuteTransactionMutation } = useSignAndExecuteTransaction();

  // Determine if connected based on currentAccount
  const connected = !!currentAccount;
  
  // Get address from currentAccount
  const address = currentAccount?.address || null;

  // Connect wallet function - adapted to use dapp-kit
  const connect = async () => {
    try {
      connectWallet();
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    }
  };

  // Disconnect wallet function - adapted to use dapp-kit
  const disconnect = () => {
    disconnectWallet();
  };

  // Sign and execute transaction function - adapted to use dapp-kit
  const signAndExecuteTransaction = async (transaction: unknown) => {
    if (!connected || !currentAccount) {
      throw new Error('Wallet not connected');
    }

    try {
      // Use the correct mutation with proper arguments
      const response = await new Promise<SuiTransactionBlockResponse>((resolve, reject) => {
        signAndExecuteTransactionMutation(
          {
            transaction: transaction as any,
            options: {
              showEffects: true,
              showEvents: true,
            },
          },
          {
            onSuccess: (data) => resolve(data),
            onError: (error) => reject(error),
          }
        );
      });
      
      return response;
    } catch (error) {
      console.error('Error executing transaction:', error);
      throw error;
    }
  };

  // Context value - keeping the same structure as before
  const value: WalletContextType = {
    connected,
    connecting: isConnecting,
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

// Custom hook for using the wallet context (keeping this for backward compatibility)
export const useWallet = () => useContext(WalletContext);

export default WalletProvider;
