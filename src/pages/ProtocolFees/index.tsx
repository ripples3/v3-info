import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { PageWrapper } from 'pages/styled';
import { AutoColumn } from 'components/Column';
import useTheme from 'hooks/useTheme';
import { ResponsiveRow, RowBetween, RowFixed } from 'components/Row';
import { MonoSpace } from 'components/shared';
import { formatDollarAmount } from 'utils/numbers';
import Loader from 'components/Loader';
import LineChart from 'components/LineChart/alt';
import { VolumeWindow } from 'types';
import { HideSmall, TYPE } from 'theme';
import TokenTable from 'components/tokens/TokenTable';
import { SmallOptionButton } from 'components/Button';
import ProtocolFeeTokenTable from 'components/tokens/ProtocolFeeTokenTable';
import { useSavedTokens } from 'state/user/hooks';
import { DarkGreyCard } from 'components/Card';
import { useBalancerTokens } from '../../data/balancer/useTokens';
import { GetProtocolFeeTokenSet } from 'utils/getProtocolFeeCollectorTokens';
import { GetAddressTokenBalances } from 'utils/getAddressTokenBalances';
import { useBalancerProtocolData } from 'data/balancer/useProtocolData';
import { useActiveNetworkVersion } from 'state/application/hooks';
import { useTransformedVolumeData } from 'hooks/chart';
import BarChart from 'components/BarChart/alt';

const ChartWrapper = styled.div`
    width: 49%;

    ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
  `};
`;

export default function ProtocolFees() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);



    const [activeNetwork] = useActiveNetworkVersion();
    const protocolData = useBalancerProtocolData();
    const formattedTokens = useBalancerTokens();
    const walletTokenData = GetAddressTokenBalances();

    const [feesHover, setFeesHover] = useState<number | undefined>();
    const [feesLabel, setFeesLabel] = useState<string | undefined>();

    useEffect(() => {
        setFeesHover(undefined);
    }, [activeNetwork]);

    useEffect(() => {
        if (!feesHover && protocolData) {
            setFeesHover(protocolData.fees24);
        }
    }, [feesHover, protocolData]);


    const [volumeWindow, setVolumeWindow] = useState(VolumeWindow.weekly);
    const weeklyVolumeData = useTransformedVolumeData(protocolData?.feeData, 'week');
    const monthlyVolumeData = useTransformedVolumeData(protocolData?.feeData, 'month');


    return (
        <PageWrapper>
            <AutoColumn gap="lg">
                <TYPE.main>Protocol Fee Collector Metrics</TYPE.main>
                {protocolData?.feeData.length > 0 ?
                <ResponsiveRow>
                <ChartWrapper>
                        <BarChart
                            height={220}
                            minHeight={332}
                            data={
                                volumeWindow === VolumeWindow.monthly
                                  ? monthlyVolumeData
                                  : volumeWindow === VolumeWindow.weekly
                                  ? weeklyVolumeData
                                  : protocolData?.feeData
                            
                            }
                            color={activeNetwork.primaryColor}
                            setValue={setFeesHover}
                            setLabel={setFeesLabel}
                            value={feesHover}
                            label={feesLabel}
                            activeWindow={volumeWindow}
                            topRight={
                                <RowFixed style={{ marginLeft: '-40px', marginTop: '8px' }}>
                                    <SmallOptionButton
                                        active={volumeWindow === VolumeWindow.daily}
                                        onClick={() => setVolumeWindow(VolumeWindow.daily)}
                                    >
                                        D
                                    </SmallOptionButton>
                                    <SmallOptionButton
                                        active={volumeWindow === VolumeWindow.weekly}
                                        style={{ marginLeft: '8px' }}
                                        onClick={() => setVolumeWindow(VolumeWindow.weekly)}
                                    >
                                        W
                                    </SmallOptionButton>
                                    <SmallOptionButton
                                        active={volumeWindow === VolumeWindow.monthly}
                                        style={{ marginLeft: '8px' }}
                                        onClick={() => setVolumeWindow(VolumeWindow.monthly)}
                                    >
                                        M
                                    </SmallOptionButton>
                                </RowFixed>
                            }
                            topLeft={
                                <AutoColumn gap="4px">
                                    <TYPE.mediumHeader fontSize="16px">Collected fees</TYPE.mediumHeader>
                                    <TYPE.largeHeader fontSize="32px">
                                        <MonoSpace> {formatDollarAmount(feesHover, 2)}</MonoSpace>
                                    </TYPE.largeHeader>
                                    <TYPE.main fontSize="12px" height="14px">
                                        {feesLabel ? <MonoSpace>{feesLabel} (UTC)</MonoSpace> : null}
                                    </TYPE.main>
                                </AutoColumn>
                            }
                        />
                    </ChartWrapper>
                </ResponsiveRow> : <Loader/> }
                <ProtocolFeeTokenTable tokenDatas={formattedTokens} walletTokenDatas={walletTokenData} />
            </AutoColumn>
        </PageWrapper>
    );
}