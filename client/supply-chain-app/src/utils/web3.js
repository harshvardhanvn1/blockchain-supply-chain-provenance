import Web3 from 'web3';

let web3;

if (window.ethereum) {
	web3 = new Web3(window.ethereum);
} else {
	alert('Please install MetaMask!');
}

export const connectWallet = async () => {
	try {
		const accounts = await window.ethereum.request({
			method: 'eth_requestAccounts',
		});
		return accounts[0];
	} catch (error) {
		console.error(error);
		return null;
	}
};

export default web3;
