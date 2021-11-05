import { TokenData } from 'state/tokens/reducer';
import { useEffect, useState } from 'react';
import { PoolData } from 'state/pools/reducer';
import { useBalancerTokens } from './useTokens';
import { useBalancerPools } from './usePools';

export function useFetchSearchResults(value: string): {
    tokens: TokenData[];
    pools: PoolData[];
    loading: boolean;
} {
    const allTokens = useBalancerTokens();
    const allPools = useBalancerPools();
    const [tokenData, setTokenData] = useState<TokenData[]>([]);
    const [poolData, setPoolData] = useState<PoolData[]>([]);

    useEffect(() => {
        if (value && value.length > 0) {
            const expression = new RegExp(value, 'i');
            const filteredTokens = allTokens.filter(
                (token) => token.name.search(expression) || token.symbol.match(expression),
            );
            const filteredPools = allPools.filter(
                (pool) => pool.name.match(expression) || pool.symbol.match(expression),
            );

            setTokenData(filteredTokens);
            setPoolData(filteredPools);
        }
    }, [value]);

    return {
        tokens: tokenData,
        pools: poolData,
        loading: false,
    };
}
