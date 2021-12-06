import React, { useEffect } from 'react';
import { PageWrapper } from 'pages/styled';
import { AutoColumn } from 'components/Column';
import { TYPE } from 'theme';
import PoolTable from 'components/pools/PoolTable';
import { useSavedPools } from 'state/user/hooks';
import { DarkGreyCard } from 'components/Card';
import { useBalancerPools } from '../../data/balancer/usePools';
import IncentivePoolTable from 'components/incentivePools/incentivePoolTable';
// import TopPoolMovers from 'components/pools/TopPoolMovers'

export default function PoolPage() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const [savedPools] = useSavedPools();

    const poolData = useBalancerPools();
    const watchlistPools = poolData.filter((pool) => savedPools.includes(pool.id));

    return (
        <PageWrapper>
            <AutoColumn gap="lg">
                {/* <HideSmall>
          <DarkGreyCard style={{ paddingTop: '12px' }}>
            <AutoColumn gap="md">
              <TYPE.mediumHeader fontSize="16px">Trending by 24H Volume</TYPE.mediumHeader>
              <TopPoolMovers />
            </AutoColumn>
          </DarkGreyCard>
        </HideSmall> */}
                <TYPE.main>Balancer Incentives</TYPE.main>
                <IncentivePoolTable poolDatas={poolData} />
            </AutoColumn>
        </PageWrapper>
    );
}
