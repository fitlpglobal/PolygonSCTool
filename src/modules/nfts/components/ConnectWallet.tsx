import { Wallet } from 'lucide-react';

interface ConnectWalletProps {
  onConnect: () => void;
  isConnecting: boolean;
  error: string | null;
}

export const ConnectWallet = ({ onConnect, isConnecting, error }: ConnectWalletProps) => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-black">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'var(--primary-violet)' }}>
              <Wallet className="w-10 h-10 text-white" />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-black mb-2">NFT Gallery</h1>
              <p className="text-gray-600">Connect your MetaMask wallet to view your NFT collection</p>
            </div>

            {error && (
              <div className="w-full p-4 rounded-lg bg-red-50 border border-red-300">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              onClick={onConnect}
              disabled={isConnecting}
              className="w-full text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: 'var(--primary-violet)' }}
            >
              {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
            </button>

            <p className="text-xs text-slate-500">
              Make sure MetaMask is installed in your browser
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
