import React from 'react';
import { UploadCloud, PlayCircle, Wallet, AlertTriangle } from 'lucide-react';
import { compileContract } from '~/utils/compileContract';
import { 
  CHAIN_INFO, 
  getChainName, 
  formatChainId, 
  switchToChain as switchChain, 
  connectWallet as connectToWallet,
  isMainnet,
  getExplorerUrl
} from '~/utils/chainUtils';

type CompileResult = { abi: unknown[]; bytecode: `0x${string}` };

const SmartContractDeployer: React.FC = () => {
  const [source, setSource] = React.useState<string>('');
  const [status, setStatus] = React.useState<string>('Idle');
  const [error, setError] = React.useState<string | null>(null);
  const [compiled, setCompiled] = React.useState<CompileResult | null>(null);
  const [constructorArgs, setConstructorArgs] = React.useState<string>('');
  const [account, setAccount] = React.useState<string | null>(null);
  const [chainId, setChainId] = React.useState<string | null>(null);
  const [deployedAddress, setDeployedAddress] = React.useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setSource(text);
  };

  const handleCompile = async () => {
    setStatus('Compiling...');
    setError(null);
    setCompiled(null);
    setDeployedAddress(null);
    try {
      const result = await compileContract(source);
      setCompiled(result);
      setStatus('Compiled');
    } catch (e: any) {
      setError(e?.message || String(e));
      setStatus('Failed');
    }
  };

  const refreshWalletInfo = async () => {
    setStatus('Refreshing wallet info...');
    setError(null);
    try {
      const ethereum = (window as any).ethereum;
      if (!ethereum?.request) throw new Error('MetaMask not found');
      
      const [accs, cid] = await Promise.all([
        ethereum.request({ method: 'eth_accounts' }),
        ethereum.request({ method: 'eth_chainId' }),
      ]);
      
      console.log('🔄 Refreshed wallet info:', { accounts: accs, chainId: cid });
      setAccount((accs as string[])?.[0] ?? null);
      setChainId(cid ?? null);
      
      if (cid) {
        setStatus(`Refreshed - Connected to ${getChainName(cid)} (ID: ${formatChainId(cid)})`);
      } else {
        setStatus('No chain detected');
      }
    } catch (e: any) {
      setError(e?.message || String(e));
      setStatus('Failed to refresh wallet info');
    }
  };

  const connectWallet = async () => {
    setStatus('Connecting wallet...');
    setError(null);
    try {
      const { account: acc, chainId: cid } = await connectToWallet();
      setAccount(acc);
      setChainId(cid);
      if (acc) {
        setStatus(`Connected to ${getChainName(cid)} with ${acc.slice(0, 6)}...${acc.slice(-4)}`);
      } else {
        setStatus('Wallet connected');
      }
    } catch (e: any) {
      setError(e?.message || String(e));
      setStatus('Failed to connect wallet');
    }
  };

  const switchToChain = async (targetChainId: string) => {
    setStatus(`Switching to ${getChainName(targetChainId)}...`);
    setError(null);
    try {
      await switchChain(targetChainId);
      // Force refresh wallet info after switch
      setTimeout(async () => {
        try {
          const [accs, cid] = await Promise.all([
            ((window as any).ethereum?.request({ method: 'eth_accounts' })),
            ((window as any).ethereum?.request({ method: 'eth_chainId' })),
          ]);
          setAccount((accs as string[])?.[0] ?? null);
          setChainId(cid ?? null);
          setStatus(`✅ Successfully switched to ${getChainName(cid)} (ID: ${formatChainId(cid)})`);
        } catch (refreshError) {
          console.warn('Failed to refresh after chain switch:', refreshError);
          setStatus(`Switched to ${getChainName(targetChainId)} - please refresh if needed`);
        }
      }, 1000); // Give MetaMask a moment to update
    } catch (e: any) {
      setError(e?.message || String(e));
      setStatus('Failed to switch chain');
    }
  };

  React.useEffect(() => {
    const ethereum = (typeof window !== 'undefined' ? (window as any).ethereum : null);
    if (!ethereum?.on) {
      console.warn('MetaMask not found or does not support event listeners');
      return;
    }
    
    const handleAccountsChanged = (accs: string[]) => {
      console.log('🔄 Account changed:', accs);
      const newAccount = accs?.[0] ?? null;
      setAccount(newAccount);
      if (newAccount) {
        setStatus(`Account changed to ${newAccount.slice(0, 6)}...${newAccount.slice(-4)}`);
      } else {
        setStatus('Account disconnected');
        setDeployedAddress(null); // Clear deployed contract when account disconnected
      }
    };
    
    const handleChainChanged = (cid: string) => {
      console.log('🔄 Chain changed to:', cid, 'Chain name:', getChainName(cid));
      setChainId(cid ?? null);
      setDeployedAddress(null); // Clear deployed contract when chain changes
      setError(null); // Clear any previous errors
      if (cid) {
        setStatus(`Switched to ${getChainName(cid)} (ID: ${formatChainId(cid)})`);
      } else {
        setStatus('Chain disconnected');
      }
    };
    
    // Remove any existing listeners first to prevent duplicates
    try {
      ethereum.removeListener('accountsChanged', handleAccountsChanged);
      ethereum.removeListener('chainChanged', handleChainChanged);
    } catch (e) {
      // Ignore errors if listeners don't exist yet
    }
    
    // Add event listeners
    ethereum.on('accountsChanged', handleAccountsChanged);
    ethereum.on('chainChanged', handleChainChanged);
    
    console.log('🎧 Event listeners registered');
    
    // Initialize values if already connected
    (async () => {
      try {
        const [accs, cid] = await Promise.all([
          ethereum.request({ method: 'eth_accounts' }),
          ethereum.request({ method: 'eth_chainId' }),
        ]);
        console.log('🚀 Initial wallet state:', { accounts: accs, chainId: cid });
        setAccount((accs as string[])?.[0] ?? null);
        setChainId(cid ?? null);
        if (cid) {
          setStatus(`Connected to ${getChainName(cid)} (ID: ${formatChainId(cid)})`);
        }
      } catch (error) {
        console.warn('Failed to initialize wallet info:', error);
      }
    })();
    
    return () => {
      try {
        console.log('🧹 Cleaning up event listeners');
        ethereum.removeListener('accountsChanged', handleAccountsChanged);
        ethereum.removeListener('chainChanged', handleChainChanged);
      } catch (error) {
        console.warn('Failed to remove event listeners:', error);
      }
    };
  }, []); // Empty dependency array to ensure this only runs once

  const handleDeploy = async () => {
    if (!compiled) return;
    setStatus('Deploying...');
    setError(null);
    try {
      const ethereum = (window as any).ethereum;
      if (!ethereum?.request) throw new Error('MetaMask not found');
      const { ethers } = await import('ethers');
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const ContractFactory = new ethers.ContractFactory(
        compiled.abi as any,
        compiled.bytecode,
        signer
      );

      let args: unknown[] = [];
      if (constructorArgs.trim()) {
        try {
          args = JSON.parse(constructorArgs);
          if (!Array.isArray(args)) throw new Error('Constructor args must be an array');
        } catch (e: any) {
          throw new Error('Invalid constructor args JSON. Example: ["Name","SYM",1000]');
        }
      }

      const contract = await ContractFactory.deploy(...args);
      const receipt = await contract.waitForDeployment();
      const address = await contract.getAddress();
      
      setDeployedAddress(address);
      
      // eslint-disable-next-line no-console
      console.log('Deployed at:', address, receipt);
      
      const explorerUrl = getExplorerUrl(chainId, address, 'address');
      setStatus(
        explorerUrl 
          ? `✅ Deployed successfully! View on ${getChainName(chainId)} Explorer` 
          : `✅ Deployed at ${address}`
      );
    } catch (e: any) {
      setError(e?.message || String(e));
      setStatus('Failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Smart Contract Deployer</h1>
          <p className="text-gray-600">Upload, compile, and deploy Solidity via MetaMask (current network)</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <UploadCloud className="mr-2 text-blue-600" />
              Solidity Source
            </h2>

            <div className="space-y-4">
              <input type="file" accept=".sol" onChange={handleFileUpload} />
              <textarea
                value={source}
                onChange={(e) => setSource(e.target.value)}
                rows={18}
                placeholder="Paste or upload Solidity source (.sol)."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-y"
              />

              <button
                onClick={handleCompile}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                Compile
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <PlayCircle className="mr-2 text-purple-600" />
              Deploy
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Constructor Args (JSON array)</label>
                <input
                  type="text"
                  placeholder='["Name","SYM",1000]'
                  value={constructorArgs}
                  onChange={(e) => setConstructorArgs(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <button
                onClick={connectWallet}
                className="w-full bg-gray-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-black transition-all flex items-center justify-center gap-2"
              >
                <Wallet className="w-5 h-5" /> Connect MetaMask
              </button>

              {/* Manual refresh button for debugging */}
              {account && (
                <button
                  onClick={refreshWalletInfo}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-all"
                >
                  🔄 Refresh Wallet Info
                </button>
              )}

              <div className="text-sm text-gray-700 space-y-2">
                <div><strong>Account:</strong> {account ?? '—'}</div>
                <div>
                  <strong>Chain:</strong> {getChainName(chainId)}
                  <div className="text-xs text-gray-500">ID: {formatChainId(chainId)}</div>
                </div>
                {chainId && CHAIN_INFO[chainId]?.blockExplorer && (
                  <div className="text-xs">
                    <a 
                      href={CHAIN_INFO[chainId]!.blockExplorer} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View on {getChainName(chainId)} Explorer
                    </a>
                  </div>
                )}
              </div>

              {/* Chain switching options */}
              {account && (
                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Switch Network:</label>
                  
                  {/* Recommended Testnets */}
                  <div className="mb-3">
                    <div className="text-xs font-medium text-gray-600 mb-2">🧪 Recommended Testnets</div>
                    <div className="grid grid-cols-1 gap-2">
                      <button
                        onClick={() => switchToChain('0x13882')}
                        disabled={chainId === '0x13882'}
                        className={`text-sm px-4 py-3 rounded-lg border-2 transition-all ${
                          chainId === '0x13882'
                            ? 'bg-green-100 border-green-300 text-green-800 cursor-not-allowed'
                            : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300'
                        }`}
                      >
                        <div className="font-medium">Amoy Testnet (POL)</div>
                        <div className="text-xs opacity-75">Chain ID: 80002 • Free POL tokens</div>
                        {chainId === '0x13882' && <div className="text-xs mt-1">✅ Currently Connected</div>}
                        {chainId !== '0x13882' && <div className="text-xs mt-1">👆 Click to add & switch</div>}
                      </button>
                      
                      <button
                        onClick={() => switchToChain('0xaa36a7')}
                        disabled={chainId === '0xaa36a7'}
                        className={`text-sm px-4 py-3 rounded-lg border-2 transition-all ${
                          chainId === '0xaa36a7'
                            ? 'bg-green-100 border-green-300 text-green-800 cursor-not-allowed'
                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium">Sepolia Testnet (ETH)</div>
                        <div className="text-xs opacity-75">Chain ID: 11155111</div>
                        {chainId === '0xaa36a7' && <div className="text-xs mt-1">✅ Currently Connected</div>}
                      </button>
                    </div>
                    
                    {/* Testnet tokens info */}
                    {chainId === '0x13882' && (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                        <div className="font-medium text-blue-800 mb-1">🪙 Need POL tokens?</div>
                        <div className="text-blue-700">
                          Get free POL tokens from the{' '}
                          <a 
                            href="https://faucet.polygon.technology/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="underline hover:no-underline"
                          >
                            Polygon Faucet
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Mainnets */}
                  <div>
                    <div className="text-xs font-medium text-gray-600 mb-2">🔴 Mainnets (Real Money!)</div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: '0x1', name: 'Ethereum' },
                        { id: '0x89', name: 'Polygon' },
                        { id: '0xa', name: 'Optimism' },
                        { id: '0xa4b1', name: 'Arbitrum' }
                      ].map(({ id, name }) => (
                        <button
                          key={id}
                          onClick={() => switchToChain(id)}
                          disabled={chainId === id}
                          className={`text-xs px-3 py-2 rounded transition-all ${
                            chainId === id
                              ? 'bg-green-100 text-green-800 cursor-not-allowed border border-green-300'
                              : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                          }`}
                        >
                          {name}
                          {chainId === id && ' ✅'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleDeploy}
                disabled={!compiled || !account}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 disabled:from-gray-400 disabled:to-gray-400 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all"
              >
                Deploy Contract {account ? `on ${getChainName(chainId)}` : '(Connect Wallet First)'}
              </button>

              {/* Deployment warnings */}
              {account && chainId && (
                <div className="text-sm">
                  {isMainnet(chainId) && (
                    <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div className="text-yellow-800">
                        <strong>Mainnet Deployment:</strong> You're about to deploy on {getChainName(chainId)}. 
                        This will cost real {CHAIN_INFO[chainId]?.nativeCurrency?.symbol || 'tokens'}. 
                        Consider testing on a testnet first.
                      </div>
                    </div>
                  )}
                  {!CHAIN_INFO[chainId] && (
                    <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div className="text-orange-800">
                        <strong>Unknown Chain:</strong> You're on an unrecognized network (Chain ID: {formatChainId(chainId)}). 
                        Deployment may not work as expected.
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Deployed contract info */}
              {deployedAddress && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Contract Deployed Successfully! 🎉</h4>
                  <div className="text-sm text-green-700 space-y-1">
                    <div><strong>Address:</strong> <code className="bg-white px-2 py-1 rounded">{deployedAddress}</code></div>
                    <div><strong>Network:</strong> {getChainName(chainId)}</div>
                    {getExplorerUrl(chainId, deployedAddress) && (
                      <div>
                        <a 
                          href={getExplorerUrl(chainId, deployedAddress)!} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-green-600 hover:text-green-800 underline"
                        >
                          View on {getChainName(chainId)} Explorer →
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <div className="text-sm text-gray-600"><strong>Status:</strong> {status}</div>
                {error && (
                  <pre className="mt-2 text-sm text-red-700 bg-red-50 p-3 rounded">{error}</pre>
                )}
                {compiled && (
                  <div className="mt-3 text-sm text-gray-700">
                    <div><strong>ABI length:</strong> {(compiled.abi as any[]).length}</div>
                    <div><strong>Bytecode length:</strong> {compiled.bytecode.length}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartContractDeployer;


