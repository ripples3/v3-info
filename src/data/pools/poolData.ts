import { useQuery } from '@apollo/client';
import gql from 'graphql-tag';
import { useDeltaTimestamps } from 'utils/queries';
import { useBlocksFromTimestamps } from 'hooks/useBlocksFromTimestamps';
import { PoolData } from 'state/pools/reducer';
import { get2DayChange } from 'utils/data';
import { formatTokenName, formatTokenSymbol } from 'utils/tokens';
import { useClients } from 'state/application/hooks';

export const POOLS_BULK = (block: number | undefined, pools: string[]) => {
    let poolString = `[`;
    pools.map((address) => {
        return (poolString += `"${address}",`);
    });
    poolString += ']';
    const queryString =
        `
    query pools {
      pools(where: {id_in: ${poolString}},` +
        (block ? `block: {number: ${block}} ,` : ``) +
        ` orderBy: totalLiquidity, orderDirection: desc) {
        id
        address
        poolType
        symbol
        name
        swapFee
        totalWeight
        totalSwapVolume
        totalSwapFee
        totalLiquidity
        totalShares
        swapsCount
        holdersCount
        
        tokens(first: 1000) {
          id
          symbol
          name
          decimals
          address
          balance
          invested
          weight
          priceRate
        }
      }
    }
    `;
    return gql(queryString);
};

interface PoolFields {
    id: string;
    name: string;
    address: string;
    poolType: PoolType;
    swapFee: string;
    owner: string;
    factory: string;
    tokens: PoolToken[];
    tokensList: string[];
    tokenAddresses: string[];
    totalLiquidity: string;
    totalShares: string;
    totalSwapFee: string;
    totalSwapVolume: string;
    hasLiquidityMiningRewards: boolean;
    swapEnabled?: boolean;
}

export enum PoolType {
    Weighted = 'Weighted',
    Stable = 'Stable',
    MetaStable = 'MetaStable',
}

export interface PoolToken {
    address: string;
    symbol: string;
    balance: string;
    weight: string;
    priceRate?: string;
}

interface PoolDataResponse {
    pools: PoolFields[];
}

/**
 * Fetch top addresses by volume
 */
export function usePoolDatas(poolAddresses: string[]): {
    loading: boolean;
    error: boolean;
    data:
        | {
              [address: string]: PoolData;
          }
        | undefined;
} {
    // get client
    const { dataClient } = useClients();

    // get blocks from historic timestamps
    const [t24, t48, tWeek] = useDeltaTimestamps();
    const { blocks, error: blockError } = useBlocksFromTimestamps([t24, t48, tWeek]);
    const [block24, block48, blockWeek] = blocks ?? [];

    const { loading, error, data } = useQuery<PoolDataResponse>(POOLS_BULK(undefined, poolAddresses), {
        client: dataClient,
    });

    const {
        loading: loading24,
        error: error24,
        data: data24,
    } = useQuery<PoolDataResponse>(POOLS_BULK(block24?.number, poolAddresses), { client: dataClient });
    const {
        loading: loading48,
        error: error48,
        data: data48,
    } = useQuery<PoolDataResponse>(POOLS_BULK(block48?.number, poolAddresses), { client: dataClient });
    const {
        loading: loadingWeek,
        error: errorWeek,
        data: dataWeek,
    } = useQuery<PoolDataResponse>(POOLS_BULK(blockWeek?.number, poolAddresses), { client: dataClient });

    const anyError = Boolean(error || error24 || error48 || blockError || errorWeek);
    const anyLoading = Boolean(loading || loading24 || loading48 || loadingWeek);

    // return early if not all data yet
    if (anyError || anyLoading) {
        return {
            loading: anyLoading,
            error: anyError,
            data: undefined,
        };
    }

    const parsed = data?.pools
        ? data.pools.reduce((accum: { [address: string]: PoolFields }, poolData) => {
              accum[poolData.id] = poolData;
              return accum;
          }, {})
        : {};
    const parsed24 = data24?.pools
        ? data24.pools.reduce((accum: { [address: string]: PoolFields }, poolData) => {
              accum[poolData.id] = poolData;
              return accum;
          }, {})
        : {};
    const parsed48 = data48?.pools
        ? data48.pools.reduce((accum: { [address: string]: PoolFields }, poolData) => {
              accum[poolData.id] = poolData;
              return accum;
          }, {})
        : {};
    const parsedWeek = dataWeek?.pools
        ? dataWeek.pools.reduce((accum: { [address: string]: PoolFields }, poolData) => {
              accum[poolData.id] = poolData;
              return accum;
          }, {})
        : {};

    // format data and calculate daily changes
    const formatted = poolAddresses.reduce((accum: { [address: string]: PoolData }, address) => {
        const current: PoolFields | undefined = parsed[address];
        const oneDay: PoolFields | undefined = parsed24[address];
        const twoDay: PoolFields | undefined = parsed48[address];
        const week: PoolFields | undefined = parsedWeek[address];

        const [volumeUSD, volumeUSDChange] =
            current && oneDay && twoDay
                ? get2DayChange(current.totalSwapVolume, oneDay.totalSwapVolume, twoDay.totalSwapVolume)
                : current
                ? [parseFloat(current.totalSwapVolume), 0]
                : [0, 0];

        const volumeUSDWeek =
            current && week
                ? parseFloat(current.totalSwapVolume) - parseFloat(week.totalSwapVolume)
                : current
                ? parseFloat(current.totalSwapVolume)
                : 0;

        const tvlUSD = current ? parseFloat(current.totalLiquidity) : 0;

        const tvlUSDChange =
            current && oneDay
                ? ((parseFloat(current.totalLiquidity) - parseFloat(oneDay.totalLiquidity)) /
                      parseFloat(oneDay.totalLiquidity)) *
                  100
                : 0;

        //const tvlToken0 = current ? parseFloat(current.totalValueLockedToken0) : 0;
        //const tvlToken1 = current ? parseFloat(current.totalValueLockedToken1) : 0;
        const tvlToken0 = 0;
        const tvlToken1 = 0;

        //const feeTier = current ? parseInt(current.feeTier) : 0;
        const feeTier = 0;

        if (current) {
            accum[address] = {
                id: '',
                address,
                feeTier,
                liquidity: parseFloat(current.totalLiquidity),
                sqrtPrice: 0,
                tick: 0,
                tokens: [],
                swapFee: 0,
                name: '',
                symbol: '',
                /*token0: {
                    address: current.tokens[0].address,
                    name: formatTokenName(current.tokens[0].address, current.tokens[0].symbol),
                    symbol: formatTokenSymbol(current.tokens[0].address, current.tokens[0].symbol),
                    //decimals: parseInt(current.tokens[0].decimals),
                    //derivedETH: parseFloat(current.tokens[0].derivedETH),
                    decimals: 18,
                    derivedETH: 0,
                },
                token1: {
                    address: current.tokens[1].address,
                    name: formatTokenName(current.tokens[1].address, current.tokens[1].symbol),
                    symbol: formatTokenSymbol(current.tokens[1].address, current.tokens[1].symbol),
                    //decimals: parseInt(current.tokens[1].decimals),
                    //derivedETH: parseFloat(current.tokens[1].derivedETH),
                    decimals: 18,
                    derivedETH: 0,
                },*/
                //token0Price: 0,
                //token1Price: 0,
                /*sqrtPrice: parseFloat(current.sqrtPrice),
                tick: parseFloat(current.tick),
                token0: {
                    address: current.tokens[0].id,
                    name: formatTokenName(current.tokens[0].id, current.tokens[0].name),
                    symbol: formatTokenSymbol(current.tokens[0].id, current.tokens[0].symbol),
                    decimals: parseInt(current.tokens[0].decimals),
                    derivedETH: parseFloat(current.tokens[0].derivedETH),
                },
                token1: {
                    address: current.tokens[1].id,
                    name: formatTokenName(current.tokens[1].id, current.tokens[1].name),
                    symbol: formatTokenSymbol(current.tokens[1].id, current.tokens[1].symbol),
                    decimals: parseInt(current.tokens[1].decimals),
                    derivedETH: parseFloat(current.tokens[1].derivedETH),
                },
                token0Price: parseFloat(current.token0Price),
                token1Price: parseFloat(current.token1Price),*/
                volumeUSD,
                volumeUSDChange,
                volumeUSDWeek,
                tvlUSD,
                tvlUSDChange,
                feesUSD: 0,
                //tvlToken0,
                //tvlToken1,
            };
        }

        return accum;
    }, {});

    return {
        loading: anyLoading,
        error: anyError,
        data: formatted,
    };
}
