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


    const balAmount = 10
    const bbaUSDAmount = 10
    const [volumeWindow, setVolumeWindow] = useState(VolumeWindow.daily);
    const weeklyVolumeData = useTransformedVolumeData(adjustFees(protocolData?.feeData), 'week');
    const monthlyVolumeData = useTransformedVolumeData(adjustFees(protocolData?.feeData), 'month');

    //Get curated token dataset to calcuate BAL and bb-a-USD distribution values
    let curatedTokenDatas: TokenData[] = [];
    if (formattedTokens && walletTokenData) {
        curatedTokenDatas = curateTokenDatas(formattedTokens, walletTokenData, 10000, true);
        curatedTokenDatas = curatedTokenDatas.filter((x) => !!x && !COVALENT_TOKEN_BLACKLIST.includes(x.address));
    }

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
                    {historicalCollectorData?.tvl ?
                        <DarkGreyCard>
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
                <TYPE.main> Tokens in treasury wallet </TYPE.main>
                <TreasuryTokenPortfolioTable tokenDatas={curatedTokenDatas} />
                <TYPE.main> Liquidity Pools </TYPE.main>
                <TYPE.white> Coming soon... </TYPE.white>
            </AutoColumn>
        </PageWrapper>
    );
}