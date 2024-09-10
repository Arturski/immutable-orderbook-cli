# Immutable Orderbook CLI examples

This toolkit provides a set of scripts for managing NFTs on Immutable's orderbook, including listing, canceling (both hard and soft), and fetching NFTs owned by a particular account. It is designed to interact with the Immutable SDK via an EOA wallet which doesnt require a browser to sign transactions, enabling projects to perform order-related operations on the open orderbook.

## Features

- **Listing Orders**: Bulk list NFTs for sale using specific configurations.  
- **Cancel Listed Orders**: Cancel orders using soft (gasless) and hard (on-chain) cancellations.  
- **Fetch Inventory**: Retrieve all NFTs owned by a specific account with pagination handling.  
- **Fetch Existing Order Listings**: Fetch and display listings based on input parameters.  
- **Fetch Specific Orders by ID**: Retrieve detailed information on specific orders by ID.  

## Prerequisites

- **Node.js**: Ensure you have Node.js (v14 or later) installed.  
- **Yarn or npm**: Yarn is recommended for managing dependencies.  
- **Immutable SDK**: This toolkit uses the `@imtbl/sdk` package to interact with the Immutable blockchain.  
- **.env File**: You need to configure your environment variables for connecting to the blockchain.  

## Setup

1. **Clone the Repository**

   ```bash  
   git clone <repository-url>  
   cd <project-name>
   ```

2. **Install Dependencies**

   Install required dependencies using Yarn or npm:

   ```bash  
   yarn install
   # or  
   npm install  
   ```

3. **Create a `.env` File**

   Create a `.env` file in the root directory and add the following environment variables:

   ```env  
   PRIVATE_KEY=<YOUR_PRIVATE_KEY>  
   RPC_URL=<YOUR_RPC_URL>  
   PUBLISHABLE_KEY=<YOUR_PUBLISHABLE_KEY>  
   ```

   Ensure these variables are correctly set as they are crucial for interacting with the blockchain.

## Configuration

Modify the `config.ts` file to adjust input parameters from `.env`

## Usage

### 1. **Listing NFTs**

List NFTs using predefined input configurations.

```bash  
ts-node src/listOrders.ts  
```

Place your listing parameters in `dataio/inputListOrders.json`.

### 2. **Soft Cancel Orders**

Perform a gasless (off-chain) cancel of specified orders.

```bash  
ts-node src/cancelOrdersSoft.ts  
```

Ensure the order IDs to cancel are listed in `dataio/inputCancelOrdersSoft.json`.

### 3. **Hard Cancel Orders**

Perform an on-chain cancel of specified orders, ensuring the cancellation is recorded on the blockchain.

```bash  
ts-node src/cancelOrdersHard.ts  
```

Ensure the order IDs to cancel are listed in `dataio/inputCancelOrdersHard.json`.

### 4. **Fetch Owned NFTs**

Retrieve and display all NFTs owned by a specified account, with pagination handling. Filters can be found inside `src/getInventory.ts` sctipt

```bash  
ts-node src/getInventory.ts  
```

Output is saved to `dataio/outputInventory.json`.

### 5. **Get Listings**

Fetch and display listings based on specified filters. Filters can be found inside `src/getListedOrders.ts` sctipt

```bash  
ts-node src/getListedOrders.ts  
```

Output is saved to `dataio/outputListedOrders.json`.

### 6. **Get Listing by ID**

Fetch details of a specific listing using its order ID.

```bash  
ts-node src/getListedOrdersById.ts <order-id>  
```

Replace `<order-id>` with the actual order ID you want to query.

## Error Handling

Errors are captured and logged through the `handleError` function in `errorHandler.ts`. Ensure that any unexpected behavior or failures are reviewed through these logs for troubleshooting.

## Security Considerations

- **Private Key Handling**: Ensure your private keys are secured and never exposed in code or logs.  
- **Environment Variables**: Use secure methods (e.g., AWS Secrets Manager, HashiCorp Vault) for managing sensitive environment variables, especially in production environments.  

## Future Improvements

- **Error Resilience**: Implement retry logic and backoff strategies for network operations.  
- **Performance Optimization**: Enhance batch processing with concurrency limits to improve performance.  
- **Advanced Logging**: Integrate structured logging and monitoring for better observability.  

## License

This project is licensed under the MIT License.

## Contributing

Contributions are welcome! Please submit pull requests or raise issues to discuss potential improvements.

---
