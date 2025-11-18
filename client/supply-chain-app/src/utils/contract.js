import web3 from './web3';

const CONTRACT_ADDRESS = ''; // Need to add our address here

const ABI = [
	// Paste our ABI from Remix here (long JSON array)
];

const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);

export default contract;
