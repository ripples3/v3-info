import {
    BalancerJoinExitFragment,
    BalancerSwapFragment,
    useGetTransactionDataLazyQuery,
} from '../../apollo/generated/graphql-codegen-generated';
import { useEffect, useRef } from 'react';
import { BALANCER_SUBGRAPH_START_TIMESTAMP } from './constants';
import { orderBy } from 'lodash';

export function useBalancerTransactionData(
    addresses: string[],
    poolIds: string[],
): { swaps: BalancerSwapFragment[]; joinExits: BalancerJoinExitFragment[] } {
    const [getTokenTransactionData, { data }] = useGetTransactionDataLazyQuery();
    const ref = useRef<{ poolIds: string[]; addresses: string[] }>({ poolIds: [], addresses: [] });

    useEffect(() => {
        if (poolIds.length !== ref.current.poolIds.length || addresses.length !== ref.current.addresses.length) {
            ref.current = { poolIds, addresses };

            getTokenTransactionData({
                variables: {
                    addresses,
                    poolIds,
                    startTimestamp: BALANCER_SUBGRAPH_START_TIMESTAMP,
                },
            });
        }
    }, [poolIds, addresses]);

    const swaps = orderBy([...(data?.swapsIn || []), ...(data?.swapsOut || [])], 'timestamp', 'desc');

    return {
        swaps,
        joinExits: data?.joinExits || [],
    };
}
