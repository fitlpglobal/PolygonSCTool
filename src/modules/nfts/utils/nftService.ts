import { BrowserProvider, Contract } from 'ethers';
import { NFT } from '../types/nft';

const ERC721_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function transferFrom(address from, address to, uint256 tokenId)',
  'function name() view returns (string)',
  'function symbol() view returns (string)',
];

const KNOWN_NFT_CONTRACTS = [
  '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
  '0x60E4d786628Fea6478F785A6d7e704777c86a7c6',
  '0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB',
  '0x23581767a106ae21c074b2276D25e5C3e136a68b',
];

async function fetchMetadata(uri: string): Promise<any> {
  try {
    let url = uri;
    if (uri.startsWith('ipfs://')) {
      url = uri.replace('ipfs://', 'https://ipfs.io/ipfs/');
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch metadata');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return null;
  }
}

export async function fetchNFTs(provider: BrowserProvider, account: string): Promise<NFT[]> {
  const nfts: NFT[] = [];

  for (const contractAddress of KNOWN_NFT_CONTRACTS) {
    try {
      const contract = new Contract(contractAddress, ERC721_ABI, provider);
      const balance = await contract.balanceOf(account);
      const collectionName = await contract.name().catch(() => 'Unknown Collection');

      for (let i = 0; i < Math.min(Number(balance), 10); i++) {
        try {
          const tokenId = await contract.tokenOfOwnerByIndex(account, i);
          const tokenURI = await contract.tokenURI(tokenId);
          const metadata = await fetchMetadata(tokenURI);

          if (metadata) {
            let imageUrl = metadata.image || '';
            if (imageUrl.startsWith('ipfs://')) {
              imageUrl = imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
            }

            nfts.push({
              tokenId: tokenId.toString(),
              contractAddress,
              name: metadata.name || `Token #${tokenId}`,
              description: metadata.description || '',
              image: imageUrl,
              owner: account,
              collection: collectionName,
              attributes: metadata.attributes || [],
            });
          }
        } catch (error) {
          console.error(`Error fetching token ${i}:`, error);
        }
      }
    } catch (error) {
      console.error(`Error with contract ${contractAddress}:`, error);
    }
  }

  return nfts;
}

export async function transferNFT(
  provider: BrowserProvider,
  contractAddress: string,
  tokenId: string,
  from: string,
  to: string
): Promise<void> {
  const signer = await provider.getSigner();
  const contract = new Contract(contractAddress, ERC721_ABI, signer);

  const tx = await contract.transferFrom(from, to, tokenId);
  await tx.wait();
}
