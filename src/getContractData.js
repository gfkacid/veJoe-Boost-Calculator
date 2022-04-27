import { ethers,getDefaultProvider } from "ethers";
import farmlensABI from "./ABIs/farmlensv2ABI.json"
import boostedMasterChefABI from "./ABIs/boosterMasterChefImplementationABI.json"

const provider = new ethers.providers.Web3Provider(window.ethereum);
// const rpc = "https://api.avax.network/ext/bc/C/rpc";
// const provider = getDefaultProvider(rpc);

const farmLensContract = new ethers.Contract('0xF16d25Eba0D8E51cEAF480141bAf577aE55bfdd2', farmlensABI, provider);
const boostedMasterChefContract = new ethers.Contract('0x4483f0b6e2F5486D06958C20f8C39A7aBe87bf8F', boostedMasterChefABI, provider);

export const getBoostedAPRs = async(masterchefAddress,user,poolIds) => {
  
  const response = await farmLensContract?.getBMCJFarmInfos(
    masterchefAddress,
    user,
    poolIds
  )
  return response;
}

export const getJoePerSec = async() => {
  const joePerSec = await boostedMasterChefContract.joePerSec()
  return joePerSec;
}

export const getPoolInfo = async(id) => {
  const poolInfo = await boostedMasterChefContract.poolInfo(id)
  return poolInfo;
}

export const getUserInfo = async(id, user) => {
  const userInfo = await boostedMasterChefContract.userInfo(id, user)
  return userInfo;
}