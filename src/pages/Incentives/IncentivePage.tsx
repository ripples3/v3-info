import React, { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import styled from 'styled-components';
import { useColor } from 'hooks/useColor';
import { PageWrapper, ThemedBackground } from 'pages/styled';
import { getEtherscanLink, swapFeePercent, tokenWeightPercent } from 'utils';
import { AutoColumn } from 'components/Column';
import Row, { AutoRow, RowBetween, RowFixed } from 'components/Row';
import { StyledInternalLink, TYPE } from 'theme';
import Loader, { LocalLoader } from 'components/Loader';
import { Download, ExternalLink } from 'react-feather';
import { ExternalLink as StyledExternalLink } from '../../theme/components';
import useTheme from 'hooks/useTheme';
import CurrencyLogo from 'components/CurrencyLogo';
import { formatAmount, formatDollarAmount } from 'utils/numbers';
import Percent from 'components/Percent';
import { ButtonGray, ButtonPrimary, SavedIcon } from 'components/Button';
import { DarkGreyCard, GreyBadge, GreyCard } from 'components/Card';
import LineChart from 'components/LineChart/alt';
import { ToggleElementFree, ToggleWrapper } from 'components/Toggle/index';
import BarChart from 'components/BarChart/alt';
import PoolCurrencyLogo from 'components/PoolCurrencyLogo';
import TransactionTable from 'components/TransactionsTable/SwapsTable';
import { useSavedPools } from 'state/user/hooks';
import { MonoSpace } from 'components/shared';
import { useActiveNetworkVersion } from 'state/application/hooks';
import { networkPrefix } from 'utils/networkPrefix';
import { EthereumNetworkInfo } from 'constants/networks';
import { Transaction } from '../../types';
import { useBalancerPoolData, useBalancerPoolPageData } from '../../data/balancer/usePools';
import { useBalancerTransactionData } from '../../data/balancer/useTransactions';
import SwapsTable from 'components/TransactionsTable/SwapsTable';
import { BalPieChart } from '../../components/PieChart/BalPieChart';
import JoinExitTable from '../../components/TransactionsTable/JoinExitTable';
import { BALANCER_APP_LINK } from '../../data/balancer/constants';

const ContentLayout = styled.div`
    display: grid;
    grid-template-columns: 300px 1fr;
    grid-gap: 1em;

    @media screen and (max-width: 800px) {
        grid-template-columns: 1fr;
        grid-template-rows: 1fr 1fr;
    }
`;

const TokenButton = styled(GreyCard)`
    padding: 8px 12px;
    border-radius: 10px;
    :hover {
        cursor: pointer;
        opacity: 0.6;
    }
`;

const ResponsiveRow = styled(RowBetween)`
    ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
    align-items: flex-start;
    row-gap: 24px;
    width: 100%:
  `};
`;

const TokenResponsiveRow = styled(Row)`
    ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
    align-items: flex-start;
    row-gap: 24px;
    width: 100%:
  `};
`;

const ToggleRow = styled(RowBetween)`
    @media screen and (max-width: 600px) {
        flex-direction: column;
    }
`;

enum ChartView {
    TVL,
    VOL,
    PRICE,
    DENSITY,
    FEES,
}

export default function IncentivePage({
    match: {
        params: { poolId },
    },
}: RouteComponentProps<{ poolId: string }>) {
    const [activeNetwork] = useActiveNetworkVersion();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // theming
    const backgroundColor = useColor();
    const theme = useTheme();

    const poolData = useBalancerPoolData(poolId);
    const { tvlData, volumeData, feesData } = useBalancerPoolPageData(poolId);
    const { swaps, joinExits, swapPairVolumes } = useBalancerTransactionData(
        (poolData?.tokens || []).map((token) => token.address),
        poolData ? [poolData.id] : [],
    );

    const [view, setView] = useState(ChartView.VOL);
    const [latestValue, setLatestValue] = useState<number | undefined>();
    const [valueLabel, setValueLabel] = useState<string | undefined>();

    //watchlist
    const [savedPools, addSavedPool] = useSavedPools();

    return (
        <PageWrapper>
            <ThemedBackground backgroundColor={backgroundColor} />
            {'TODO: Porting from balancer.tools'}
        </PageWrapper>
    );
}
