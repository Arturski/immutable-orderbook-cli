// client.ts
import { orderbook, blockchainData } from '@imtbl/sdk';
import { PUBLISHABLE_KEY, ENVIRONMENT } from './config';

// Function to create and return a new Orderbook client
export const OrderbookClient = (): orderbook.Orderbook => {
  return new orderbook.Orderbook({
    baseConfig: {
      environment: ENVIRONMENT,
      publishableKey: PUBLISHABLE_KEY,
    },
  });
};

// Function to create and return a new Orderbook client
export const DataClient = (): blockchainData.BlockchainData => {
    return new blockchainData.BlockchainData({
      baseConfig: {
        environment: ENVIRONMENT,
        publishableKey: PUBLISHABLE_KEY,
      },
    });
  };