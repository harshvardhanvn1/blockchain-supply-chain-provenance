import web3 from './web3';
import ABI from '../contracts/Agriprovenance_ABI.json';

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || '';

const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);

export default contract;
