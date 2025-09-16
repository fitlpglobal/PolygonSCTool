// Chain utility functions for MetaMask integration

export interface ChainInfo {
  name: string;
  rpcUrl?: string;
  blockExplorer?: string;
  nativeCurrency?: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

// Common chain information
export const CHAIN_INFO: Record<string, ChainInfo> = {
  '0x1': { 
    name: 'Ethereum Mainnet', 
    blockExplorer: 'https://etherscan.io',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrl: 'https://mainnet.infura.io/v3/'
  },
  '0x89': { 
    name: 'Polygon Mainnet', 
    blockExplorer: 'https://polygonscan.com',
    nativeCurrency: { name: 'Matic', symbol: 'MATIC', decimals: 18 },
    rpcUrl: 'https://polygon-rpc.com'
  },
  '0xaa36a7': { 
    name: 'Sepolia Testnet', 
    blockExplorer: 'https://sepolia.etherscan.io',
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'SEP', decimals: 18 },
    rpcUrl: 'https://sepolia.infura.io/v3/'
  },
  '0x13882': { 
    name: 'Amoy Testnet', 
    blockExplorer: 'https://amoy.polygonscan.com',
    nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
    rpcUrl: 'https://rpc-amoy.polygon.technology'
  },
  '0xa': { 
    name: 'Optimism', 
    blockExplorer: 'https://optimistic.etherscan.io',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrl: 'https://mainnet.optimism.io'
  },
  '0xa4b1': { 
    name: 'Arbitrum One', 
    blockExplorer: 'https://arbiscan.io',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrl: 'https://arb1.arbitrum.io/rpc'
  },
  '0x38': { 
    name: 'BSC Mainnet', 
    blockExplorer: 'https://bscscan.com',
    nativeCurrency: { name: 'Binance Coin', symbol: 'BNB', decimals: 18 },
    rpcUrl: 'https://bsc-dataseed1.binance.org'
  },
  '0x61': { 
    name: 'BSC Testnet', 
    blockExplorer: 'https://testnet.bscscan.com',
    nativeCurrency: { name: 'Test BNB', symbol: 'tBNB', decimals: 18 },
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545'
  },
};

/**
 * Get human-readable chain name from chain ID
 */
export const getChainName = (chainId: string | null): string => {
  if (!chainId) return 'Unknown';
  return CHAIN_INFO[chainId]?.name || `Chain ${parseInt(chainId, 16)}`;
};

/**
 * Format chain ID for display (decimal with hex)
 */
export const formatChainId = (chainId: string | null): string => {
  if (!chainId) return 'Unknown';
  try {
    const decimal = parseInt(chainId, 16);
    return `${decimal} (${chainId})`;
  } catch {
    return chainId;
  }
};

/**
 * Check if a chain ID represents a mainnet
 */
export const isMainnet = (chainId: string | null): boolean => {
  if (!chainId) return false;
  return ['0x1', '0x89', '0xa', '0xa4b1', '0x38'].includes(chainId);
};

/**
 * Check if a chain ID represents a testnet
 */
export const isTestnet = (chainId: string | null): boolean => {
  if (!chainId) return false;
  return ['0xaa36a7', '0x13882', '0x61'].includes(chainId);
};

/**
 * Get block explorer URL for an address or transaction
 */
export const getExplorerUrl = (
  chainId: string | null, 
  addressOrTx: string, 
  type: 'address' | 'tx' = 'address'
): string | null => {
  const explorer = chainId && CHAIN_INFO[chainId]?.blockExplorer;
  if (!explorer) return null;
  
  const path = type === 'tx' ? 'tx' : 'address';
  return `${explorer}/${path}/${addressOrTx}`;
};

/**
 * Switch to a specific chain in MetaMask, adding it if it doesn't exist
 */
export const switchToChain = async (targetChainId: string): Promise<void> => {
  const ethereum = (window as any).ethereum;
  if (!ethereum?.request) {
    throw new Error('MetaMask not found');
  }
  
  try {
    // First, try to switch to the chain
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: targetChainId }],
    });
  } catch (error: any) {
    if (error.code === 4902) {
      // Chain not added to MetaMask - let's add it
      const chainInfo = CHAIN_INFO[targetChainId];
      if (!chainInfo) {
        throw new Error(`Unknown chain ID: ${targetChainId}. Cannot add to MetaMask.`);
      }
      
      try {
        await ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: targetChainId,
            chainName: chainInfo.name,
            nativeCurrency: chainInfo.nativeCurrency,
            rpcUrls: [chainInfo.rpcUrl].filter(Boolean),
            blockExplorerUrls: [chainInfo.blockExplorer].filter(Boolean),
          }],
        });
        
        // After adding, try to switch again
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: targetChainId }],
        });
      } catch (addError: any) {
        if (addError.code === 4001) {
          throw new Error('User rejected adding the network');
        }
        throw new Error(`Failed to add ${chainInfo.name} to MetaMask: ${addError.message}`);
      }
    } else if (error.code === 4001) {
      // User rejected the request
      throw new Error('User rejected the chain switch request');
    } else {
      throw error;
    }
  }
};

/**
 * Get the current account and chain ID from MetaMask
 */
export const getWalletInfo = async (): Promise<{
  account: string | null;
  chainId: string | null;
}> => {
  const ethereum = (window as any).ethereum;
  if (!ethereum?.request) {
    throw new Error('MetaMask not found');
  }
  
  try {
    const [accounts, chainId] = await Promise.all([
      ethereum.request({ method: 'eth_accounts' }),
      ethereum.request({ method: 'eth_chainId' }),
    ]);
    
    return {
      account: (accounts as string[])?.[0] ?? null,
      chainId: chainId ?? null,
    };
  } catch (error) {
    console.error('Failed to get wallet info:', error);
    return { account: null, chainId: null };
  }
};

/**
 * Connect to MetaMask and request account access
 */
export const connectWallet = async (): Promise<{
  account: string | null;
  chainId: string | null;
}> => {
  const ethereum = (window as any).ethereum;
  if (!ethereum?.request) {
    throw new Error('MetaMask not found');
  }
  
  try {
    // Request account access
    let accounts: string[] = await ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    
    // If no accounts returned, try to force permission request
    if (!accounts || accounts.length === 0) {
      await ethereum.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }],
      });
      accounts = await ethereum.request({ method: 'eth_accounts' });
    }
    
    const chainId: string = await ethereum.request({ method: 'eth_chainId' });
    
    return {
      account: accounts?.[0] ?? null,
      chainId: chainId ?? null,
    };
  } catch (error: any) {
    if (error.code === 4001) {
      throw new Error('User rejected the connection request');
    }
    throw error;
  }
};