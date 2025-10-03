import React from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const SmartContractDeployer = dynamic(() => import('~/modules/deployer'), { ssr: false });

export default function DeployerPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-secondary)' }}>
      {/* Navigation Header */}
      <nav className="bg-white shadow-md border-b border-black">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-black">NFT Card Collection Management</h1>
            <div className="flex space-x-4">
              <Link 
                href="/" 
                className="px-3 py-2 text-sm font-medium text-black hover:text-white hover:bg-gray-100 transition-colors"
              >
                Card Creator
              </Link>
              <Link 
                href="/nfts" 
                className="px-3 py-2 text-sm font-medium text-black hover:text-white hover:bg-gray-100 transition-colors"
              >
                NFT Collection
              </Link>
              <Link 
                href="/deployer" 
                className="px-3 py-2 text-sm font-medium text-white border-b-2 border-transparent" style={{ background: 'var(--primary-violet)' }}
              >
                Smart Contract Deployer
              </Link>
            </div>
          </div>
        </div>
      </nav>
      
      <SmartContractDeployer />
    </div>
  );
}


