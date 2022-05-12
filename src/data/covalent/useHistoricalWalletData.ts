import { useDeltaTimestamps } from '../../utils/queries';
import { useBlocksFromTimestamps } from '../../hooks/useBlocksFromTimestamps';
import { BalancerSwapFragment, useGetProtocolDataLazyQuery } from '../../apollo/generated/graphql-codegen-generated';
import { useEffect } from 'react';
import { unixToDate } from '../../utils/date';
import { BalancerChartDataItem } from 'data/balancer/balancerTypes';
import { useActiveNetworkVersion } from 'state/application/hooks';
import { GetAddressHistoricalTokenData, WalletHistoryData } from '../../utils/getAddressHistoricalTokenData';
import { COVALENT_TOKEN_BLACKLIST } from './tokenBlackList';

interface WalletHistoricalData {
    totalValueData: BalancerChartDataItem[];
    tvl?: number;
}

interface BalancerDateChartItem {
    value: number;
    time: Date;
}

export function useHistoricalWalletData(address: string): WalletHistoricalData {

    function getWalletBalancerChartData(walletData: WalletHistoryData) {
        const chartData: BalancerDateChartItem[] = [];
        if (walletData) {
            //Iterate through each timepoint, then obtain total value from all positions (no restrictions on position size)
            for (let holdingsIndex = 0; holdingsIndex <= 30; holdingsIndex++) {
                //obtain timestamp from first element
                const chartItem = {} as BalancerDateChartItem;
                chartItem.value = 0;
                chartItem.time = new Date(walletData.data.items[0].holdings[holdingsIndex].timestamp);
                //Sum up all token holdings
                walletData.data.items.forEach((item) => {
                    if (!COVALENT_TOKEN_BLACKLIST.includes(item.contract_address)) {
                    if (item.holdings[holdingsIndex].close.quote && typeof item.holdings[holdingsIndex].close.quote === 'number') {
                            chartItem.value += Number(item.holdings[holdingsIndex].close.quote);
                    }
                }

                })
                chartData.push(chartItem);
            }
        }
        return chartData;
    }

    const walletHistoricalData = GetAddressHistoricalTokenData(address)

    if (!walletHistoricalData) {
        return { 
            totalValueData: [], 
        };
    }

    //console.log("rawWalletData", walletHistoricalData);
    const walletChartData = getWalletBalancerChartData(walletHistoricalData);

    //Sort data
    const sortedAsc = walletChartData.sort(
        (objA, objB) => objA.time.getTime() - objB.time.getTime(),
    );

    //Map back to BalancerChartDataItem
    const sortedWalletChartData = sortedAsc.map(item => {
        return <BalancerChartDataItem>{
            value: item.value,
            time: item.time.toString(),
        }
    }
    )

    return {
        totalValueData: sortedWalletChartData,
        tvl: sortedWalletChartData[sortedWalletChartData.length - 1].value,
    };
}
