import { NFT } from '../types/nft';
import { ImageOff } from 'lucide-react';
import { useState } from 'react';

interface NFTCardProps {
  nft: NFT;
  onClick: () => void;
}

export const NFTCard = ({ nft, onClick }: NFTCardProps) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-xl overflow-hidden cursor-pointer border border-black transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg"
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--primary-violet)';
        e.currentTarget.style.boxShadow = '0 10px 25px rgba(122, 40, 203, 0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'black';
        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
      }}
    >
      <div className="aspect-square relative overflow-hidden bg-gray-100">
        {!imageError && nft.image ? (
          <img
            src={nft.image}
            alt={nft.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageOff className="w-16 h-16 text-gray-400" />
          </div>
        )}

        {nft.collection && (
          <div className="absolute top-3 left-3 bg-white border border-black px-3 py-1 rounded-full">
            <p className="text-xs font-medium text-black">{nft.collection}</p>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-black font-semibold text-lg mb-1 truncate group-hover:transition-colors" style={{ color: 'black' }}>
          {nft.name}
        </h3>
        <p className="text-gray-600 text-sm truncate">Token #{nft.tokenId}</p>
      </div>
    </div>
  );
};
