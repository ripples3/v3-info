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

export interface PoolTokenData {
    name: string;
    symbol: string;
    address: string;
    decimals: number;
    derivedETH: number;
    price: number;
    tvl: number;
    weight: number;
}

export interface PoolData {
    id: string;
    name: string;
    symbol: string;
    // basic token info
    address: string;
    feeTier: number;
    swapFee: number;

    tokens: PoolTokenData[];

    // for tick math
    liquidity: number;
    sqrtPrice: number;
    tick: number;

    // volume
    volumeUSD: number;
    volumeUSDChange: number;
    volumeUSDWeek: number;

    // liquidity
    tvlUSD: number;
    tvlUSDChange: number;

    feesUSD: number;
}
