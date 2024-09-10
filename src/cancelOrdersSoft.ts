// cancelOrdersSoft.ts
import { OrderbookClient } from './client'; // Import the orderbook client
import { handleError } from './errorHandler'; // Error handler utility
import { wallet, readJsonFile } from './utils'; // Import utilities from utils
import * as path from 'path';

  // Define the path to the input JSON file for soft cancels
  const inputFilePath = path.resolve(__dirname, 'dataio/inputCancelOrdersSoft.json');

// Function to perform a soft cancel (gasless) of listings
const softCancelListings = async (
  client: any,
  signer: typeof wallet, // Use the wallet type from utils
  listingIds: string[]
) => {
  try {
    const account = await signer.getAddress();

    // Prepare the soft cancel action
    const { signableAction } = await client.prepareOrderCancellations(listingIds);

    // Sign the cancellation action
    const cancellationSignature = await signer._signTypedData(
      signableAction.message.domain,
      signableAction.message.types,
      signableAction.message.value,
    );

    // Send the cancellation request with the signature
    const result = await client.cancelOrders(listingIds, account, cancellationSignature);
    console.log('Cancellation Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    handleError(error, 'softCancelListings');
  }
};

// Main execution block
(async () => {
  try {
    // Read order IDs from the input file using the utility function
    const orderIds = readJsonFile<{ orderIds: string[] }>(inputFilePath).orderIds;

    if (!orderIds || orderIds.length === 0) {
      console.error('No order IDs found in the input file. Please check the file format.');
      process.exit(1);
    }

    const client = OrderbookClient();

    // Perform soft cancel for each order using the imported wallet from utils
    await softCancelListings(client, wallet, orderIds);

    process.exit(0);
  } catch (error) {
    handleError(error, 'Main execution - softCancelOrders');
    process.exit(1);
  }
})();

export { softCancelListings };
