// getInventory.ts
import { DataClient } from './client'; // Import the blockchain data client
import { handleError } from './errorHandler'; // Error handler utility
import * as fs from 'fs';
import * as path from 'path';

// Inventory Filters Configuration for fetching owned NFTs
const INVENTORY_FILTERS = {
  chainName: 'imtbl-zkevm-testnet', // Set the desired chain name
  accountAddress: '0xD509997AB62fDA51c32E64E69Fb090DF8894105e', // Set the account address of the wallet holding NFTs
  contractAddress: '0x04d022f51c96d21d276417c69a14349c9a3667db', // Optional: set contract address to filter specific contracts
  pageSize: 200, // Set the page size to control the number of items per request
};

const outputFilePath = path.resolve(__dirname, 'dataio/outputInventory.json');

// Function to fetch owned NFTs with pagination
const fetchOwnedNFTs = async (client: any, params: typeof INVENTORY_FILTERS) => {
  let allNFTs: any[] = [];
  let nextCursor: string | null = null;

  try {
    do {
      const response: any = await client.listNFTsByAccountAddress({
        chainName: params.chainName,
        accountAddress: params.accountAddress,
        contractAddress: params.contractAddress || undefined,
        pageSize: params.pageSize,
        pageCursor: nextCursor || undefined,
      });

      // Add the current page's results to the list of all NFTs
      allNFTs = allNFTs.concat(response.result);

      // Update the next cursor for pagination
      nextCursor = response.page?.next_cursor || null;
    } while (nextCursor);

    return allNFTs;
  } catch (error) {
    handleError(error, 'fetchOwnedNFTs');
    return [];
  }
};

// Function to save NFTs to a JSON file
const saveNFTsToJson = (nfts: any[], filePath: string) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(nfts, null, 4));
    console.log(`NFTs saved to ${filePath}`);
  } catch (error) {
    console.error('Error writing to JSON file:', error);
  }
};

// Function to display NFTs in a tabular format
const displayNFTs = (nfts: any[]) => {
  console.log(`${'Type'.padEnd(10)}${'Contract Address'.padEnd(45)}${'Token ID'.padEnd(30)}${'Name'}`);
  console.log('-'.repeat(100));

  nfts.forEach((nft) => {
    const tokenId = nft.token_id;
    const contractAddress = nft.contract_address;
    const type = nft.contract_type;
    const name = nft.name || 'N/A';

    console.log(`${type.padEnd(10)}${contractAddress.padEnd(45)}${tokenId.padEnd(30)}${name}`);
  });
};

// Main execution block
(async () => {
  try {
    const client = DataClient(); // Create the data client
    const nfts = await fetchOwnedNFTs(client, INVENTORY_FILTERS); // Use the filters from config

    if (nfts.length === 0) {
      console.log('No NFTs found for the specified account.');
    } else {
      displayNFTs(nfts); // Display the NFTs in a tabular format

      // Save the NFTs to a JSON file
      saveNFTsToJson(nfts, outputFilePath);
    }

    process.exit(0);
  } catch (error) {
    handleError(error, 'Main execution - getOwnedNFTs');
    process.exit(1);
  }
})();

export { fetchOwnedNFTs, saveNFTsToJson, displayNFTs };
