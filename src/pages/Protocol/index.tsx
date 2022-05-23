import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { AutoColumn } from 'components/Column';
import { TYPE } from 'theme';
import { ResponsiveRow, RowBetween, RowFixed } from 'components/Row';
import LineChart from 'components/LineChart/alt';
import useTheme from 'hooks/useTheme';
import { DarkGreyCard } from 'components/Card';
import { formatDollarAmount } from 'utils/numbers';
import Percent from 'components/Percent';
import { HideMedium, HideSmall, StyledInternalLink } from '../../theme';
import TokenTable from 'components/tokens/TokenTable';
import { PageWrapper, ThemedBackgroundGlobal } from 'pages/styled';
import BarChart from 'components/BarChart/alt';
import { SmallOptionButton } from 'components/Button';
import { MonoSpace } from 'components/shared';
import { useActiveNetworkVersion } from 'state/application/hooks';
import { VolumeWindow } from 'types';
import { useBalancerTokens } from '../../data/balancer/useTokens';
import { useBalancerProtocolData } from '../../data/balancer/useProtocolData';
import PoolTable from '../../components/pools/PoolTable';
import { useBalancerPools } from '../../data/balancer/usePools';
import SwapsTable from '../../components/TransactionsTable/SwapsTable';
import Loader, { LocalLoader } from '../../components/Loader';
import { useTransformedVolumeData } from 'hooks/chart';
import { useBalancerChainProtocolData } from 'data/balancer/useAggregatedProtocolData';
import { ArbitrumNetworkInfo, EthereumNetworkInfo, PolygonNetworkInfo} from 'constants/networks';
import { CHAIN_COLORS } from 'constants/tokenColorList';
import { client, arbitrumClient, arbitrumBlockClient, polygonClient, polygonBlockClient } from 'apollo/client';
import StackedAreaChart from 'components/StackedAreaChart';
import BarChartStacked from 'components/BarChartStacked';

const ChartWrapper = styled.div`
    width: 49%;

    ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
  `};
`;

export default function Protocol() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const theme = useTheme();

    const [activeNetwork] = useActiveNetworkVersion();


    const protocolData = useBalancerChainProtocolData(EthereumNetworkInfo.clientUri, EthereumNetworkInfo.startTimeStamp);
    const protocolArbitrumData = useBalancerChainProtocolData(ArbitrumNetworkInfo.clientUri, ArbitrumNetworkInfo.startTimeStamp, arbitrumBlockClient, arbitrumClient);
    const protocolPolygonData = useBalancerChainProtocolData(PolygonNetworkInfo.clientUri, PolygonNetworkInfo.startTimeStamp, polygonBlockClient, polygonClient);



    //Looping through protocol data, as this one has the longest chain
    const aggregatedTVL:any[] = [];
    let  protocolTVL = 0;
    //Create aggregate / stitched together TVL test:
    if (protocolData.tvlData && protocolArbitrumData.tvlData && protocolPolygonData.tvlData) {
        //time, value, chainId
        
        protocolData.tvlData.forEach((el) => {
            //add chain info
            const aggregatedEntry = {
                time: el.time,
                Mainnet: el.value,
                Arbitrum: NaN,
                Polygon: NaN,
            }
            const arbitrumEntry = protocolArbitrumData.tvlData.find((arbItem) => arbItem.time === el.time);
            const polygonEntry = protocolPolygonData.tvlData.find((polyItem) => polyItem.time === el.time);
            if (arbitrumEntry?.time) {
                aggregatedEntry['Arbitrum'] = arbitrumEntry.value;
            }
            if (polygonEntry?.time) {
                aggregatedEntry['Polygon'] = polygonEntry.value;
            }

            aggregatedTVL.push(aggregatedEntry);
        })
        if (protocolData.tvl && protocolArbitrumData.tvl && protocolPolygonData.tvl) {
            protocolTVL = protocolData.tvl + protocolArbitrumData.tvl + protocolPolygonData.tvl;
        }
    }

    //Create aggregate volume & fee data
    const aggregatedVolume:any[] = [];
    let  protocolVolume = 0;



    if (protocolData.volumeData && protocolArbitrumData.volumeData && protocolPolygonData.volumeData) {
        //time, value, chainId
        
        protocolData.volumeData.forEach((el) => {
            //add chain info
            const aggregatedEntry = {
                time: el.time,
                Mainnet: el.value,
                Arbitrum: 0,
                Polygon: 0,
            }
            const arbitrumEntry = protocolArbitrumData.volumeData.find((arbItem) => arbItem.time === el.time);
            const polygonEntry = protocolPolygonData.volumeData.find((polyItem) => polyItem.time === el.time);
            if (arbitrumEntry?.time) {
                aggregatedEntry['Arbitrum'] = arbitrumEntry.value;
            }
            if (polygonEntry?.time) {
                aggregatedEntry['Polygon'] = polygonEntry.value;
            }

            aggregatedVolume.push(aggregatedEntry);
        })
        if (protocolData.volume24 && protocolArbitrumData.volume24 && protocolPolygonData.volume24) {
            protocolVolume = protocolData.volume24 + protocolArbitrumData.volume24 + protocolPolygonData.volume24;
        }
    }

    const aggregatedWeeklyVolume:any[] = [];
    const weeklyVolumeData = useTransformedVolumeData(protocolData?.volumeData, 'week');
    const weeklyArbitrumVolumeData = useTransformedVolumeData(protocolArbitrumData?.volumeData, 'week');
    const weeklyPolygonVolumeData = useTransformedVolumeData(protocolPolygonData?.volumeData, 'week');

    if (weeklyVolumeData && weeklyArbitrumVolumeData && weeklyPolygonVolumeData) {
        //time, value, chainId
        
        weeklyVolumeData.forEach((el) => {
            //add chain info
            const aggregatedEntry = {
                time: el.time,
                Mainnet: el.value,
                Arbitrum: 0,
                Polygon: 0,
            }
            const arbitrumEntry = weeklyArbitrumVolumeData.find((arbItem) => arbItem.time === el.time);
            const polygonEntry = weeklyPolygonVolumeData.find((polyItem) => polyItem.time === el.time);
            if (arbitrumEntry?.time) {
                aggregatedEntry['Arbitrum'] = arbitrumEntry.value;
            }
            if (polygonEntry?.time) {
                aggregatedEntry['Polygon'] = polygonEntry.value;
            }

            aggregatedWeeklyVolume.push(aggregatedEntry);
        })
    }

    const [volumeHover, setVolumeHover] = useState<number | undefined>();
    const [liquidityHover, setLiquidityHover] = useState<number | undefined>();
    const [feesHover, setFeesHover] = useState<number | undefined>();
    const [swapsHover, setSwapsHover] = useState<number | undefined>();
    const [leftLabel, setLeftLabel] = useState<string | undefined>();
    const [rightLabel, setRightLabel] = useState<string | undefined>();
    const [swapsLabel, setSwapsLabel] = useState<string | undefined>();
    const [feesLabel, setFeesLabel] = useState<string | undefined>();
    
    useEffect(() => {
        setLiquidityHover(protocolTVL);
        setVolumeHover(protocolVolume);
        setFeesHover(undefined);
        setSwapsHover(undefined);
    }, [activeNetwork, protocolTVL]);

    const [volumeWindow, setVolumeWindow] = useState(VolumeWindow.weekly);
    const [feeWindow, setFeeWindow] = useState(VolumeWindow.weekly);
    const [swapWindow, setSwapWindow] = useState(VolumeWindow.weekly);


    // if hover value undefined, reset to current day value
    useEffect(() => {
        if (!volumeHover && protocolData) {
            setVolumeHover(protocolVolume);
        }
    }, [volumeHover, protocolData]);

    useEffect(() => {
        if (liquidityHover === undefined && protocolTVL > 0) {
          setLiquidityHover(protocolTVL)
        }
      }, [liquidityHover, protocolData])

    useEffect(() => {
        if (!feesHover && protocolData) {
            setFeesHover(protocolData.fees24);
        }
    }, [feesHover, protocolData]);

    useEffect(() => {
        if (!swapsHover && protocolData?.swaps24) {
            setSwapsHover(protocolData.swaps24);
        }
    }, [swapsHover, protocolData]);


    //Sorted by time-window
    
    const monthlyVolumeData = useTransformedVolumeData(protocolData?.volumeData, 'month');

    const weeklyFeeData = useTransformedVolumeData(protocolData?.feeData, 'week');
    const monthlyFeeData = useTransformedVolumeData(protocolData?.feeData, 'month');

    const weeklySwapData = useTransformedVolumeData(protocolData?.swapData, 'week');
    const monthlySwapData = useTransformedVolumeData(protocolData?.swapData, 'month');

    return (
        <PageWrapper>
            <ThemedBackgroundGlobal backgroundColor={activeNetwork.bgColor} />
            <AutoColumn gap="16px">
                <TYPE.largeHeader>Protocol Overview</TYPE.largeHeader>
                {protocolData.tvlData && protocolArbitrumData.tvlData && protocolPolygonData.tvlData ?
                <ResponsiveRow>
                    <ChartWrapper>
                        <StackedAreaChart
                            data={aggregatedTVL}
                            tokenSet={['Mainnet', 'Arbitrum', 'Polygon']}
                            height={220}
                            minHeight={332}
                            color={activeNetwork.primaryColor}
                            value={liquidityHover}
                            label={leftLabel}
                            setValue={setLiquidityHover}
                            setLabel={setLeftLabel}
                            topLeft={
                                <AutoColumn gap="4px">
                                    <TYPE.mediumHeader fontSize="16px">TVL</TYPE.mediumHeader>
                                    <TYPE.largeHeader fontSize="32px">
                                        <MonoSpace>{formatDollarAmount(liquidityHover, 2, true)} </MonoSpace>
                                    </TYPE.largeHeader>
                                    <TYPE.main fontSize="12px" height="14px">
                                        {leftLabel ? <MonoSpace>{leftLabel} (UTC)</MonoSpace> : null}
                                    </TYPE.main>
                                </AutoColumn>
                            }
                        />
                    </ChartWrapper>
                    {protocolData.volumeData && protocolArbitrumData.volumeData && protocolPolygonData.volumeData ?
                    <ChartWrapper>
                    <BarChartStacked
                            height={220}
                            minHeight={332}
                            data={aggregatedWeeklyVolume}
                            color={activeNetwork.primaryColor}
                            tokenSet={['Mainnet', 'Arbitrum', 'Polygon']}
                            setValue={setVolumeHover}
                            setLabel={setRightLabel}
                            value={volumeHover}
                            label={rightLabel}
                            topLeft={
                                <AutoColumn gap="4px">
                                    <TYPE.mediumHeader fontSize="16px">Trading Volume</TYPE.mediumHeader>
                                    <TYPE.largeHeader fontSize="32px">
                                        <MonoSpace> {formatDollarAmount(volumeHover, 2)}</MonoSpace>
                                    </TYPE.largeHeader>
                                    <TYPE.main fontSize="12px" height="14px">
                                        {rightLabel ? <MonoSpace>{rightLabel} (UTC)</MonoSpace> : null}
                                    </TYPE.main>
                                </AutoColumn>
                            }
                        />
                    </ChartWrapper> : null }
                </ResponsiveRow> : null }
                {protocolData?.swapData?.length?
                <ResponsiveRow>
                <ChartWrapper>
                <BarChart
                            height={220}
                            minHeight={332}
                            data={
                                swapWindow === VolumeWindow.monthly
                                  ? monthlySwapData
                                  : swapWindow === VolumeWindow.weekly
                                  ? weeklySwapData
                                  : protocolData.swapData
                              }
                            color={activeNetwork.primaryColor}
                            setValue={setSwapsHover}
                            setLabel={setSwapsLabel}
                            value={swapsHover}
                            label={swapsLabel}
                            activeWindow={swapWindow}
                            topRight={
                                <RowFixed style={{ marginLeft: '-40px', marginTop: '8px' }}>
                                    <SmallOptionButton
                                        active={swapWindow === VolumeWindow.daily}
                                        onClick={() => setSwapWindow(VolumeWindow.daily)}
                                    >
                                        D
                                    </SmallOptionButton>
                                    <SmallOptionButton
                                        active={swapWindow === VolumeWindow.weekly}
                                        style={{ marginLeft: '8px' }}
                                        onClick={() => setSwapWindow(VolumeWindow.weekly)}
                                    >
                                        W
                                    </SmallOptionButton>
                                    <SmallOptionButton
                                        active={swapWindow === VolumeWindow.monthly}
                                        style={{ marginLeft: '8px' }}
                                        onClick={() => setSwapWindow(VolumeWindow.monthly)}
                                    >
                                        M
                                    </SmallOptionButton>
                                </RowFixed>
                            }
                            topLeft={
                                <AutoColumn gap="4px">
                                    <TYPE.mediumHeader fontSize="16px">Swaps</TYPE.mediumHeader>
                                    <TYPE.largeHeader fontSize="32px">
                                        <MonoSpace> {formatDollarAmount(swapsHover, 2)}</MonoSpace>
                                    </TYPE.largeHeader>
                                    <TYPE.main fontSize="12px" height="14px">
                                        {swapsLabel ? <MonoSpace>{swapsLabel} (UTC)</MonoSpace> : null}
                                    </TYPE.main>
                                </AutoColumn>
                            }
                        />
                </ChartWrapper>
                <ChartWrapper>
                        <BarChart
                            height={220}
                            minHeight={332}
                            data={
                                feeWindow === VolumeWindow.monthly
                                  ? monthlyFeeData
                                  : feeWindow === VolumeWindow.weekly
                                  ? weeklyFeeData
                                  : protocolData.feeData
                            
                            }
                            color={activeNetwork.primaryColor}
                            setValue={setFeesHover}
                            setLabel={setFeesLabel}
                            value={feesHover}
                            label={feesLabel}
                            activeWindow={feeWindow}
                            topRight={
                                <RowFixed style={{ marginLeft: '-40px', marginTop: '8px' }}>
                                    <SmallOptionButton
                                        active={feeWindow === VolumeWindow.daily}
                                        onClick={() => setFeeWindow(VolumeWindow.daily)}
                                    >
                                        D
                                    </SmallOptionButton>
                                    <SmallOptionButton
                                        active={feeWindow === VolumeWindow.weekly}
                                        style={{ marginLeft: '8px' }}
                                        onClick={() => setFeeWindow(VolumeWindow.weekly)}
                                    >
                                        W
                                    </SmallOptionButton>
                                    <SmallOptionButton
                                        active={feeWindow === VolumeWindow.monthly}
                                        style={{ marginLeft: '8px' }}
                                        onClick={() => setFeeWindow(VolumeWindow.monthly)}
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
                {protocolData?.volumeChange?
                <HideSmall>
                    <DarkGreyCard>
                        <RowBetween>
                            <RowFixed>
                                <RowFixed mr="20px">
                                    <TYPE.main mr="4px">Volume 24H: </TYPE.main>
                                    <TYPE.label mr="4px">{formatDollarAmount(protocolData.volume24)}</TYPE.label>
                                    <Percent value={protocolData.volumeChange} wrap={true} />
                                </RowFixed>
                                <RowFixed mr="20px">
                                    <TYPE.main mr="4px">Fees 24H: </TYPE.main>
                                    <TYPE.label mr="4px">{formatDollarAmount(protocolData.fees24)}</TYPE.label>
                                    <Percent value={protocolData.feesChange} wrap={true} />
                                </RowFixed>
                                <HideMedium>
                                    <RowFixed mr="20px">
                                        <TYPE.main mr="4px">TVL: </TYPE.main>
                                        <TYPE.label mr="4px">{formatDollarAmount(protocolData.tvl)}</TYPE.label>
                                        <TYPE.main></TYPE.main>
                                        <Percent value={protocolData.tvlChange} wrap={true} />
                                    </RowFixed>
                                </HideMedium>
                            </RowFixed>
                        </RowBetween>
                    </DarkGreyCard>
                </HideSmall> : null }
            </AutoColumn>
        </PageWrapper>
    );
}
