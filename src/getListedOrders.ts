// getListedOrders.ts
import { OrderbookClient } from './client';
import { handleError } from './errorHandler';
import * as fs from 'fs';
import * as path from 'path';
import { orderbook } from '@imtbl/sdk';

// Listing Filters Configuration
const LISTING_FILTERS = {
    contractAddress: undefined,
    accountAddress: "0xD509997AB62fDA51c32E64E69Fb090DF8894105e", // Set an account address if needed
    fromUpdatedAt: undefined, // Set date if needed, e.g., '2022-03-09T05:00:50.52Z'
    sortBy: 'created_at' as 'created_at' | 'updated_at' | 'buy_item_amount',
    sortDirection: 'asc' as 'asc' | 'desc',
    pageSize: 200,
    status: orderbook.OrderStatusName.ACTIVE, // Set default status as ACTIVE
  };

// Save the indexed listings to a JSON file
const outputFilePath = path.resolve(__dirname, 'dataio/outputListedOrders.json');

// Function to get listings based on input parameters
const getListings = async (params = LISTING_FILTERS) => {
  try {
    const client = OrderbookClient();
    const listingsData = await client.listListings({
      sellItemContractAddress: params.contractAddress,
      accountAddress: params.accountAddress,
      fromUpdatedAt: params.fromUpdatedAt,
      sortBy: params.sortBy,
      sortDirection: params.sortDirection,
      pageSize: params.pageSize,
      status: params.status,
    });

    // Index the listings by their "id"
    const indexedListings = Object.fromEntries(
      listingsData.result.map((listing: any) => [listing.id, listing])
    );

    try {
      fs.writeFileSync(outputFilePath, JSON.stringify(indexedListings, null, 4));
      console.log(`Indexed listings saved to ${outputFilePath}`);
    } catch (fileError) {
      console.error('Error writing to file:', fileError);
    }

    // Print a tabbed summary of the listings
    console.log(
      `${'Order ID'.padEnd(40)}${'Status'.padEnd(10)}${'Sell Contract Address'.padEnd(45)}${'Sell Token ID'}`);
    console.log('-'.repeat(150));
    listingsData.result.forEach((listing: any) => {
      const orderId = listing.id;
      const sellTokenId = listing.sell[0].tokenId;
      const sellContractAddress = listing.sell[0].contractAddress;
      const status = listing.status.name;
      console.log(
        `${orderId.padEnd(40)}${status.padEnd(10)}${sellContractAddress.padEnd(45)}${sellTokenId}`
      );
    });
  } catch (error) {
    handleError(error, 'getListings');
    process.exit(1); // Exit with an error status code
  }
};

// Main execution block for direct script usage
(async () => {
  try {
    await getListings();
    process.exit(0); // Force exit the script after successful execution
  } catch (error) {
    handleError(error, 'Main execution - getListings');
    process.exit(1); // Exit with error code if there's an exception
  }
})();
