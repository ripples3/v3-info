import React, { useEffect, useState } from 'react';
import ReactGA from 'react-ga';
import styled from 'styled-components';
import { PageWrapper } from 'pages/styled';
import useTheme from 'hooks/useTheme';
import { AutoColumn } from 'components/Column';
import { ResponsiveRow, RowBetween, RowFixed } from 'components/Row';
import { getEtherscanLink, shortenAddress } from 'utils';
import { ExternalLink } from 'react-feather';
import { MonoSpace } from 'components/shared';
import { formatDollarAmount } from 'utils/numbers';
import Loader, { LocalLoader } from 'components/Loader';
import LineChart from 'components/LineChart/alt';
import { VolumeWindow } from 'types';
import { TYPE } from 'theme';
import { SmallOptionButton } from 'components/Button';
import ProtocolFeeTokenTable from 'components/tokens/ProtocolFeeTokenTable';
import { DarkGreyCard } from 'components/Card';
import { useBalancerTokens } from '../../data/balancer/useTokens';
import { GetAddressTokenBalances } from 'utils/getAddressTokenBalances';
import { useBalancerProtocolData } from 'data/balancer/useProtocolData';
import { useActiveNetworkVersion } from 'state/application/hooks';
import { useTransformedVolumeData } from 'hooks/chart';
import BarChart from 'components/BarChart/alt';
import { BalancerChartDataItem } from 'data/balancer/balancerTypes';
import { ExternalLink as StyledExternalLink } from '../../theme/components';
import { useHistoricalWalletData } from 'data/covalent/useHistoricalWalletData';
import DebankLogo from '../../assets/svg/debank.svg';
import { SupportedNetwork } from 'constants/networks';

const ChartWrapper = styled.div`
    width: 49%;

    ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
  `};
`;

const StyledDebankLogo = styled.img`
    height: 16px;
    display: flex;
    justify-content: center;
    align-items: center;
`;

export default function ProtocolFees() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const theme = useTheme();

    const [activeNetwork] = useActiveNetworkVersion();
    const protocolData = useBalancerProtocolData();
    const formattedTokens = useBalancerTokens();
    const walletTokenData = GetAddressTokenBalances();
    const historicalCollectorData = useHistoricalWalletData();
    const debankLink = 'https://debank.com/profile/0xce88686553686da562ce7cea497ce749da109f9f';


    const [feesHover, setFeesHover] = useState<number | undefined>();
    const [feesLabel, setFeesLabel] = useState<string | undefined>();
    const [liquidityHover, setLiquidityHover] = useState<number | undefined>();
    const [leftLabel, setLeftLabel] = useState<string | undefined>();

    useEffect(() => {
        setFeesHover(undefined);
        setLiquidityHover(undefined);
    }, [activeNetwork]);

    useEffect(() => {
        if (!feesHover && protocolData.fees24) {
            setFeesHover(protocolData.fees24 * 0.5);
        }
    }, [feesHover, protocolData]);

    useEffect(() => {
        if (liquidityHover === undefined && historicalCollectorData) {
            setLiquidityHover(historicalCollectorData.tvl)
        }
    }, [liquidityHover, protocolData])


    function adjustFees(data: BalancerChartDataItem[] | undefined) {
        const newData: BalancerChartDataItem[] = [];
        if (data) {
            data.forEach((entry) => {
                const date = new Date(entry.time);
                if (date > new Date('2022-01-03')) {
                    const newEntry = {} as BalancerChartDataItem;
                    newEntry.time = entry.time;
                    newEntry.value = entry.value * 0.5;
                    newData.push(newEntry);
                }
            })

        }
        return newData;
    }

    const [volumeWindow, setVolumeWindow] = useState(VolumeWindow.weekly);
    const weeklyVolumeData = useTransformedVolumeData(adjustFees(protocolData?.feeData), 'week');
    const monthlyVolumeData = useTransformedVolumeData(adjustFees(protocolData?.feeData), 'month');

    let sweepLimit = 0;
    if (activeNetwork.id === SupportedNetwork.ETHEREUM) {
        sweepLimit = 10000;
    } else {
        sweepLimit = 5000;
    }

    return (
        <PageWrapper>
            <AutoColumn gap="lg">
                <TYPE.largeHeader>Protocol Fee Collector Metrics </TYPE.largeHeader> 
                           
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
                                            : adjustFees(protocolData?.feeData)

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

                        <ChartWrapper>
                            {historicalCollectorData?.tvl ?
                                <LineChart
                                    data={historicalCollectorData?.totalValueData}
                                    height={220}
                                    minHeight={332}
                                    color={activeNetwork.primaryColor}
                                    value={liquidityHover}
                                    label={leftLabel}
                                    setValue={setLiquidityHover}
                                    setLabel={setLeftLabel}
                                    topLeft={
                                        <AutoColumn gap="4px">
                                            <TYPE.mediumHeader fontSize="16px">Net Worth</TYPE.mediumHeader>
                                            <TYPE.largeHeader fontSize="32px">
                                                <MonoSpace>{formatDollarAmount(liquidityHover, 2, true)} </MonoSpace>
                                            </TYPE.largeHeader>
                                            <TYPE.main fontSize="12px" height="14px">
                                                {leftLabel ? <MonoSpace>{leftLabel} (UTC)</MonoSpace> : null}
                                            </TYPE.main>
                                        </AutoColumn>
                                    }
                                    topRight={
                                        <RowFixed align="top" justify="center">
                                        {debankLink && (
                                            <StyledExternalLink
                                                href={debankLink}
                                                style={{ marginLeft: '12px' }}
                                                onClickCapture={() => {
                                                    ReactGA.event({
                                                        category: 'Debank',
                                                        action: 'Debank portfolio page click',
                                                    });
                                                }}
                                            >
                                                <StyledDebankLogo src={DebankLogo} />
                                            </StyledExternalLink>
                                        )}
                                        <StyledExternalLink href={getEtherscanLink(1, '0xce88686553686da562ce7cea497ce749da109f9f', 'address', activeNetwork)}>
                                            <ExternalLink
                                                stroke={theme.text2}
                                                size={'17px'}
                                                style={{ marginLeft: '12px' }}
                                            />
                                        </StyledExternalLink>
                                        </RowFixed>
                                    }
                                /> : (
                                    <AutoColumn gap="lg" justify='flex-start'>
                                        <DarkGreyCard>
                                            <TYPE.main fontSize="18px">Loading historical fee collector data...</TYPE.main>
                                            <LocalLoader fill={false} />
                                        </DarkGreyCard>
                                    </ AutoColumn>
                                )}
                        </ChartWrapper>
                    </ResponsiveRow> : <Loader />}
                <TYPE.main>Tokens to be swept</TYPE.main> 
                <ProtocolFeeTokenTable tokenDatas={formattedTokens} walletTokenDatas={walletTokenData} sweepLimitActive={true} />
                <TYPE.main> Tokens below weekly sweep threshold ({formatDollarAmount(sweepLimit, 0, true)}) </TYPE.main> 
                <ProtocolFeeTokenTable tokenDatas={formattedTokens} walletTokenDatas={walletTokenData} sweepLimitActive={false} />
            </AutoColumn>
        </PageWrapper>
    );
}