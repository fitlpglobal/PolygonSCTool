import { NFT } from '../types/nft';
import { NFTCard } from './NFTCard';
import { Loader2, LogOut, ImageOff } from 'lucide-react';

interface NFTListProps {
  nfts: NFT[];
  isLoading: boolean;
  account: string;
  onDisconnect: () => void;
  onNFTClick: (nft: NFT) => void;
}

export const NFTList = ({ nfts, isLoading, account, onDisconnect, onNFTClick }: NFTListProps) => {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-black sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-black">My NFT Collection</h1>
              <p className="text-gray-600 text-sm mt-1">
                {account.slice(0, 6)}...{account.slice(-4)}
              </p>
            </div>
            <button
              onClick={onDisconnect}
              className="flex items-center gap-2 text-white px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
              style={{ background: 'var(--primary-violet)' }}
            >
              <LogOut className="w-4 h-4" />
              Disconnect
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin mb-4" style={{ color: 'var(--primary-violet)' }} />
            <p className="text-black">Loading your NFTs...</p>
          </div>
        ) : nfts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 border border-black" style={{ background: 'var(--primary-violet)' }}>
              <ImageOff className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-black mb-2">No NFTs Found</h2>
            <p className="text-gray-600 text-center max-w-md">
              We couldn't find any NFTs in your wallet from the major collections.
              Make sure you're connected to the correct network.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-black">
                Found <span className="font-semibold" style={{ color: 'var(--primary-violet)' }}>{nfts.length}</span> NFTs
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {nfts.map((nft) => (
                <NFTCard
                  key={`${nft.contractAddress}-${nft.tokenId}`}
                  nft={nft}
                  onClick={() => onNFTClick(nft)}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};
