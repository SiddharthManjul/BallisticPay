import React, { createContext, useContext, useState, ReactNode } from 'react';
import WalrusService from '../services/walrusService';
import { useWallet } from './WalletContext';

// NFT interface
export interface NFT {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  owner: string;
  creator: string;
  price?: string;
  listed: boolean;
  metadata: Record<string, any>;
  blobId: string;
}

// NFT context interface
interface NFTContextType {
  nfts: NFT[];
  userNFTs: NFT[];
  listedNFTs: NFT[];
  loadingNFTs: boolean;
  createNFT: (name: string, description: string, imageFile: File, attributes: Record<string, any>) => Promise<NFT>;
  listNFT: (nftId: string, price: string) => Promise<boolean>;
  unlistNFT: (nftId: string) => Promise<boolean>;
  buyNFT: (nftId: string) => Promise<boolean>;
  fetchNFTs: () => Promise<void>;
  fetchUserNFTs: () => Promise<void>;
  fetchListedNFTs: () => Promise<void>;
  getNFTById: (id: string) => NFT | undefined;
}

// NFT provider props
interface NFTProviderProps {
  children: ReactNode;
}

// Create NFT context with default values
const NFTContext = createContext<NFTContextType>({
  nfts: [],
  userNFTs: [],
  listedNFTs: [],
  loadingNFTs: false,
  createNFT: async () => ({ 
    id: '', 
    name: '', 
    description: '', 
    imageUrl: '', 
    owner: '', 
    creator: '', 
    listed: false, 
    metadata: {}, 
    blobId: '' 
  }),
  listNFT: async () => false,
  unlistNFT: async () => false,
  buyNFT: async () => false,
  fetchNFTs: async () => {},
  fetchUserNFTs: async () => {},
  fetchListedNFTs: async () => {},
  getNFTById: () => undefined,
});

// Hook to use NFT context
export const useNFT = () => useContext(NFTContext);

// NFT provider component
export const NFTProvider: React.FC<NFTProviderProps> = ({ children }) => {
  const [nfts, setNFTs] = useState<NFT[]>([]);
  const [userNFTs, setUserNFTs] = useState<NFT[]>([]);
  const [listedNFTs, setListedNFTs] = useState<NFT[]>([]);
  const [loadingNFTs, setLoadingNFTs] = useState<boolean>(false);
  
  const { connected, address, signAndExecuteTransaction } = useWallet();
  const walrusService = new WalrusService();

  // Create a new NFT
  const createNFT = async (
    name: string, 
    description: string, 
    imageFile: File, 
    attributes: Record<string, any>
  ): Promise<NFT> => {
    if (!connected || !address) {
      throw new Error('Wallet not connected');
    }

    try {
      // Upload image to Walrus
      const imageBlobId = await walrusService.storeImage(imageFile);
      const imageUrl = walrusService.getPublicUrl(imageBlobId);

      // Prepare metadata
      const metadata = {
        name,
        description,
        image: imageUrl,
        attributes: Object.entries(attributes).map(([trait_type, value]) => ({
          trait_type,
          value
        })),
        creator: address,
        created_at: new Date().toISOString()
      };

      // Store metadata on Walrus
      const metadataBlobId = await walrusService.storeMetadata(metadata);

      // Prepare transaction for minting NFT on Sui
      const transaction = {
        kind: 'moveCall',
        data: {
          packageObjectId: '0xdece5d51dc7abc7ecfd81251e0f624e5255663ef917a6950568d7986b21064cb',
          module: 'non_fungible_token',
          function: 'mint_to_sender',
          typeArguments: [],
          arguments: [
            name,
            description,
            metadataBlobId // Using the Walrus blob ID as the URL
          ],
          gasBudget: 10000
        }
      };

      // Sign and execute transaction
      const response = await signAndExecuteTransaction(transaction);
      
      // Extract NFT ID from transaction response
      const nftId = response.effects.created[0].reference.objectId;

      // Create NFT object
      const newNFT: NFT = {
        id: nftId,
        name,
        description,
        imageUrl,
        owner: address,
        creator: address,
        listed: false,
        metadata,
        blobId: metadataBlobId
      };

      // Update state
      setNFTs(prevNFTs => [...prevNFTs, newNFT]);
      setUserNFTs(prevUserNFTs => [...prevUserNFTs, newNFT]);

      return newNFT;
    } catch (error) {
      console.error('Error creating NFT:', error);
      throw new Error('Failed to create NFT');
    }
  };

  // List an NFT for sale
  const listNFT = async (nftId: string, price: string): Promise<boolean> => {
    if (!connected || !address) {
      throw new Error('Wallet not connected');
    }

    try {
      // Prepare transaction for listing NFT
      const transaction = {
        kind: 'moveCall',
        data: {
          packageObjectId: '0xdece5d51dc7abc7ecfd81251e0f624e5255663ef917a6950568d7986b21064cb',
          module: 'marketplace', // Assuming there's a marketplace module
          function: 'list',
          typeArguments: [],
          arguments: [
            nftId,
            price
          ],
          gasBudget: 10000
        }
      };

      // Sign and execute transaction
      await signAndExecuteTransaction(transaction);

      // Update NFT in state
      setNFTs(prevNFTs => 
        prevNFTs.map(nft => 
          nft.id === nftId 
            ? { ...nft, listed: true, price } 
            : nft
        )
      );

      setUserNFTs(prevUserNFTs => 
        prevUserNFTs.map(nft => 
          nft.id === nftId 
            ? { ...nft, listed: true, price } 
            : nft
        )
      );

      // Add to listed NFTs
      const nft = nfts.find(n => n.id === nftId);
      if (nft) {
        const listedNFT = { ...nft, listed: true, price };
        setListedNFTs(prevListedNFTs => [...prevListedNFTs, listedNFT]);
      }

      return true;
    } catch (error) {
      console.error('Error listing NFT:', error);
      return false;
    }
  };

  // Unlist an NFT
  const unlistNFT = async (nftId: string): Promise<boolean> => {
    if (!connected || !address) {
      throw new Error('Wallet not connected');
    }

    try {
      // Prepare transaction for unlisting NFT
      const transaction = {
        kind: 'moveCall',
        data: {
          packageObjectId: '0xdece5d51dc7abc7ecfd81251e0f624e5255663ef917a6950568d7986b21064cb',
          module: 'marketplace', // Assuming there's a marketplace module
          function: 'unlist',
          typeArguments: [],
          arguments: [
            nftId
          ],
          gasBudget: 10000
        }
      };

      // Sign and execute transaction
      await signAndExecuteTransaction(transaction);

      // Update NFT in state
      setNFTs(prevNFTs => 
        prevNFTs.map(nft => 
          nft.id === nftId 
            ? { ...nft, listed: false, price: undefined } 
            : nft
        )
      );

      setUserNFTs(prevUserNFTs => 
        prevUserNFTs.map(nft => 
          nft.id === nftId 
            ? { ...nft, listed: false, price: undefined } 
            : nft
        )
      );

      // Remove from listed NFTs
      setListedNFTs(prevListedNFTs => 
        prevListedNFTs.filter(nft => nft.id !== nftId)
      );

      return true;
    } catch (error) {
      console.error('Error unlisting NFT:', error);
      return false;
    }
  };

  // Buy an NFT
  const buyNFT = async (nftId: string): Promise<boolean> => {
    if (!connected || !address) {
      throw new Error('Wallet not connected');
    }

    try {
      // Prepare transaction for buying NFT
      const transaction = {
        kind: 'moveCall',
        data: {
          packageObjectId: '0xdece5d51dc7abc7ecfd81251e0f624e5255663ef917a6950568d7986b21064cb',
          module: 'marketplace', // Assuming there's a marketplace module
          function: 'buy',
          typeArguments: [],
          arguments: [
            nftId
          ],
          gasBudget: 10000
        }
      };

      // Sign and execute transaction
      await signAndExecuteTransaction(transaction);

      // Get the NFT
      const nft = nfts.find(n => n.id === nftId);
      if (!nft) return false;

      // Update NFT in state
      const updatedNFT = { 
        ...nft, 
        owner: address, 
        listed: false, 
        price: undefined 
      };

      setNFTs(prevNFTs => 
        prevNFTs.map(n => n.id === nftId ? updatedNFT : n)
      );

      // Add to user NFTs
      setUserNFTs(prevUserNFTs => [...prevUserNFTs, updatedNFT]);

      // Remove from listed NFTs
      setListedNFTs(prevListedNFTs => 
        prevListedNFTs.filter(n => n.id !== nftId)
      );

      return true;
    } catch (error) {
      console.error('Error buying NFT:', error);
      return false;
    }
  };

  // Fetch all NFTs
  const fetchNFTs = async (): Promise<void> => {
    setLoadingNFTs(true);
    try {
      // In a real implementation, this would call a backend API
      // For now, we'll use mock data
      const mockNFTs: NFT[] = [
        {
          id: '0x123',
          name: 'Pixel Art #1',
          description: 'A beautiful pixel art piece',
          imageUrl: 'https://example.com/image1.png',
          owner: '0xabc',
          creator: '0xabc',
          listed: true,
          price: '1.5',
          metadata: {
            attributes: [
              { trait_type: 'Background', value: 'Blue' },
              { trait_type: 'Character', value: 'Robot' }
            ]
          },
          blobId: '0xblob1'
        },
        {
          id: '0x456',
          name: 'Retro Game Character',
          description: 'A character from a retro game',
          imageUrl: 'https://example.com/image2.png',
          owner: '0xdef',
          creator: '0xdef',
          listed: false,
          metadata: {
            attributes: [
              { trait_type: 'Type', value: 'Character' },
              { trait_type: 'Game', value: 'Adventure Quest' }
            ]
          },
          blobId: '0xblob2'
        }
      ];

      setNFTs(mockNFTs);
      
      // Filter listed NFTs
      setListedNFTs(mockNFTs.filter(nft => nft.listed));
    } catch (error) {
      console.error('Error fetching NFTs:', error);
    } finally {
      setLoadingNFTs(false);
    }
  };

  // Fetch user's NFTs
  const fetchUserNFTs = async (): Promise<void> => {
    if (!connected || !address) {
      setUserNFTs([]);
      return;
    }

    setLoadingNFTs(true);
    try {
      // In a real implementation, this would call a backend API
      // For now, we'll filter the mock data
      const userOwnedNFTs = nfts.filter(nft => nft.owner === address);
      setUserNFTs(userOwnedNFTs);
    } catch (error) {
      console.error('Error fetching user NFTs:', error);
    } finally {
      setLoadingNFTs(false);
    }
  };

  // Fetch listed NFTs
  const fetchListedNFTs = async (): Promise<void> => {
    setLoadingNFTs(true);
    try {
      // In a real implementation, this would call a backend API
      // For now, we'll filter the mock data
      const listedNFTs = nfts.filter(nft => nft.listed);
      setListedNFTs(listedNFTs);
    } catch (error) {
      console.error('Error fetching listed NFTs:', error);
    } finally {
      setLoadingNFTs(false);
    }
  };

  // Get NFT by ID
  const getNFTById = (id: string): NFT | undefined => {
    return nfts.find(nft => nft.id === id);
  };

  // Context value
  const value: NFTContextType = {
    nfts,
    userNFTs,
    listedNFTs,
    loadingNFTs,
    createNFT,
    listNFT,
    unlistNFT,
    buyNFT,
    fetchNFTs,
    fetchUserNFTs,
    fetchListedNFTs,
    getNFTById
  };

  return (
    <NFTContext.Provider value={value}>
      {children}
    </NFTContext.Provider>
  );
};
