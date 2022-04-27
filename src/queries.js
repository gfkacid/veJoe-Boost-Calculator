export const veJOEquery = `
  query {
    veJoes(first: 1) {
      id
      joeStaked
      totalVeJoeMinted
      totalVeJoeBurned
      activeUserCount
    }
  }
`
export const boostedPoolsQuery = `
  query{
    masterChefs(first: 5) {
      id
      joePerSec
      totalAllocPoint
    }
    pools(first: 50) {
      id
      pair
      allocPoint
      jlpBalance
      boostedUserCount
      accJoePerShare
    }
  }`

export const priceQuery = `
  query{
    token(id: "0x6e84a6216ea6dacc71ee8e6b0a5b7322eebc0fdd") {
      derivedAVAX
    }
    bundle(id: 1) {
      avaxPrice
    }
  }`

export const pairsQuery = (pairAddress) => `
  query{
    pairs(where: {id: "${pairAddress}"}) {
      id
      name
      token0Price
      token1Price
      token0{
        id
        symbol
        name
        derivedAVAX
      }
      token1{
        id
        symbol
        name
        derivedAVAX
      }
      reserve0
      reserve1
      reserveUSD
    }
  }`