import { LatestPrice, useGetLatestPricesQuery } from '../../apollo/generated/graphql-codegen-generated';
import { useActiveNetworkVersion } from 'state/application/hooks';

//TODO: Network dependent address fetching!
const WETH_ADDRESS = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
const BAL_ADDRESS = '0xba100000625a3754423978a60c9317c58a424e3d';


const reducer = (previousValue: number, currentValue: number) => previousValue + currentValue;

export function useLatestPrices(): { eth?: number; bal?: number } {
    // eslint-disable-next-line
    const [activeNetwork] = useActiveNetworkVersion();
    const { data } = useGetLatestPricesQuery({ 
        variables: { where: { asset_in: [WETH_ADDRESS, BAL_ADDRESS] } },
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
        if (price.asset ===  BAL_ADDRESS) {
            balSum += Number(price.priceUSD);
            balCounter +=1;
        }
        else if (price.asset === WETH_ADDRESS){
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
