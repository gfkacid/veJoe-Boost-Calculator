import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.scss";
import { createClient } from 'urql'
import { useEffect, useState, useRef } from 'react'
import FarmCard from './FarmCard';
import { getBoostedAPRs, getJoePerSec, getPoolInfo, getUserInfo } from "./getContractData";
import {veJOEquery, boostedPoolsQuery, pairsQuery, priceQuery} from "./queries"

const joeTokenlistURL = "https://raw.githubusercontent.com/traderjoe-xyz/joe-tokenlists/main/joe.tokenlist.json"
const veJoeSubgraphURL = "https://api.thegraph.com/subgraphs/name/traderjoe-xyz/vejoe"
const boostedMasterChefSubgraphURL = "https://api.thegraph.com/subgraphs/name/traderjoe-xyz/boosted-master-chef"
const exchangeSubgraphURL = "https://api.thegraph.com/subgraphs/name/traderjoe-xyz/exchange"


const client = createClient({
  url: boostedMasterChefSubgraphURL
})


function App() {
  const [userAddress, setUserAddress] = useState(null)

  const [pools,setPools] = useState({
    pools: []
  });

  const [masterChef,setMasterChef] = useState(null);

  const [pairs,setPairs] = useState([]);

  const [avaxPrice, setAvaxPrice] = useState(0) 

  const [joePrice, setJoePrice] = useState(0) 

  const [veJOEstats,setVeJOEstats] = useState({
    veJOEstats: {
      activeUserCount: "0",
      id: "-",
      joeStaked: "0",
      totalVeJoeBurned: "0",
      totalVeJoeMinted: "0",

    }
  });
  
  const [ready2render, setReady2render] = useState(false)

  const [connected, setConnected] = useState(false)

  let tokenlist = [];

  async function requestAccount() {
    if(window.ethereum){
      try{
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts"
        })
        if(accounts[0]){
          setUserAddress(accounts[0])
          setConnected(true)
          fetchPoolData(accounts[0])
        }else{
          console.log('error getting your account')
        }
        
      }catch (error) {
        console.log('error getting your account')
      }
    }else{
      console.loge('Please install a web3 wallet')
    }
  }

  async function fetchPoolData(user) {
    // fetch joe tokenlist
    try {
      const tokenlistResponse = await fetch(joeTokenlistURL);
      const json = await tokenlistResponse.json();
      tokenlist = json.tokens
    
    // fetch boosted pools list
    const boostedPoolsData = await client.query(boostedPoolsQuery).toPromise()
    const poolsData = boostedPoolsData.data.pools
    setPools({pools: poolsData.sort(function(a, b) { 
        return a.id - b.id;
      })
    })
    setMasterChef(boostedPoolsData.data.masterChefs[0])
    const joepersec = await getJoePerSec().then(function(joepersec){
      setMasterChef(prevMasterchef => ({
        ...prevMasterchef,
        joePerSec: joepersec
  
      }))  
    })
    // fetch APR for boosted pools
    let poolIds = poolsData.map(pool => pool.id);
    const boostedFarmAPRs = await getBoostedAPRs(boostedPoolsData.data.masterChefs[0].id,user,poolIds)

    // fetch veJOE stats
    client.url = veJoeSubgraphURL
    const response = await client.query(veJOEquery).toPromise()
    setVeJOEstats({veJOEstats: response.data.veJoes[0]})


    client.url = exchangeSubgraphURL
    const priceData = await client.query(priceQuery).toPromise();
    setJoePrice(parseFloat(priceData.data.token.derivedAVAX * priceData.data.bundle.avaxPrice))
    setAvaxPrice(parseFloat(priceData.data.bundle.avaxPrice))
    //fetch pair info for boosted pools
    for (let i = 0; i < poolsData.length; i++) {
      const pool = poolsData[i];
      const pairData = await client.query(pairsQuery(pool.pair)).toPromise()
      let newPair = pairData.data.pairs[0]

      // inject usd price
      newPair.token0.usdPrice = priceData.data.bundle.avaxPrice * newPair.token0.derivedAVAX
      newPair.token1.usdPrice = priceData.data.bundle.avaxPrice * newPair.token1.derivedAVAX
      // inject logo uris
      const token0logo =  tokenlist.filter((token) =>  token.address.toLowerCase() == newPair.token0.id.toLowerCase())[0]
      const token1logo =  tokenlist.filter((token) =>  token.address.toLowerCase() == newPair.token1.id.toLowerCase())[0]
      newPair.token0.imageURI = token0logo.logoURI
      newPair.token1.imageURI = token1logo.logoURI
      // set farm APRs
      newPair.baseApr = (parseFloat(boostedFarmAPRs[i].baseApr) / 10**16).toFixed(2)
      newPair.userBoostedApr = (parseFloat(boostedFarmAPRs[i].userBoostedApr) / 10 ** 16).toFixed(2)
      newPair.userFactorShare = parseFloat(boostedFarmAPRs[i].userFactorShare) / 10 ** 16

      const poolInfo = await getPoolInfo(i)
      const userInfo = await getUserInfo(i, user)
      newPair.totalLps = poolInfo.totalLpSupply
      newPair.totalFactor = poolInfo.totalFactor
      newPair.userLps = userInfo[0]
      setPairs(oldpairs => [...oldpairs,newPair])
    }
    
  } catch (error) {
    console.log("error", error);
  }
  }

  useEffect(() => {
    setReady2render(true)
  },[pairs?.length == pools.pools.length])
  
  return (
    <div className="App">
      <div className="container">
        <div>
          <div className="joeLine"></div>
          <h2 className="bgHeader"><span>TraderJoe Boosted Farms</span></h2>
          <div className="joeLine veJoe"></div>
          <p></p>
          <p>With the introduction of veJOE, select farms are now emmitting additional JOE rewards, proportional to a user's veJOE holdings,
             as well as an internal allocation set by TraderJoe.
          </p>
          <p>Read up more @ <a href="https://docs.traderjoexyz.com/main/trader-joe/staking/vejoe-staking#boost-your-joe-farm-rewards" target="_blank">Official veJOE documentation</a></p>
          <hr></hr>
          <h2>Boosted Farm APR calculator</h2>
          <div className="mb12">Estimate the total APR you would get for target LP position + veJOE holding, for any TraderJoe Boosted Farm, in 3 simple steps:</div>
          <ul>
            <li>Select a farm and click on the <svg width="28" height="28" xmlns="http://www.w3.org/2000/svg"><g fill="none" fillRule="evenodd"><rect fill="#EDEEFF" width="28" height="28" rx="8"/><g fillRule="nonzero"><path d="M7.467 4.167a.5.5 0 0 1 .492.41l.008.09-.001 2.408h2.3a.5.5 0 0 1 .09.993l-.09.008-2.3-.001v2.41a.5.5 0 0 1-.991.09l-.008-.09-.001-2.41h-2.3a.5.5 0 0 1-.09-.991l.09-.008 2.3-.001V4.667a.5.5 0 0 1 .5-.5ZM9.68 18.852a.5.5 0 0 1 .07.637l-.056.07L8.16 21.15l1.534 1.593a.5.5 0 0 1-.653.753l-.068-.06-1.507-1.565-1.506 1.566a.5.5 0 0 1-.777-.623l.057-.07 1.532-1.594-1.532-1.592a.5.5 0 0 1 .652-.753l.068.06 1.506 1.564 1.507-1.565a.5.5 0 0 1 .707-.013ZM23.333 7.076a.5.5 0 0 1 .09.992l-.09.008h-5.6a.5.5 0 0 1-.09-.992l.09-.008h5.6ZM22.4 18.712a.5.5 0 0 1 .09.992l-.09.008h-3.733a.5.5 0 0 1-.09-.992l.09-.008H22.4Zm0 3.879a.5.5 0 0 1 .09.992l-.09.008h-3.733a.5.5 0 0 1-.09-.992l.09-.008H22.4Z" fill="#7B80E7"/><path fill="#FFF" d="m14.5 0-.001 13.499L28 13.5v1l-13.501-.001L14.5 28h-1l-.001-13.501L0 14.5v-1l13.499-.001L13.5 0z"/></g></g></svg> icon</li>
            <li>Add a hypothetical LP position</li>
            <li>Enter the amount of veJOE you want to estimate APR for</li>
            <li>Enjoy your boosted APR :)</li>
          </ul>
        </div>
        {connected ? (
        <div className="farm-grid">
            {ready2render && pairs.map((pair,i) => (
              <FarmCard key={i} pair={pair} pool={pools.pools[i]} veJOEstats={veJOEstats.veJOEstats} joePrice={joePrice} masterChef={masterChef}/> 
            ))}
        </div>
        ) : (
          <div className="connect-wrapper">
            <button onClick={requestAccount}>Connect wallet</button>
            <div>Connect your wallet to continue.</div>
          </div>
        )}
      </div>
      
    </div>
  );
}

export default App;

// integrate connect wallet
// splash screen only with connect wallet button
// get user address
// feed it to veJOE & boostedAPR queries
