import React, { useMemo } from 'react'
import styled from 'styled-components'
import { isAddress } from 'utils'
import Logo from '../Logo'
import { useCombinedActiveList } from 'state/lists/hooks'
import useHttpLocations from 'hooks/useHttpLocations'
import { useActiveNetworkVersion } from 'state/application/hooks'
import { SupportedNetwork } from 'constants/networks'

//TODO: BAL default token for all chains
//Backup if png cannot be found?
export const getTokenLogoURL = (address: string, networkId: SupportedNetwork) => {
  switch (networkId) {
    case SupportedNetwork.ETHEREUM:
      return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`
    case SupportedNetwork.ARBITRUM:
      return `https://raw.githubusercontent.com/sushiswap/assets/master/blockchains/arbitrum/assets/${address}/logo.png`
    case SupportedNetwork.POLYGON:
      return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`
    default:
      return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`
  } 
}

const StyledLogo = styled(Logo)<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border-radius: ${({ size }) => size};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  background-color: ${({ theme }) => theme.white};
  color: ${({ theme }) => theme.text4};
`

const StyledEthereumLogo = styled.img<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  border-radius: 24px;
`

export default function CurrencyLogo({
  address,
  size = '24px',
  style,
  ...rest
}: {
  address?: string
  size?: string
  style?: React.CSSProperties
}) {
  // useOptimismList()
  const optimismList = useCombinedActiveList()?.[10]
  const arbitrumList = useCombinedActiveList()?.[42161]

  const [activeNetwork] = useActiveNetworkVersion()

  const checkSummed = isAddress(address)

  const optimismURI = useMemo(() => {
    if (checkSummed && optimismList?.[checkSummed]) {
      return optimismList?.[checkSummed].token.logoURI
    }
    return undefined
  }, [checkSummed, optimismList])
  const uriLocationsOptimism = useHttpLocations(optimismURI)

  const arbitrumURI = useMemo(() => {
    if (checkSummed && arbitrumList?.[checkSummed]) {
      return arbitrumList?.[checkSummed].token.logoURI
    }
    return undefined
  }, [checkSummed, arbitrumList])
  const uriLocationsArbitrum = useHttpLocations(arbitrumURI)

  //Secondary assets are loaded through Balancer
  const tempSources: { [address: string]: string } = useMemo(() => {
    return {
      [`${address}`]:
      `https://raw.githubusercontent.com/balancer-labs/assets/master/assets/${address}.png`,
    }
  }, [])

  const srcs: string[] = useMemo(() => {
    const checkSummed = isAddress(address)
    

    if (checkSummed && address) {
      const override = tempSources[address]
      return [getTokenLogoURL(checkSummed, activeNetwork.id), ...uriLocationsOptimism, ...uriLocationsArbitrum, override]
    }
    return []
  }, [address, tempSources, uriLocationsArbitrum, uriLocationsOptimism])


  return <StyledLogo size={size} srcs={srcs} alt={'token logo'} style={style} {...rest} />
}
