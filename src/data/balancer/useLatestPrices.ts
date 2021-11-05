import { PoolData } from '../../state/pools/reducer';
import { useBalancerPools } from './usePools';

export function useLatestPrices(poolId: string): PoolData | null {
    const pools = useBalancerPools();
    const pool = pools.find((pool) => pool.id === poolId);

    return pool || null;
}
