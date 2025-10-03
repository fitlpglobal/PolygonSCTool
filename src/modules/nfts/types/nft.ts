export interface NFT {
  tokenId: string;
  contractAddress: string;
  name: string;
  description: string;
  image: string;
  owner: string;
  collection?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}
