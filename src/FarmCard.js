import { useState } from "react"; 
import cn from "classnames";
import LPInput from "./LPInput.js"
import VeJoeInput from "./veJoeInput.js"
import CurrencyFormat from 'react-currency-format';

function FarmCard({pair , pool, veJOEstats , joePrice , masterChef}) {

  const [showBack, setShowBack] = useState(false); 
  const [veJOE, setVeJOE] = useState(0);
  const [LPinputs, setLPinputs] = useState({
    token0value: 0,
    token1value: 0,
  })
  const [poolShare, setPoolShare] = useState(0)

  const [veJOESupply,setVeJOESupply] = useState(veJOEstats.totalVeJoeMinted - veJOEstats.totalVeJoeBurned); 

  const [veJOEShare,setVeJOEShare] = useState('0'); 

  const [estimatedBoostedApr, setEstimatedBoostedApr] = useState('-')
  
  function handleClick() { 
    setShowBack(!showBack);
  } 
  function inputChanged(event){
    // sanitize
    let cleanVal = event.target.value.replace(/[^\d.]/g, '')
    
    // update LPinputs state
    let newState = {token0value: 0, token1value: 0}
    const index = event.target.getAttribute("tokenindex")
    newState['token'+index+'value'] = cleanVal
    const otherIndex = index == 1 ? 0 : 1
    newState['token'+otherIndex+'value'] = (parseFloat(pair['token'+otherIndex+'Price']) * cleanVal).toString()
    setLPinputs(newState)
    
    // calculate usd value of position 
    const LPUSDval = newState['token0value'] * 2 * pair.token0.usdPrice
    
    // calculate & update pool share
    setPoolShare((100*LPUSDval/pair.reserveUSD).toFixed(8))
    
    // trigger estimated APR calculation
    calculateEstimatedBoostedAPR(newState.token0value, newState.token1value, veJOE)
  }
  function veJOEInputChanged(event){
    let cleanVal = event.target.value.replace(/[^\d.]/g, '')
    setVeJOE(cleanVal)
    setVeJOEShare((100 * cleanVal/veJOESupply).toFixed(4))
    calculateEstimatedBoostedAPR(LPinputs.token0value, LPinputs.token1value, cleanVal)
  }
  function calculateEstimatedBoostedAPR(token0val, token1val, vJ){
    const poolJPS = (masterChef.joePerSec / 10 ** 18 * pool.allocPoint / masterChef.totalAllocPoint)
    const jlpBalance = pool.jlpBalance * token1val * pair.token1.usdPrice * 2 / pair.reserveUSD
    
    const baseRewardsPerSec = jlpBalance * poolJPS * 0.6 / pool.jlpBalance
    const boostedRewardsPerSec = ((jlpBalance * vJ ) ** 0.5 ) * poolJPS * 0.4 / (pair.totalFactor / 10 ** 18 )

    const totalRewardsPerSec = baseRewardsPerSec + boostedRewardsPerSec

    const totalUSDRewardsPerYear = totalRewardsPerSec * 60 * 60 * 24 * 365 * joePrice
    const boostedAPR = 100 * totalUSDRewardsPerYear / (pair.reserveUSD * jlpBalance / pool.jlpBalance)
    setEstimatedBoostedApr(isNaN(boostedAPR) ? 0 : boostedAPR.toFixed(2))
  }
    return (
        <div className="farm-card-outer">
          <div className={cn("farm-card-inner", {showBack})}>
            <div className="card front">
              <div className="farm-header">
                <div className="farm-title-section">
                  <div className="farm-logos">
                    <img src={pair.token0.imageURI}></img>
                    <img src={pair.token1.imageURI}></img>
                  </div>
                  <div className="farm-title">{pair.name}</div>
                </div>
                <div className="farm-button-section"> 
                  <div className="toggle-calc" onClick={handleClick}>
                    <svg width="28" height="28" xmlns="http://www.w3.org/2000/svg"><g fill="none" fillRule="evenodd"><rect fill="#EDEEFF" width="28" height="28" rx="8"/><g fillRule="nonzero"><path d="M7.467 4.167a.5.5 0 0 1 .492.41l.008.09-.001 2.408h2.3a.5.5 0 0 1 .09.993l-.09.008-2.3-.001v2.41a.5.5 0 0 1-.991.09l-.008-.09-.001-2.41h-2.3a.5.5 0 0 1-.09-.991l.09-.008 2.3-.001V4.667a.5.5 0 0 1 .5-.5ZM9.68 18.852a.5.5 0 0 1 .07.637l-.056.07L8.16 21.15l1.534 1.593a.5.5 0 0 1-.653.753l-.068-.06-1.507-1.565-1.506 1.566a.5.5 0 0 1-.777-.623l.057-.07 1.532-1.594-1.532-1.592a.5.5 0 0 1 .652-.753l.068.06 1.506 1.564 1.507-1.565a.5.5 0 0 1 .707-.013ZM23.333 7.076a.5.5 0 0 1 .09.992l-.09.008h-5.6a.5.5 0 0 1-.09-.992l.09-.008h5.6ZM22.4 18.712a.5.5 0 0 1 .09.992l-.09.008h-3.733a.5.5 0 0 1-.09-.992l.09-.008H22.4Zm0 3.879a.5.5 0 0 1 .09.992l-.09.008h-3.733a.5.5 0 0 1-.09-.992l.09-.008H22.4Z" fill="#7B80E7"/><path fill="#FFF" d="m14.5 0-.001 13.499L28 13.5v1l-13.501-.001L14.5 28h-1l-.001-13.501L0 14.5v-1l13.499-.001L13.5 0z"/></g></g></svg>
                  </div>
                </div>
                
              </div>
              <div className="farm-data-wrapper">
                <div className="farm-data-label color-light">
                  Liquidity
                </div>
                <div className="farm-data-label color-light">
                  veJOE stakers
                </div>
                <div className="farm-data-label">
                  <CurrencyFormat value={pair.reserveUSD} displayType={'text'} isNumericString={true} decimalScale={2} thousandSeparator={true} prefix={'$'} />
                </div>
                <div className="farm-data-label">
                  {pool.boostedUserCount}
                </div>
              </div>
              <div className="farm-data-wrapper">
                <div className="farm-data-label color-light">
                  Farm APR
                </div>
                <div className="farm-data-label color-light">
                  Your Stake
                </div>
                <div className="farm-data-label">
                  {pair.baseApr}%
                </div>
                <div className="farm-data-label">
                  <CurrencyFormat value={pair.reserveUSD * pair.userLps / pair.totalLps} displayType={'text'} isNumericString={true} decimalScale={2} thousandSeparator={true} prefix={'$'} />
                </div>
              </div>
              
            </div>
            <div className="card back">
              <div className="farm-header">
                  <div className="farm-title-section">
                    <svg width="22" height="22" xmlns="http://www.w3.org/2000/svg"><path d="M16 .5A5.5 5.5 0 0 1 21.5 6v10a5.5 5.5 0 0 1-5.5 5.5H6A5.5 5.5 0 0 1 .5 16V6A5.5 5.5 0 0 1 6 .5Zm-5.501 10.999L1.5 11.5V16a4.5 4.5 0 0 0 4.288 4.495L6 20.5h4.5l-.001-9.001Zm1 0L11.5 20.5H16a4.5 4.5 0 0 0 4.495-4.288L20.5 16v-4.5l-9.001-.001ZM17 16.994a.5.5 0 0 1 .09.991l-.09.009h-2.667a.5.5 0 0 1-.09-.992l.09-.008H17Zm-8.987-2.631a.5.5 0 0 1 .07.636l-.056.07-1 1.039 1 1.039a.5.5 0 0 1-.652.752l-.069-.059-.973-1.011-.973 1.011a.5.5 0 0 1-.777-.623l.057-.07.999-1.039-1-1.038a.5.5 0 0 1 .653-.753l.068.06.973 1.01.973-1.01a.5.5 0 0 1 .707-.014Zm8.987-.14a.5.5 0 0 1 .09.992l-.09.008h-2.667a.5.5 0 0 1-.09-.992l.09-.008H17ZM10.5 1.5H6A4.5 4.5 0 0 0 1.5 6v4.5l8.999-.001L10.5 1.5Zm5.5 0h-4.5l-.001 8.999 9.001.001V6a4.5 4.5 0 0 0-4.288-4.495L16 1.5ZM6.333 3.833a.5.5 0 0 1 .492.41l.008.09v1.578h1.5a.5.5 0 0 1 .09.992l-.09.008h-1.5v1.578a.5.5 0 0 1-.992.09l-.008-.09V6.911h-1.5a.5.5 0 0 1-.09-.992l.09-.008h1.5V4.333a.5.5 0 0 1 .5-.5Zm11.334 2.078a.5.5 0 0 1 .09.992l-.09.008h-4a.5.5 0 0 1-.09-.992l.09-.008h4Z" fill="#FFF" fillRule="nonzero"/></svg>
                    <h4>Booster Calculator <small>
                      <img className="pair-logo" src={pair.token0.imageURI}></img>
                      <img className="pair-logo" src={pair.token1.imageURI}></img>
                    {pair.name}</small></h4>
                  </div>
                  <div className="farm-button-section"> 
                    <div className="toggle-calc" onClick={handleClick}>
                    <svg width="12" height="12" xmlns="http://www.w3.org/2000/svg"><path d="M10.972.64a.5.5 0 0 1 .07.636l-.057.07L6.506 6l4.48 4.653a.5.5 0 0 1-.653.753l-.068-.06-4.453-4.625-4.452 4.626a.5.5 0 0 1-.777-.623l.057-.07L5.118 6 .64 1.347a.5.5 0 0 1 .652-.753l.068.06 4.452 4.624L10.265.653a.5.5 0 0 1 .707-.013Z" fill="#FFF" fillRule="nonzero"/></svg>
                    </div>
                  </div>
              </div>
                <hr></hr>
              <div className="">
                <div className="stat">
                  <div>Pool Liquidity: <CurrencyFormat value={pair.reserveUSD} displayType={'text'} isNumericString={true} decimalScale={2} thousandSeparator={true} prefix={'$'} />
                  </div>
                  <div>Pool Share: {poolShare}%</div>  
                </div>
                <div className="mb12"></div>
                <div className="inputs-wrapper">
                  <LPInput token={pair.token0} LPinputVal={LPinputs.token0value} tokenIndex="0" inputChanged={inputChanged}/>
                  <div className="plus-separator">+</div>
                  <LPInput token={pair.token1} LPinputVal={LPinputs.token1value} tokenIndex="1" inputChanged={inputChanged}/>
                  <div className="plus-separator">+</div>
                  <VeJoeInput value={veJOE} calcCallback={veJOEInputChanged}/>
                  <div className="plus-separator">=</div>
                </div>
                <div className="highlight">
                  <div className="stat">
                    <div className="color-light">Total veJOE supply</div>
                    <div className="color-light">
                      <CurrencyFormat value={veJOEstats.totalVeJoeMinted - veJOEstats.totalVeJoeBurned} displayType={'text'} isNumericString={true} decimalScale={2} thousandSeparator={true} />
                    </div>
                  </div>
                  <div className="stat">
                    <div className="color-light">Your veJOE share</div>
                    <div className="color-light bold">{veJOEShare}%</div>
                  </div>
                  <div className="stat">
                    <div className="color-light">veJOE stakers</div>
                    <div className="color-light bold">{pool.boostedUserCount} / {veJOEstats.activeUserCount} | {(100* pool.boostedUserCount/veJOEstats.activeUserCount).toFixed(2)}%</div>
                  </div>
                  <hr></hr>
                  <div className="stat">
                    <div className="color-light">Base APR</div>
                    <div className="bold color-light">{pair.baseApr}%</div>
                  </div>
                  <div className="stat">
                    <div className="color-light">Current Boosted APR</div>
                    <div className="color-light bold">{pair.userBoostedApr}%</div>
                  </div>
                  <div className="stat">
                    <div className="bold">Estimated Boosted APR</div>
                    <div className="bold">{estimatedBoostedApr}%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    );
  }
  
  export default FarmCard;