// getListedOrdersById.ts
import { OrderbookClient } from './client';
import { handleError } from './errorHandler';
import { logJson } from './utils';

// Function to get a single listing by ID
const getListingById = async (listingId: string) => {
  try {
    const client = OrderbookClient();
    const listing = await client.getListing(listingId);
    logJson('Listing Details', listing);
  } catch (error) {
    handleError(error, 'getListingById');
  }
};

// Main execution block for direct script usage
(async () => {
  try {
    // Capture the order ID from the command line arguments
    const args = process.argv.slice(2);
    if (args.length === 0) {
      console.error('Please provide an order ID as an argument.');
      process.exit(1);
    }

    const orderId = args[0]; // Get the first argument as the order ID
    await getListingById(orderId);

    // Force exit the script after successful execution
    process.exit(0);
  } catch (error) {
    handleError(error, 'Main execution - getListingById');
    process.exit(1); // Exit with error code if there's an exception
  }
})();

export { getListingById };
