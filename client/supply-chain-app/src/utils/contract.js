import web3 from './web3';  // ← Import the shared Web3 instance
import ABI from '../contracts/Agriprovenance_ABI.json';

let contract = null;
let currentAddress = process.env.REACT_APP_CONTRACT_ADDRESS || '';

export function setContractAddress(address) {
  if (!address) return;
  currentAddress = address;
  contract = new web3.eth.Contract(ABI, currentAddress);  // ← Use shared web3
}

export function getContract() {
  if (!contract) {
    contract = new web3.eth.Contract(ABI, currentAddress);  // ← Use shared web3
  }
  return contract;
}