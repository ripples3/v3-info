import OPTIMISM_LOGO_URL from '../assets/images/optimism.svg';
import ARBITRUM_LOGO_URL from '../assets/images/arbitrum.svg';
import ETHEREUM_LOGO_URL from '../assets/images/ethereum-logo.png';
import { BALANCER_PRIMARY_COLOR, BALANCER_SECONDARY_COLOR } from '../data/balancer/constants';

export enum SupportedNetwork {
    ETHEREUM,
    ARBITRUM,
    OPTIMISM,
}

export type NetworkInfo = {
    id: SupportedNetwork;
    route: string;
    name: string;
    imageURL: string;
    bgColor: string;
    primaryColor: string;
    secondaryColor: string;
    blurb?: string;
};

export const EthereumNetworkInfo: NetworkInfo = {
    id: SupportedNetwork.ETHEREUM,
    route: '',
    name: 'Ethereum',
    bgColor: BALANCER_PRIMARY_COLOR,
    primaryColor: BALANCER_PRIMARY_COLOR,
    secondaryColor: BALANCER_SECONDARY_COLOR,
    imageURL: ETHEREUM_LOGO_URL,
};

export const ArbitrumNetworkInfo: NetworkInfo = {
    id: SupportedNetwork.ARBITRUM,
    route: 'arbitrum',
    name: 'Arbitrum',
    imageURL: ARBITRUM_LOGO_URL,
    bgColor: '#0A294B',
    primaryColor: '#0490ED',
    secondaryColor: '#96BEDC',
    blurb: 'L2 Beta',
};

export const OptimismNetworkInfo: NetworkInfo = {
    id: SupportedNetwork.OPTIMISM,
    route: 'optimism',
    name: 'OΞ (Optimism)',
    bgColor: '#F01B36',
    primaryColor: '#F01B36',
    secondaryColor: '#FB7876',
    imageURL: OPTIMISM_LOGO_URL,
    blurb: 'L2 Beta',
};

export const SUPPORTED_NETWORK_VERSIONS: NetworkInfo[] = [
    EthereumNetworkInfo,
    OptimismNetworkInfo,
    ArbitrumNetworkInfo,
];
