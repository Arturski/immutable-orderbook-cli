import { ethers } from 'ethers';
import fs from 'fs';
import csv from 'csv-parser';
import { PRIVATE_KEY, RPC_URL } from './config';
import { Transfer } from './types';
import { orderbook } from '@imtbl/sdk';

// Initialize the provider and signer
export const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
export const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Function to read JSON file
export const readJsonFile = <T>(filePath: string): T => {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

// Function to process CSV file
export const processCSV = (csvFilePath: string): Promise<Transfer[]> => {
  const transfers: Transfer[] = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row: { token_id: string; destination_address: string }) => {
        const tokenId = BigInt(row.token_id);
        const destinationAddress = row.destination_address;
        transfers.push({ tokenId, destinationAddress });
      })
      .on('end', () => {
        resolve(transfers);
      })
      .on('error', reject);
  });
};

// Utility function to log formatted JSON data
export const logJson = (message: string, data: any) => {
  console.log(`${message}:`, JSON.stringify(data, null, 2));
};

// Function to dynamically estimate gas for a transaction
export const estimateGasOverrides = async (
  to: string,
  data?: string,
  value?: string
): Promise<{ gasLimit: number }> => {
  try {
    // Estimate gas using the eth_estimateGas method
    const gasEstimate = await provider.send('eth_estimateGas', [
      {
        to,
        data: data || '0x', // default to empty data if not provided
        value: value || '0x0', // default to zero value if not provided
      },
      'latest', // estimate based on the latest block
    ]);

    // Convert the estimated gas from hex to a number
    const gasLimit = parseInt(gasEstimate, 16);

    // Return the gas overrides object with the estimated gas limit
    return {
      gasLimit: Math.ceil(gasLimit * 1.2), // adding a buffer of 20% to prevent out-of-gas errors
    };
  } catch (error) {
    console.error('Error estimating gas:', error);
    // Fallback to default gas limit if estimation fails
    return { gasLimit: 200000 };
  }
};

// Updated function to handle transactions with improved error logging
export const handleTransaction = async (
  signer: ethers.Wallet,
  action: any,
  gasOverrides: object
) => {
  try {
    if (action.type === orderbook.ActionType.TRANSACTION) {
      const builtTx = await action.buildTransaction();
      console.log(`Submitting ${action.purpose} transaction with details:`, builtTx);

      // Estimate gas dynamically and merge with static overrides
      const estimatedGas = await estimateGasOverrides(builtTx.to, builtTx.data, builtTx.value);
      const txResponse = await signer.sendTransaction({ ...builtTx, ...gasOverrides, ...estimatedGas });

      const receipt = await txResponse.wait(); // Wait for transaction confirmation
      console.log(`Transaction successful: ${receipt.transactionHash}`);
      return receipt;
    } else if (action.type === orderbook.ActionType.SIGNABLE) {
      const signature = await signer._signTypedData(
        action.message.domain,
        action.message.types,
        action.message.value
      );
      console.log('Action signed successfully.');
      return signature;
    } else {
      console.error(`Unsupported action type: ${action.type}`);
      return null;
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error during transaction processing: ${error.message}`, error);
    } else {
      console.error('An unknown error occurred during transaction processing:', error);
    }
    return null;
  }
};
