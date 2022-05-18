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
import { formatAmount, formatDollarAmount } from 'utils/numbers';
import Loader, { LocalLoader } from 'components/Loader';
import LineChart from 'components/LineChart/alt';
import { VolumeWindow } from 'types';
import { TYPE } from 'theme';
import { SmallOptionButton } from 'components/Button';
import { DarkGreyCard, GreyBadge, GreyCard } from 'components/Card';
import { useBalancerTokens } from '../../data/balancer/useTokens';
import { GetAddressTokenBalances } from 'utils/getAddressTokenBalances';
import { useBalancerProtocolData } from 'data/balancer/useProtocolData';
import { useActiveNetworkVersion } from 'state/application/hooks';
import { useTransformedVolumeData } from 'hooks/chart';
import Percent from 'components/Percent';
import { BalancerChartDataItem } from 'data/balancer/balancerTypes';
import { ExternalLink as StyledExternalLink } from '../../theme/components';
import { useHistoricalWalletData } from 'data/covalent/useHistoricalWalletData';
import DebankLogo from '../../assets/svg/debank.svg';
import { SupportedNetwork } from 'constants/networks';
import curateTokenDatas from 'utils/curateTokenDatas';
import { TokenData } from 'data/balancer/balancerTypes';
import { COVALENT_TOKEN_BLACKLIST } from 'data/covalent/tokenBlackList';
import { TREASURY_ADDRESS } from 'constants/wallets';
import TreasuryTokenPortfolioTable from 'components/tokens/TreasuryTokenPortfolioTable';
import CurrencyLogo from 'components/CurrencyLogo';
import StackedAreaChart from 'components/StackedAreaChart';
import { useColor } from 'hooks/useColor';
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

const ContentLayout = styled.div`
    display: grid;
    grid-template-columns: 300px 1fr;
    grid-gap: 1em;

    @media screen and (max-width: 800px) {
        grid-template-columns: 1fr;
        grid-template-rows: 1fr 1fr;
    }
`;

//Todo: Export interface
interface BalancerStackedDateChartItem {
    value: number;
    time: Date;
}

export default function Treasury() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const theme = useTheme();

    const [activeNetwork] = useActiveNetworkVersion();
    const protocolData = useBalancerProtocolData();
    const formattedTokens = useBalancerTokens();
    const walletTokenData = GetAddressTokenBalances(TREASURY_ADDRESS);
    const historicalCollectorData = useHistoricalWalletData(TREASURY_ADDRESS);
    const debankLink = 'https://debank.com/profile/' + TREASURY_ADDRESS;
    const bbaUsdAddress = '0x7b50775383d3d6f0215a8f290f2c9e2eebbeceb2';
    let usdcAddress = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
    let balAddress = '0xba100000625a3754423978a60c9317c58a424e3d';


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

    //Monthly metrics
    let monthlyHigh = 0;
    let monthlyLow = 0;
    let dailyChange = 0;
    if(historicalCollectorData.totalValueData) { 
        historicalCollectorData?.totalValueData.forEach((entry) => {
            if (monthlyHigh < entry.value) {
                monthlyHigh = entry.value;
            }
            if (monthlyLow === 0 || monthlyLow > entry.value) {
                monthlyLow = entry.value;
            }
        });
    }
    if (historicalCollectorData?.totalValueData.length) {
        dailyChange = historicalCollectorData.totalValueData[historicalCollectorData.totalValueData.length - 1].value - historicalCollectorData.totalValueData[historicalCollectorData.totalValueData.length - 2].value;
    }


      const addressSet :string[] = [];
      const tokenSet :string[] = [];


    const [volumeWindow, setVolumeWindow] = useState(VolumeWindow.daily);
    const weeklyVolumeData = useTransformedVolumeData(adjustFees(protocolData?.feeData), 'week');
    const monthlyVolumeData = useTransformedVolumeData(adjustFees(protocolData?.feeData), 'month');

    //Get curated token dataset to calcuate BAL and bb-a-USD distribution values
    let curatedTokenDatas: TokenData[] = [];
    if (formattedTokens && walletTokenData) {
        curatedTokenDatas = curateTokenDatas(formattedTokens, walletTokenData, 10000, true);
        curatedTokenDatas = curatedTokenDatas.filter((x) => !!x && !COVALENT_TOKEN_BLACKLIST.includes(x.address));
    }

    //
    //--------Test for net income estimation----------
    let sweepLimit = 0;
    if (activeNetwork.id === SupportedNetwork.ETHEREUM) {
        sweepLimit = 10000;
    } else if (activeNetwork.id == SupportedNetwork.ARBITRUM) {
        balAddress = '0x040d1edc9569d4bab2d15287dc5a4f10f56a56b8';
        usdcAddress = '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8';
        sweepLimit = 5000;
    } else if (activeNetwork.id == SupportedNetwork.POLYGON) {
        balAddress = '0x9a71012B13CA4d3D0Cdc72A177DF3ef03b0E76A3';
        usdcAddress = '0x2791bca1f2de4661ed88a30c99a7a9449aa84174';
        sweepLimit = 5000;
    }

    //Get curated token dataset to calcuate BAL and bb-a-USD distribution values
    let totalAmount = 0;
    let curatedProjectionData: TokenData[] = [];
    if (formattedTokens && walletTokenData) {
        curatedProjectionData = curateTokenDatas(formattedTokens, walletTokenData, sweepLimit, true);
        curatedProjectionData = curatedProjectionData.filter((x) => !!x && !COVALENT_TOKEN_BLACKLIST.includes(x.address));
        curatedProjectionData.forEach ((item) => {
            if (item.address) {
                addressSet.push(item.address);
            }
            const token = walletTokenData.data.items.find(x => x.contract_address == item.address)
            if (token && token.contract_ticker_symbol) {
                tokenSet.push(token?.contract_ticker_symbol)
            }
            totalAmount += item.valueUSDCollected;
        });
    }

    //console.log("addressSet", addressSet);
    //console.log("tokenSet", tokenSet)

    const tokenColors :string[] = [];
    //addressSet.forEach ((el) => {
    //    const color = useColor(el);
    //    tokenColors.push(color);
    //});

    const color1 = useColor(addressSet[0]);
    const color2 = useColor(addressSet[1]);
    const color3 = useColor(addressSet[2]);
    const color4 = useColor(addressSet[3]);
    tokenColors.push(color1);
    tokenColors.push(color2);
    tokenColors.push(color3);
    tokenColors.push(color4);

    const balAssets = curatedProjectionData.find((x) => x.address == balAddress);

   //TODO: fix edge case redundancy code here ( this happens right after a sweep):
   let isEmptySet = false;
   if (formattedTokens && walletTokenData) {
       if (formattedTokens.length > 0 && curateTokenDatas(formattedTokens, walletTokenData, sweepLimit, true).length == 0) {
           isEmptySet = true;
       }
   }

    //------------------------------------------------

    if (activeNetwork.id !== SupportedNetwork.ETHEREUM) {
        return (
            <AutoColumn gap="lg">
                <TYPE.largeHeader>Please switch back to Mainnet!</TYPE.largeHeader>
            </AutoColumn>
        );
    }
    return (
        <PageWrapper>
            <AutoColumn gap="lg">
                <TYPE.largeHeader>Balancer DAO Treasury</TYPE.largeHeader>
                <ContentLayout>
                    {historicalCollectorData?.tvl && balAssets ?
                    
                        <DarkGreyCard>
                            <AutoColumn gap="lg">
                            <GreyCard padding="16px">
                            <AutoColumn gap="4px">
                                        <TYPE.main>BAL reserves</TYPE.main>
                                        <RowBetween key={'balReserves'}>
                                            <RowFixed>
                                                <CurrencyLogo address={balAddress} size={'20px'} />
                                                <TYPE.label fontSize="14px" ml="8px">
                                                    {'BAL'}
                                                </TYPE.label>
                                            </RowFixed>
                                            <TYPE.label fontSize="14px">{formatAmount(balAssets.valueUSDCollected / balAssets.priceUSD)}</TYPE.label>
                                        </RowBetween>
                                    </AutoColumn>
                                </GreyCard>
                            <AutoColumn gap="lg">
                                <AutoColumn gap="4px">
                                    <TYPE.main fontWeight={400}>30d High</TYPE.main>
                                    <TYPE.label fontSize="24px">{formatDollarAmount(monthlyHigh)}</TYPE.label>
                                    <Percent value={100 / historicalCollectorData?.tvl * monthlyHigh - 100} />
                                </AutoColumn>
                                <AutoColumn gap="4px">
                                    <TYPE.main fontWeight={400}>30d Low</TYPE.main>
                                    <TYPE.label fontSize="24px">{formatDollarAmount(monthlyLow)}</TYPE.label>
                                    <Percent value={100 / historicalCollectorData?.tvl * monthlyLow - 100} />
                                </AutoColumn>
                                <AutoColumn gap="4px">
                                    <TYPE.main fontWeight={400}>24h Change</TYPE.main>
                                    <TYPE.label fontSize="24px">{formatDollarAmount(Math.abs(dailyChange))}</TYPE.label>
                                    <Percent value={100 / historicalCollectorData?.tvl * dailyChange} />
                                </AutoColumn>
                            </AutoColumn>
                            </AutoColumn>
                        </DarkGreyCard>
                        : <AutoColumn gap="lg" justify='flex-start'>
                            <DarkGreyCard>
                                <TYPE.main fontSize="18px">Fetching historical data...</TYPE.main>
                                <LocalLoader fill={false} />
                            </DarkGreyCard>
                        </ AutoColumn>}
                    {historicalCollectorData?.tvl ?
                        <LineChart
                            data={historicalCollectorData?.totalValueData}
                            height={220}
                            minHeight={400}
                            color={activeNetwork.primaryColor}
                            value={liquidityHover}
                            label={leftLabel}
                            setValue={setLiquidityHover}
                            setLabel={setLeftLabel}
                            topLeft={
                                <AutoColumn gap="4px">
                                    <TYPE.mediumHeader fontSize="16px">Token Holding Reserve</TYPE.mediumHeader>
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
                                    <StyledExternalLink href={getEtherscanLink(1, TREASURY_ADDRESS, 'address', activeNetwork)}>
                                        <ExternalLink
                                            stroke={theme.text2}
                                            size={'17px'}
                                            style={{ marginLeft: '12px' }}
                                        />
                                    </StyledExternalLink>
                                </RowFixed>
                            }
                        /> : <AutoColumn gap="lg" justify='flex-start'>
                            <DarkGreyCard>
                                <TYPE.main fontSize="18px">Fetching historical token data...</TYPE.main>
                                <LocalLoader fill={false} />
                            </DarkGreyCard>
                        </ AutoColumn>}
                </ContentLayout>
                <ContentLayout>
                    {totalAmount > 0 && historicalCollectorData?.tvl ?
                        <DarkGreyCard>
                            <AutoColumn gap="lg">
                            <AutoColumn gap="4px">
                                    <TYPE.main fontWeight={400}>Protocol Fee Income Estimates</TYPE.main>
                                    <TYPE.label fontSize="24px">{formatDollarAmount(totalAmount)}</TYPE.label>
                                </AutoColumn>
                                <GreyCard padding="16px">
                                    <AutoColumn gap="md">
                                        <TYPE.main>Distribution to veBAL holders</TYPE.main>
                                        <RowBetween key={balAddress}>
                                            <RowFixed>
                                                <CurrencyLogo address={balAddress} size={'20px'} />
                                                <TYPE.label fontSize="14px" ml="8px">
                                                    {'BAL'}
                                                </TYPE.label>
                                            </RowFixed>
                                            <TYPE.label fontSize="14px">{formatDollarAmount(totalAmount)}</TYPE.label>
                                        </RowBetween>
                                        <RowBetween key={bbaUsdAddress}>
                                            <RowFixed>
                                                <CurrencyLogo address={bbaUsdAddress} size={'20px'} />
                                                <TYPE.label fontSize="14px" ml="8px">
                                                    {'bb-a-USD'}
                                                </TYPE.label>
                                            </RowFixed>
                                            <TYPE.label fontSize="14px">{formatDollarAmount(totalAmount * 0.75)}</TYPE.label>
                                        </RowBetween>
                                    </AutoColumn>
                                </GreyCard>
                                <GreyCard padding="16px">
                                    <AutoColumn gap="md">
                                        <TYPE.main>Distribution to DAO Treasury</TYPE.main>
                                        <RowBetween key={usdcAddress}>
                                            <RowFixed>
                                                <CurrencyLogo address={usdcAddress} size={'20px'} />
                                                <TYPE.label fontSize="14px" ml="8px">
                                                    {'USDC'}
                                                </TYPE.label>
                                            </RowFixed>
                                            <TYPE.label fontSize="14px">{formatDollarAmount(totalAmount * 0.25)}</TYPE.label>
                                        </RowBetween>
                                    </AutoColumn>
                                    
                                </GreyCard>
                                <AutoColumn gap="4px">
                                    <TYPE.main fontWeight={400}>24h Change</TYPE.main>
                                    <TYPE.label fontSize="24px">{formatDollarAmount(Math.abs(dailyChange))}</TYPE.label>
                                    <Percent value={100 / historicalCollectorData?.tvl * dailyChange} />
                                </AutoColumn> 
                            </AutoColumn>
                        </DarkGreyCard>
                        : 
                        <AutoColumn gap="lg" justify='flex-start'>
                            {! isEmptySet ? 
                        <DarkGreyCard>
                            <TYPE.main fontSize="18px">Fetching distribution estimates...</TYPE.main>
                            <LocalLoader fill={false} /> 
                        </DarkGreyCard> : (
                                <DarkGreyCard>
                                <TYPE.main>No fees to distribute</TYPE.main>
                                </DarkGreyCard> )}
                    </ AutoColumn>}
                    {totalAmount > 0 && historicalCollectorData?.tvl ?
                        <StackedAreaChart
                            data={historicalCollectorData.tokenDatas}
                            colorSet = {tokenColors}
                            tokenSet={tokenSet}
                            height={220}
                            minHeight={500}
                        /> : <AutoColumn gap="lg" justify='flex-start'>
                            <DarkGreyCard>
                                <TYPE.main fontSize="18px">Fetching historical token data...</TYPE.main>
                                <LocalLoader fill={false} />
                            </DarkGreyCard>
                        </ AutoColumn>}
                </ContentLayout>
                <TYPE.main> Tokens in treasury wallet </TYPE.main>
                <TreasuryTokenPortfolioTable tokenDatas={curatedTokenDatas} />
                <TYPE.main> Liquidity Pools </TYPE.main>
                <TYPE.white> Coming soon... </TYPE.white>
            </AutoColumn>
        </PageWrapper>
    );
}