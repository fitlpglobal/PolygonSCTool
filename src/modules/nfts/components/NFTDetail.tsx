import { NFT } from '../types/nft';
import { ArrowLeft, Send, ImageOff, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useState } from 'react';
import { BrowserProvider } from 'ethers';
import { transferNFT } from '../utils/nftService';

interface NFTDetailProps {
  nft: NFT;
  provider: BrowserProvider;
  onBack: () => void;
}

export const NFTDetail = ({ nft, provider, onBack }: NFTDetailProps) => {
  const [imageError, setImageError] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferStatus, setTransferStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [transferError, setTransferError] = useState('');

  const handleTransfer = async () => {
    if (!recipientAddress || !recipientAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      setTransferError('Please enter a valid Ethereum address');
      setTransferStatus('error');
      return;
    }

    try {
      setIsTransferring(true);
      setTransferStatus('idle');
      setTransferError('');

      await transferNFT(provider, nft.contractAddress, nft.tokenId, nft.owner, recipientAddress);

      setTransferStatus('success');
      setRecipientAddress('');
    } catch (error) {
      setTransferStatus('error');
      setTransferError(error instanceof Error ? error.message : 'Transfer failed');
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-black transition-colors"
            style={{ color: 'var(--primary-violet)' }}
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Collection
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl overflow-hidden border border-black">
            <div className="aspect-square relative bg-gray-100">
              {!imageError && nft.image ? (
                <img
                  src={nft.image}
                  alt={nft.name}
                  className="w-full h-full object-contain"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageOff className="w-24 h-24 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-black">
              {nft.collection && (
                <p className="font-medium mb-2" style={{ color: 'var(--primary-violet)' }}>{nft.collection}</p>
              )}
              <h1 className="text-3xl font-bold text-black mb-4">{nft.name}</h1>

              {nft.description && (
                <p className="text-slate-300 leading-relaxed mb-6">{nft.description}</p>
              )}

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-900/50 rounded-lg p-4">
                  <p className="text-slate-500 text-sm mb-1">Token ID</p>
                  <p className="text-white font-mono">#{nft.tokenId}</p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-4">
                  <p className="text-slate-500 text-sm mb-1">Owner</p>
                  <p className="text-white font-mono text-sm">
                    {nft.owner.slice(0, 6)}...{nft.owner.slice(-4)}
                  </p>
                </div>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-4">
                <p className="text-slate-500 text-sm mb-1">Contract Address</p>
                <p className="text-white font-mono text-xs break-all">{nft.contractAddress}</p>
              </div>
            </div>

            {nft.attributes && nft.attributes.length > 0 && (
              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                <h2 className="text-xl font-bold text-white mb-4">Attributes</h2>
                <div className="grid grid-cols-2 gap-3">
                  {nft.attributes.map((attr, index) => (
                    <div key={index} className="bg-slate-900/50 rounded-lg p-3 text-center">
                      <p className="text-blue-400 text-xs uppercase mb-1">{attr.trait_type}</p>
                      <p className="text-white font-semibold">{attr.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
              <div className="flex items-center gap-2 mb-4">
                <Send className="w-5 h-5 text-blue-400" />
                <h2 className="text-xl font-bold text-white">Transfer NFT</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Recipient Address</label>
                  <input
                    type="text"
                    value={recipientAddress}
                    onChange={(e) => {
                      setRecipientAddress(e.target.value);
                      setTransferStatus('idle');
                      setTransferError('');
                    }}
                    placeholder="0x..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3
                             text-white placeholder-slate-600 focus:outline-none focus:border-blue-500
                             transition-colors font-mono text-sm"
                    disabled={isTransferring}
                  />
                </div>

                {transferStatus === 'success' && (
                  <div className="flex items-center gap-2 p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <p className="text-green-400 text-sm">Transfer successful!</p>
                  </div>
                )}

                {transferStatus === 'error' && (
                  <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <p className="text-red-400 text-sm">{transferError || 'Transfer failed'}</p>
                  </div>
                )}

                <button
                  onClick={handleTransfer}
                  disabled={isTransferring || !recipientAddress}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600
                           text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200
                           disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]
                           flex items-center justify-center gap-2"
                >
                  {isTransferring ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Transferring...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Transfer NFT
                    </>
                  )}
                </button>

                <p className="text-xs text-slate-500 text-center">
                  This action will transfer the NFT to the specified address. Make sure the address is correct.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
