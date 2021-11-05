import { useGetLatestBlockQuery } from '../../apollo/generated/graphql-codegen-generated';
import { blockClient } from '../../apollo/client';

export function useLatestBlock(): number | undefined {
    const { data } = useGetLatestBlockQuery({ pollInterval: 5000, client: blockClient });

    return data?.blocks[0]?.number ? parseFloat(data?.blocks[0]?.number) : undefined;
}
