// config.ts
import dotenv from 'dotenv';
import { config } from '@imtbl/sdk';

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY as string;
const RPC_URL = process.env.RPC_URL as string;
const PUBLISHABLE_KEY = process.env.PUBLISHABLE_KEY || '';
const ENVIRONMENT = config.Environment.SANDBOX; // Set environment, can be made configurable if needed

if (!PRIVATE_KEY || !RPC_URL || !PUBLISHABLE_KEY) {
  console.error('Please set PRIVATE_KEY, RPC_URL, PUBLISHABLE_KEY, and COLLECTION_ADDRESS in your .env file');
  process.exit(1);
}

export {
  PRIVATE_KEY,
  RPC_URL,
  PUBLISHABLE_KEY,
  ENVIRONMENT,
};
