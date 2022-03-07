import { LatestPrice, useGetLatestPricesQuery } from '../../apollo/generated/graphql-codegen-generated';
import { useActiveNetworkVersion } from 'state/application/hooks';
import { SupportedNetwork } from 'constants/networks';

//TODO: Network dependent address fetching!
const WETH_ADDRESS = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';

export const getBalTokenAddress = (networkId: SupportedNetwork) => {
    switch (networkId) {
      case SupportedNetwork.ETHEREUM:
        return '0xba100000625a3754423978a60c9317c58a424e3d';
      case SupportedNetwork.ARBITRUM:
        return '0x040d1edc9569d4bab2d15287dc5a4f10f56a56b8';
        
      case SupportedNetwork.POLYGON:
        return '0x9a71012b13ca4d3d0cdc72a177df3ef03b0e76a3';
      default:
        return '0xba100000625a3754423978a60c9317c58a424e3d';
    } 
  }

  export const getWethTokenAddress = (networkId: SupportedNetwork) => {
    switch (networkId) {
      case SupportedNetwork.ETHEREUM:
        return '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
      case SupportedNetwork.ARBITRUM:
        return '0x82af49447d8a07e3bd95bd0d56f35241523fbab1';
      case SupportedNetwork.POLYGON:
        return '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619';
      default:
        return '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
    } 
  }



const reducer = (previousValue: number, currentValue: number) => previousValue + currentValue;

export function useLatestPrices(): { eth?: number; bal?: number } {
    // eslint-disable-next-line
    const [activeNetwork] = useActiveNetworkVersion();
    const { data } = useGetLatestPricesQuery({ 
        variables: { where: { asset_in: [getWethTokenAddress(activeNetwork.id), getBalTokenAddress(activeNetwork.id)] } },
        context: {
            uri: activeNetwork.clientUri,
        },
    });
    const prices = data?.latestPrices || [];

    //Calculate average price from multi-pool Info explicitly (as we have complex type otherwise for reduce function)
    let balSum = 0;
    let balCounter = 0;
    let ethSum = 0;
    let ethCounter = 0;
    for (const price of prices) {
        if (price.asset ===  getBalTokenAddress(activeNetwork.id)) {
            balSum += Number(price.priceUSD);
            balCounter +=1;
        }
        else if (price.asset === getWethTokenAddress(activeNetwork.id)){
            ethSum += Number(price.priceUSD);
            ethCounter +=1;
        }
    }
    const bal = balSum / balCounter;
    const eth = ethSum / ethCounter;
    //var avg = prices.reduce((price.,b) => a + b, 0) / prices.length
    //const eth = prices.find((price) => price.asset === WETH_ADDRESS);
    //const bal = prices.find((price) => price.asset === BAL_ADDRESS);

    return {
        eth: eth ? eth : undefined,
        bal: bal ? bal : undefined,
    };
}
