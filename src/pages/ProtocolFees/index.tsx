import React, { useEffect } from 'react';
import { PageWrapper } from 'pages/styled';
import { AutoColumn } from 'components/Column';
import { HideSmall, TYPE } from 'theme';
import TokenTable from 'components/tokens/TokenTable';
import ProtocolFeeTokenTable from 'components/tokens/ProtocolFeeTokenTable';
import { useSavedTokens } from 'state/user/hooks';
import { DarkGreyCard } from 'components/Card';
import { useBalancerTokens } from '../../data/balancer/useTokens';
import { GetProtocolFeeTokenSet } from 'utils/getProtocolFeeCollectorTokens';

export default function ProtocolFees() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const formattedTokens = useBalancerTokens();

    if (formattedTokens) {
        GetProtocolFeeTokenSet(formattedTokens);
    }

    return (
        <PageWrapper>
            <AutoColumn gap="lg">
                <TYPE.main>Protocol Fee Collector Tokens</TYPE.main>
                <ProtocolFeeTokenTable tokenDatas={formattedTokens} />
            </AutoColumn>
        </PageWrapper>
    );
}