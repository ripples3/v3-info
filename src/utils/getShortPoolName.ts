import {PoolData} from '../data/balancer/balancerTypes'

export const getShortPoolName = (poolData: PoolData) => {
    let shortName = '';
    //if (poolData.poolType === "Weighted") {
        shortName = poolData.tokens.map(e => e.symbol ? e.symbol : "MKR").join('/')
        //Instead of poolType === Weighted use case where token.weight entry === 0
        if (poolData.tokens[1].weight !== 0) {
        const ratios = " (" + poolData.tokens.map(e => Number(e.weight * 100).toFixed(0)).join('/') + ")";
        shortName += ratios;
        }
        //}
    return shortName;
};