import { useState } from 'react';
import { NFT } from './types/nft';
import { NFTList } from './components/NFTList';
import { NFTDetail } from './components/NFTDetail';
import { mockNFTs } from './data/mockNFTs';

type View = 'list' | 'detail';

interface NFTsModuleProps {
  className?: string;
}

export const NFTsModule: React.FC<NFTsModuleProps> = ({ className }) => {
  const [view, setView] = useState<View>('list');
  const [nfts] = useState<NFT[]>(mockNFTs);
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const mockAccount = '0x1234567890123456789012345678901234567890';

  const handleNFTClick = (nft: NFT) => {
    setSelectedNFT(nft);
    setView('detail');
  };

  const handleBackToList = () => {
    setSelectedNFT(null);
    setView('list');
  };

  const handleDisconnect = () => {
    console.log('Disconnect clicked - MetaMask integration to be implemented');
  };

  const mockProvider = {} as any;

  if (view === 'detail' && selectedNFT) {
    return (
      <div className={className}>
        <NFTDetail nft={selectedNFT} provider={mockProvider} onBack={handleBackToList} />
      </div>
    );
  }

  return (
    <div className={className}>
      <NFTList
        nfts={nfts}
        isLoading={false}
        account={mockAccount}
        onDisconnect={handleDisconnect}
        onNFTClick={handleNFTClick}
      />
    </div>
  );
};

// Export the module as default for easier importing
export default NFTsModule;

// Re-export types and utilities that might be needed externally
export type { NFT } from './types/nft';
export { mockNFTs } from './data/mockNFTs';
export { useMetaMask } from './hooks/useMetaMask';