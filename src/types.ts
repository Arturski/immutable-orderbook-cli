// types.ts
export type ERC721Item = {
    contractAddress: string;
    tokenId: string;
    type: 'ERC721';
    amount?: null;
};

export type ERC1155Item = {
    contractAddress: string;
    tokenId: string;
    type: 'ERC1155';
    amount: string;
};

export type ERC20Item = {
    amount: string;
    type: 'ERC20';
    contractAddress: string;
};

export type NativeItem = {
    amount: string;
    type: 'NATIVE';
};

export type FeeValue = {
    amount: string;
    recipientAddress: string;
};

export type ListingParams = {
    sell: ERC721Item | ERC1155Item;
    buy: ERC20Item | NativeItem;
    makerFees: FeeValue[];
    orderExpiry?: Date;
};

export interface Transfer {
    tokenId: bigint;
    destinationAddress: string;
}
