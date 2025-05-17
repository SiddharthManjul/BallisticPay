import React, { useState, useContext } from 'react';
import { useNFT } from '../context/NFTContext.tsx';
import { WalletContext } from '../context/WalletContext.tsx';

const CreateNFTPage: React.FC = () => {
  const { connected, connect } = useContext(WalletContext);
  const { createNFT } = useNFT();
  
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [attributes, setAttributes] = useState<{ trait_type: string; value: string }[]>([
    { trait_type: '', value: '' }
  ]);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Add new attribute field
  const addAttribute = () => {
    setAttributes([...attributes, { trait_type: '', value: '' }]);
  };

  // Remove attribute field
  const removeAttribute = (index: number) => {
    const newAttributes = [...attributes];
    newAttributes.splice(index, 1);
    setAttributes(newAttributes);
  };

  // Update attribute field
  const updateAttribute = (index: number, field: 'trait_type' | 'value', value: string) => {
    const newAttributes = [...attributes];
    newAttributes[index][field] = value;
    setAttributes(newAttributes);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!connected) {
      setError('Please connect your wallet first');
      return;
    }
    
    if (!name || !description || !imageFile) {
      setError('Please fill in all required fields');
      return;
    }
    
    // Filter out empty attributes
    const filteredAttributes = attributes.filter(
      attr => attr.trait_type.trim() !== '' && attr.value.trim() !== ''
    );
    
    // Convert attributes array to object
    const attributesObject = filteredAttributes.reduce((obj, attr) => {
      obj[attr.trait_type] = attr.value;
      return obj;
    }, {} as Record<string, string>);
    
    setIsCreating(true);
    setError(null);
    
    try {
      // Create NFT
      await createNFT(name, description, imageFile, attributesObject);
      
      // Reset form
      setName('');
      setDescription('');
      setImageFile(null);
      setImagePreview(null);
      setAttributes([{ trait_type: '', value: '' }]);
      setSuccess(true);
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (error) {
      console.error('Error creating NFT:', error);
      setError('Failed to create NFT. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="retro-container py-8">
      <h1 className="font-pixel text-3xl mb-8 text-center text-[var(--retro-accent)]">CREATE NEW NFT</h1>
      
      {!connected ? (
        <div className="retro-card max-w-md mx-auto text-center p-6">
          <p className="font-mono mb-4">Connect your wallet to create an NFT</p>
          <button 
            onClick={connect}
            className="retro-btn bg-[var(--retro-primary)]"
          >
            Connect Wallet
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <div className="retro-card mb-8 p-6">
            <div className="mb-6">
              <label className="block font-pixel mb-2 text-[var(--retro-accent)]">
                NFT NAME
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="retro-input w-full"
                placeholder="Enter NFT name"
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block font-pixel mb-2 text-[var(--retro-accent)]">
                DESCRIPTION
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="retro-input w-full h-32"
                placeholder="Describe your NFT"
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block font-pixel mb-2 text-[var(--retro-accent)]">
                IMAGE
              </label>
              <div className="flex items-start">
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="retro-input w-full"
                    required
                  />
                  <p className="text-xs mt-1 font-mono">
                    Supported formats: JPG, PNG, GIF, SVG
                  </p>
                </div>
                
                {imagePreview && (
                  <div className="ml-4 w-24 h-24 border-2 border-[var(--retro-white)]">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="retro-card mb-8 p-6">
            <div className="mb-4">
              <div className="flex justify-between items-center">
                <label className="block font-pixel text-[var(--retro-accent)]">
                  ATTRIBUTES
                </label>
                <button
                  type="button"
                  onClick={addAttribute}
                  className="retro-btn bg-[var(--retro-secondary)] text-xs py-1 px-2"
                >
                  + Add Attribute
                </button>
              </div>
              <p className="text-xs mt-1 mb-4 font-mono">
                Add traits to your NFT (optional)
              </p>
            </div>
            
            {attributes.map((attr, index) => (
              <div key={index} className="flex mb-4 space-x-2">
                <input
                  type="text"
                  value={attr.trait_type}
                  onChange={(e) => updateAttribute(index, 'trait_type', e.target.value)}
                  className="retro-input flex-1"
                  placeholder="Trait name"
                />
                <input
                  type="text"
                  value={attr.value}
                  onChange={(e) => updateAttribute(index, 'value', e.target.value)}
                  className="retro-input flex-1"
                  placeholder="Value"
                />
                {attributes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAttribute(index)}
                    className="retro-btn bg-[var(--retro-error)] text-xs py-1 px-2"
                  >
                    X
                  </button>
                )}
              </div>
            ))}
          </div>
          
          {error && (
            <div className="retro-card bg-[var(--retro-error)] text-[var(--retro-white)] p-4 mb-6">
              <p className="font-mono">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="retro-card bg-[var(--retro-success)] text-[var(--retro-white)] p-4 mb-6">
              <p className="font-mono">NFT created successfully!</p>
            </div>
          )}
          
          <div className="text-center">
            <button
              type="submit"
              disabled={isCreating}
              className={`retro-btn bg-[var(--retro-primary)] px-8 py-3 ${
                isCreating ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isCreating ? 'CREATING...' : 'CREATE NFT'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CreateNFTPage;
