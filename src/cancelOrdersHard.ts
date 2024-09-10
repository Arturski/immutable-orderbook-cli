import { OrderbookClient } from './client';
import { handleError } from './errorHandler';
import { orderbook } from '@imtbl/sdk';
import { wallet, handleTransaction, estimateGasOverrides } from './utils'; // Updated import to include estimateGasOverrides
import * as fs from 'fs';
import * as path from 'path';

// Define the path to the input JSON file for hard cancels
const inputFilePath = path.resolve(__dirname, 'dataio/inputCancelOrdersHard.json');

// Function to perform a hard cancel by notifying the settlement contract of the cancelled order
const hardCancelListingOnChain = async (
  client: orderbook.Orderbook,
  signer: typeof wallet,
  listingId: string
) => {
  try {
    const offerer = await signer.getAddress();
    const { cancellationAction } = await client.cancelOrdersOnChain([listingId], offerer);

    // Extract the necessary details for gas estimation
    const builtTx = await cancellationAction.buildTransaction();
    const to = builtTx.to || '';
    const data = builtTx.data || '0x';
    const value = builtTx.value ? builtTx.value.toString() : '0x0';

    // Estimate gas dynamically and merge with static overrides
    const estimatedGas = await estimateGasOverrides(to, data, value);
    
    // Use handleTransaction to process the cancellation action with estimated gas
    const transactionResult = await handleTransaction(signer, cancellationAction, estimatedGas);

    if (transactionResult) {
      console.log(`Order ${listingId} has been successfully hard cancelled.`);
    } else {
      console.error(`Failed to send transaction for order ${listingId}.`);
    }
  } catch (error) {
    // Log the specific error and check for order status details
    if (error instanceof Error) {
      console.error(`Error hard cancelling order ${listingId}: ${error.message}`);
      // Attempt to log the full error object for more insights
      console.log('Full error details:', error);
    } else {
      console.error(`Unknown error hard cancelling order ${listingId}:`, error);
    }
  }
};

// Function to read JSON input file with order IDs for hard cancel
const readHardCancelOrders = (filePath: string): string[] => {
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    const parsedData = JSON.parse(data);
    return parsedData.orderIds || [];
  } catch (error) {
    console.error('Error reading or parsing the hard cancel input file:', error);
    return [];
  }
};

// Main execution block
(async () => {
  try {
    // Read order IDs from the input file
    const orderIds = readHardCancelOrders(inputFilePath);

    if (orderIds.length === 0) {
      console.error('No order IDs found in the input file. Please check the file format.');
      process.exit(1);
    }

    const client = OrderbookClient();

    // Perform hard cancel for each order
    for (const orderId of orderIds) {
      await hardCancelListingOnChain(client, wallet, orderId);
    }

    process.exit(0);
  } catch (error) {
    handleError(error, 'Main execution - hardCancelOrders');
    process.exit(1);
  }
})();

export { hardCancelListingOnChain, readHardCancelOrders };
