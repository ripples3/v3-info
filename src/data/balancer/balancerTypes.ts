export interface BalancerChartDataItem {
    value: number;
    time: string;
}

export type TokenData = {
    // token is in some pool on uniswap
    exists: boolean;

    // basic token info
    name: string;
    symbol: string;
    address: string;

    // volume
    volumeUSD: number;
    volumeUSDChange: number;
    volumeUSDWeek: number;
    txCount: number;

    //fees
    feesUSD: number;

    // tvl
    tvlToken: number;
    tvlUSD: number;
    tvlUSDChange: number;

    priceUSD: number;
    priceUSDChange: number;
    priceUSDChangeWeek: number;
};
