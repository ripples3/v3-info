import React, { useState, useMemo, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { ExtraSmallOnly, HideExtraSmall, TYPE } from 'theme';
import { DarkGreyCard } from 'components/Card';
import Loader, { LoadingRows } from 'components/Loader';
import { Link } from 'react-router-dom';
import { AutoColumn } from 'components/Column';
import CurrencyLogo from 'components/CurrencyLogo';
import { RowFixed } from 'components/Row';
import { formatDollarAmount } from 'utils/numbers';
import Percent from 'components/Percent';
import { Label, ClickableText } from '../Text';
import { PageButtons, Arrow, Break } from 'components/shared';
import HoverInlineText from '../HoverInlineText';
import useTheme from 'hooks/useTheme';
import { TOKEN_HIDE } from '../../constants/index';
import { TokenListToken } from '../../state/token-lists/token-lists';
import { TokenData } from '../../data/balancer/balancerTypes';
import getCuratedTokenName from 'utils/getCuratedTokenName';
import { ERC20TokenData, WalletTokenData } from 'utils/getAddressTokenBalances';
const Wrapper = styled(DarkGreyCard)`
    width: 100%;
`;

const ResponsiveGrid = styled.div`
    display: grid;
    grid-gap: 1em;
    align-items: center;

    grid-template-columns: 20px 3fr repeat(4, 1fr);

    @media screen and (max-width: 900px) {
        grid-template-columns: 20px 1.5fr repeat(3, 1fr);
        & :nth-child(4) {
            display: none;
        }
    }

    @media screen and (max-width: 800px) {
        grid-template-columns: 20px 1.5fr repeat(2, 1fr);
        & :nth-child(6) {
            display: none;
        }
    }

    @media screen and (max-width: 670px) {
        grid-template-columns: repeat(2, 1fr);
        > *:first-child {
            display: none;
        }
        > *:nth-child(3) {
            display: none;
        }
    }
`;

const LinkWrapper = styled(Link)`
    text-decoration: none;
    :hover {
        cursor: pointer;
        opacity: 0.7;
    }
`;

const ResponsiveLogo = styled(CurrencyLogo)`
    @media screen and (max-width: 670px) {
        width: 16px;
        height: 16px;
    }
`;

const DataRow = ({ tokenData, index }: { tokenData: TokenData; index: number }) => {
    const theme = useTheme();
    return (
        <LinkWrapper to={'tokens/' + tokenData.address}>
            <ResponsiveGrid>
                <Label>{index + 1}</Label>
                <Label>
                    <RowFixed>
                        <ResponsiveLogo address={tokenData.address} />
                    </RowFixed>
                    <ExtraSmallOnly style={{ marginLeft: '6px' }}>
                        <Label ml="8px">{getCuratedTokenName(tokenData)}</Label>
                    </ExtraSmallOnly>
                    <HideExtraSmall style={{ marginLeft: '10px' }}>
                        <RowFixed>
                            <HoverInlineText text={tokenData.name} />
                            <Label ml="8px" color={theme.text3}>
                                ({getCuratedTokenName(tokenData)})
                            </Label>
                        </RowFixed>
                    </HideExtraSmall>
                </Label>
                <Label end={1} fontWeight={400}>
                    {formatDollarAmount(tokenData.priceUSD)}
                </Label>
                <Label end={1} fontWeight={400}>
                    <Percent value={tokenData.priceUSDChange} fontWeight={400} />
                </Label>
                <Label end={1} fontWeight={400}>
                    {formatDollarAmount(tokenData.volumeUSD)}
                </Label>
                <Label end={1} fontWeight={400}>
                    {formatDollarAmount(tokenData.valueUSDCollected)}
                </Label>
            </ResponsiveGrid>
        </LinkWrapper>
    );
};

const SORT_FIELD = {
    name: 'name',
    volumeUSD: 'volumeUSD',
    priceUSD: 'priceUSD',
    priceUSDChange: 'priceUSDChange',
    priceUSDChangeWeek: 'priceUSDChangeWeek',
    valueUSDCollected: 'valueUSDCollected',
};

const MAX_ITEMS = 30;

export default function ProtocolFeeTokenTable({
    tokenDatas,
    walletTokenDatas,
    maxItems = MAX_ITEMS,
}: {
    tokenDatas: TokenData[] | undefined;
    walletTokenDatas?: WalletTokenData;
    maxItems?: number;
}) {
    // theming
    const theme = useTheme();

    // for sorting
    const [sortField, setSortField] = useState(SORT_FIELD.valueUSDCollected);
    const [sortDirection, setSortDirection] = useState<boolean>(true);

    console.log("walletTokenDatas", walletTokenDatas);

    function curateTokenDatas(tokenDatas: TokenData[], walletTokenData: WalletTokenData): TokenData[] {
        const newTokenDatas: TokenData[] = [];
        walletTokenData.data.items.forEach(( item: ERC20TokenData ) => {
            tokenDatas.forEach(( tokenData: TokenData ) => {
            if (item.contract_address === tokenData.address && Number(parseInt(item.balance) / 10 ** item.contract_decimals * tokenData.priceUSD) > 5000 ) {
                tokenData.valueUSDCollected = Number(parseInt(item.balance) / 10 ** item.contract_decimals * tokenData.priceUSD);
                newTokenDatas.push(tokenData);
            }
        });
        
    });
    return newTokenDatas;
    }

    //Reassign token data set
    if (tokenDatas && walletTokenDatas) {
        tokenDatas = curateTokenDatas(tokenDatas, walletTokenDatas);
    }
    

    // pagination
    const [page, setPage] = useState(1);
    const [maxPage, setMaxPage] = useState(1);
    useEffect(() => {
        let extraPages = 1;
        if (tokenDatas) {
            if (tokenDatas.length % maxItems === 0) {
                extraPages = 0;
            }
            setMaxPage(Math.floor(tokenDatas.length / maxItems) + extraPages);
        }
    }, [maxItems, tokenDatas]);

    const sortedTokens = useMemo(() => {
        return tokenDatas
            ? tokenDatas
                  .filter((x) => !!x && !TOKEN_HIDE.includes(x.address))
                  .sort((a, b) => {
                      if (a && b) {
                          return a[sortField as keyof TokenData] > b[sortField as keyof TokenData]
                              ? (sortDirection ? -1 : 1) * 1
                              : (sortDirection ? -1 : 1) * -1;
                      } else {
                          return -1;
                      }
                  })
                  .slice(maxItems * (page - 1), page * maxItems)
            : [];
    }, [tokenDatas, maxItems, page, sortDirection, sortField]);

    const handleSort = useCallback(
        (newField: string) => {
            setSortField(newField);
            setSortDirection(sortField !== newField ? true : !sortDirection);
        },
        [sortDirection, sortField],
    );

    const arrow = useCallback(
        (field: string) => {
            return sortField === field ? (!sortDirection ? '↑' : '↓') : '';
        },
        [sortDirection, sortField],
    );

    if (!tokenDatas || !walletTokenDatas) {
        return <Loader />;
    }

    return (
        <Wrapper>
            {sortedTokens.length > 0 ? (
                <AutoColumn gap="8px">
                    <ResponsiveGrid>
                        <Label color={theme.text2}>#</Label>
                        <ClickableText color={theme.text2} onClick={() => handleSort(SORT_FIELD.name)}>
                            Name {arrow(SORT_FIELD.name)}
                        </ClickableText>
                        <ClickableText color={theme.text2} end={1} onClick={() => handleSort(SORT_FIELD.priceUSD)}>
                            Price {arrow(SORT_FIELD.priceUSD)}
                        </ClickableText>
                        <ClickableText
                            color={theme.text2}
                            end={1}
                            onClick={() => handleSort(SORT_FIELD.priceUSDChange)}
                        >
                            Price Change {arrow(SORT_FIELD.priceUSDChange)}
                        </ClickableText>
                        <ClickableText color={theme.text2} end={1} onClick={() => handleSort(SORT_FIELD.volumeUSD)}>
                            Volume 24H {arrow(SORT_FIELD.volumeUSD)}
                        </ClickableText>
                        <ClickableText color={theme.text2} end={1} onClick={() => handleSort(SORT_FIELD.valueUSDCollected)}>
                            Collected {arrow(SORT_FIELD.valueUSDCollected)}
                        </ClickableText>
                    </ResponsiveGrid>

                    <Break />
                    {sortedTokens.map((data, i) => {
                        if (data) {
                            return (
                                <React.Fragment key={i}>
                                    <DataRow index={(page - 1) * MAX_ITEMS + i} tokenData={data} />
                                    <Break />
                                </React.Fragment>
                            );
                        }
                        return null;
                    })}
                    <PageButtons>
                        <div
                            onClick={() => {
                                setPage(page === 1 ? page : page - 1);
                            }}
                        >
                            <Arrow faded={page === 1 ? true : false}>←</Arrow>
                        </div>
                        <TYPE.body>{'Page ' + page + ' of ' + maxPage}</TYPE.body>
                        <div
                            onClick={() => {
                                setPage(page === maxPage ? page : page + 1);
                            }}
                        >
                            <Arrow faded={page === maxPage ? true : false}>→</Arrow>
                        </div>
                    </PageButtons>
                </AutoColumn>
            ) : (
                <LoadingRows>
                    <div />
                    <div />
                    <div />
                    <div />
                    <div />
                    <div />
                    <div />
                    <div />
                    <div />
                    <div />
                    <div />
                    <div />
                </LoadingRows>
            )}
        </Wrapper>
    );
}
