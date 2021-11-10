import React from 'react';
import styled from 'styled-components';
import CurrencyLogo from '../CurrencyLogo';
import { PoolTokenData } from '../../data/balancer/balancerTypes';

const Wrapper = styled.div<{ margin: boolean; sizeraw: number }>`
    position: relative;
    display: flex;
    flex-direction: row;
    margin-right: ${({ sizeraw, margin }) => margin && (sizeraw / 3 + 8).toString() + 'px'};
`;

interface PoolCurrencyLogoProps {
    margin?: boolean;
    size?: number;
    tokens: { address: string }[];
}

const HigherLogo = styled(CurrencyLogo)`
    z-index: 2;
`;
const CoveredLogo = styled(CurrencyLogo)<{ sizeraw: number }>`
    // position: absolute;
    // left: ${({ sizeraw }) => '-' + (sizeraw / 2).toString() + 'px'} !important;
`;

export default function PoolCurrencyLogo({ tokens, size = 16, margin = false }: PoolCurrencyLogoProps) {
    return (
        <Wrapper sizeraw={size} margin={margin}>
            {tokens.map((token, index) =>
                index === 0 ? (
                    <HigherLogo address={token.address} size={size.toString() + 'px'} key={token.address} />
                ) : (
                    <CoveredLogo
                        address={token.address}
                        size={size.toString() + 'px'}
                        sizeraw={size}
                        key={token.address}
                    />
                ),
            )}
        </Wrapper>
    );
}
