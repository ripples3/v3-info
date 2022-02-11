import { IncentiveData, IncentiveTokenItem } from "data/balancer/balancerTypes";


const url = "https://raw.githubusercontent.com/balancer-labs/frontend-v2/master/src/lib/utils/liquidityMining/MultiTokenLiquidityMining.json";

export default async function getIncentiveList (incentiveData: IncentiveData[]) {
    try {
        const response = await fetch(url);
        const json = await response.json();
        //Find newest week and store it in global data state
    } catch (error) {
        console.log("error", error);
    }
    //Mapping to IncentiveData
    

}