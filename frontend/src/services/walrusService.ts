// src/services/walrusService.ts

/**
 * Walrus Service for NFT Metadata Storage
 * 
 * This service provides utilities for storing and retrieving NFT metadata
 * using Sui Walrus decentralized storage protocol.
 * 
 * Based on research from:
 * - Walrus official documentation
 * - Medium guide by 0xThanos
 * - Mysten Labs blog
 */

import axios from 'axios';

// Constants
const WALRUS_API_ENDPOINT = 'https://api.walrus.testnet.sui.io'; // Example endpoint, replace with actual
const WALRUS_GATEWAY = 'https://gateway.walrus.testnet.sui.io'; // Example gateway, replace with actual

/**
 * Interface for NFT Metadata
 */
interface NFTMetadata {
  name: string;
  description: string;
  image: string; // URL or blob ID
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  [key: string]: unknown; // Additional properties
}

/**
 * Walrus Service Class
 */
class WalrusService {
  private apiKey: string | null = null;
  
  /**
   * Initialize the Walrus service with optional API key
   */
  constructor(apiKey?: string) {
    if (apiKey) {
      this.apiKey = apiKey;
    }
  }
  
  /**
   * Store NFT metadata on Walrus
   * 
   * @param metadata - The NFT metadata to store
   * @returns Promise with the blob ID
   */
  async storeMetadata(metadata: NFTMetadata): Promise<string> {
    try {
      // Convert metadata to JSON string
      const metadataString = JSON.stringify(metadata);
      
      // Create blob from metadata string
      const blob = new Blob([metadataString], { type: 'application/json' });
      
      // Upload to Walrus
      const blobId = await this.uploadBlob(blob);
      
      return blobId;
    } catch (error) {
      console.error('Error storing metadata on Walrus:', error);
      throw new Error('Failed to store metadata on Walrus');
    }
  }
  
  /**
   * Upload a blob to Walrus
   * 
   * @param blob - The blob to upload
   * @returns Promise with the blob ID
   */
  async uploadBlob(blob: Blob): Promise<string> {
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', blob);
      
      // Set headers
      const headers: Record<string, string> = {};
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }
      
      // Make API request to upload blob
      const response = await axios.post(`${WALRUS_API_ENDPOINT}/blob/publish`, formData, {
        headers
      });
      
      // Extract and return blob ID
      return response.data.blobId;
    } catch (error) {
      console.error('Error uploading blob to Walrus:', error);
      throw new Error('Failed to upload blob to Walrus');
    }
  }
  
  /**
   * Retrieve NFT metadata from Walrus
   * 
   * @param blobId - The blob ID of the metadata
   * @returns Promise with the metadata
   */
  async retrieveMetadata(blobId: string): Promise<NFTMetadata> {
    try {
      // Make API request to retrieve blob
      const response = await axios.get(`${WALRUS_GATEWAY}/blob/${blobId}`);
      
      // Parse and return metadata
      return response.data;
    } catch (error) {
      console.error('Error retrieving metadata from Walrus:', error);
      throw new Error('Failed to retrieve metadata from Walrus');
    }
  }
  
  /**
   * Get public URL for a blob
   * 
   * @param blobId - The blob ID
   * @returns The public URL for the blob
   */
  getPublicUrl(blobId: string): string {
    return `${WALRUS_GATEWAY}/blob/${blobId}`;
  }
  
  /**
   * Store image on Walrus and return blob ID
   * 
   * @param imageFile - The image file to upload
   * @returns Promise with the blob ID
   */
  async storeImage(imageFile: File): Promise<string> {
    try {
      // Upload image to Walrus
      const blobId = await this.uploadBlob(imageFile);
      
      return blobId;
    } catch (error) {
      console.error('Error storing image on Walrus:', error);
      throw new Error('Failed to store image on Walrus');
    }
  }
  
  /**
   * Check if a blob exists and is available
   * 
   * @param blobId - The blob ID to check
   * @returns Promise with boolean indicating availability
   */
  async checkBlobAvailability(blobId: string): Promise<boolean> {
    try {
      // Make API request to check blob availability
      await axios.head(`${WALRUS_GATEWAY}/blob/${blobId}`);
      
      // If no error is thrown, the blob is available
      return true;
    } catch (error) {
      console.error('Error checking blob availability:', error);
      return false;
    }
  }
}

export default WalrusService;
