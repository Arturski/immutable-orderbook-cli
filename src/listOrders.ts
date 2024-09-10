import { ethers } from 'ethers';
import { ListingParams } from './types';
import { wallet, estimateGasOverrides, readJsonFile } from './utils';
import { OrderbookClient } from './client'; // Import the generalized orderbook client function
import { orderbook } from '@imtbl/sdk';

// Read the JSON file for listing input
const metadataFilePath = `${__dirname}/dataio/inputListOrders.json`;

let metadata: ListingParams[] = readJsonFile<ListingParams[]>(metadataFilePath);

metadata = metadata.map((item) => ({
  ...item,
  makerFees: item.makerFees ?? [],
}));

// Function to list NFTs for sale using the prepared bulk listings
const listNFTsForSale = async (
  client: ReturnType<typeof OrderbookClient>,
  signer: ethers.Wallet
): Promise<any> => {
  const offerer = await signer.getAddress();

  const { actions, completeListings } = await client.prepareBulkListings({
    makerAddress: offerer,
    listingParams: metadata,
  });

  let bulkListingsSignatures: string[] = [];
  for (const action of actions) {
    if (action.type === orderbook.ActionType.TRANSACTION) {
      const builtTx = await action.buildTransaction();
      console.log(`Submitting ${action.purpose} transaction`);

      // Ensure that required parameters are defined before using them
      const to = builtTx.to || '';
      const data = builtTx.data || '0x';
      const value = builtTx.value ? builtTx.value.toString() : '0x0';

      // Estimate gas dynamically and merge with static overrides
      const estimatedGas = await estimateGasOverrides(to, data, value);
      await signer.sendTransaction({ ...builtTx, ...estimatedGas });
    }

    if (action.type === orderbook.ActionType.SIGNABLE) {
      bulkListingsSignatures.push(
        await signer._signTypedData(
          action.message.domain,
          action.message.types,
          action.message.value
        )
      );
    }
  }

  return completeListings(bulkListingsSignatures);
};

// Function to display the results in a tabulated format
const displayListingResults = (results: any) => {
  console.log(
    `${'Created At'.padEnd(30)}${'Order ID'.padEnd(40)}${'Contract Address'.padEnd(
      50
    )}${'Token ID'.padEnd(20)}`
  );
  console.log('-'.repeat(140));

  results.result.forEach((listing: any) => {
    if (listing.success && listing.order) {
      const createdAt = listing.order.createdAt || 'N/A';
      const orderId = listing.order.id || 'N/A';
      const contractAddress = listing.order.sell[0]?.contractAddress || 'N/A';
      const tokenId = listing.order.sell[0]?.tokenId || 'N/A';

      console.log(
        `${createdAt.padEnd(30)}${orderId.padEnd(40)}${contractAddress.padEnd(
          50
        )}${tokenId.padEnd(20)}`
      );
    }
  });
};

// Main execution block
(async () => {
  try {
    const client = OrderbookClient(); // Use the generalized orderbook client
    const result = await listNFTsForSale(client, wallet);
    displayListingResults(result); // Display results in a tabular format
    process.exit(0); // Exit with a success status code
  } catch (error) {
    console.error('Error listing NFTs:', error);
    process.exit(1); // Exit with an error status code
  }
})();
