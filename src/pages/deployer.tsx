import React from 'react';
import dynamic from 'next/dynamic';

const SmartContractDeployer = dynamic(() => import('~/modules/deployer'), { ssr: false });

export default function DeployerPage() {
  return <SmartContractDeployer />;
}


