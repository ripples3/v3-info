import { useGetLatestPricesQuery } from '../../apollo/generated/graphql-codegen-generated';

const WFTM_ADDRESS = '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83';
const BEETS_ADDRESS = '0xf24bcf4d1e507740041c9cfd2dddb29585adce1e';

export function useLatestPrices(): { ftm?: number; beets?: number } {
    // eslint-disable-next-line
    const { data } = useGetLatestPricesQuery({ variables: { where: { asset_in: [WFTM_ADDRESS, BEETS_ADDRESS] } } });
    const prices = data?.latestPrices || [];
    const ftm = prices.find((price) => price.asset === WFTM_ADDRESS);
    const beets = prices.find((price) => price.asset === BEETS_ADDRESS);

    return {
        ftm: ftm ? parseFloat(ftm.priceUSD) : undefined,
        beets: beets ? parseFloat(beets.priceUSD) : undefined,
    };
}
