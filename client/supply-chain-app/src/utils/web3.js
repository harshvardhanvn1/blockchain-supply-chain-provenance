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

// Polygon Amoy Testnet network params
export const AMOY_NETWORK = {
	chainIdHex: '0x13882', // 80002
	chainIdDec: 80002,
	chainName: 'Polygon Amoy Testnet',
	rpcUrls: ['https://rpc-amoy.polygon.technology'],
	nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
	blockExplorerUrls: ['https://amoy.polygonscan.com'],
};

/**
 * Ensure the connected wallet is on Polygon Amoy Testnet.
 * If not, request a network switch; if the network is unknown, request add.
 * Returns true if on the correct network or user switched/added it, false otherwise.
 */
export async function ensureAmoyNetwork() {
	if (!window.ethereum) return false;
	try {
		const chainId = await window.ethereum.request({ method: 'eth_chainId' });
		if (chainId === AMOY_NETWORK.chainIdHex) return true;

		try {
			// try to switch
			await window.ethereum.request({
				method: 'wallet_switchEthereumChain',
				params: [{ chainId: AMOY_NETWORK.chainIdHex }],
			});
			return true;
		} catch (switchError) {
			// 4902 indicates the chain has not been added to MetaMask
			const errCode = switchError && (switchError.code || (switchError.data && switchError.data.originalError && switchError.data.originalError.code));
			if (errCode === 4902 || switchError.message && switchError.message.toLowerCase().includes('unrecognized chain') ) {
				try {
					await window.ethereum.request({
						method: 'wallet_addEthereumChain',
						params: [
							{
								chainId: AMOY_NETWORK.chainIdHex,
								chainName: AMOY_NETWORK.chainName,
								rpcUrls: AMOY_NETWORK.rpcUrls,
								nativeCurrency: AMOY_NETWORK.nativeCurrency,
								blockExplorerUrls: AMOY_NETWORK.blockExplorerUrls,
							},
						],
					});
					// After adding, try switching again
					await window.ethereum.request({
						method: 'wallet_switchEthereumChain',
						params: [{ chainId: AMOY_NETWORK.chainIdHex }],
					});
					return true;
				} catch (addError) {
					console.error('Failed to add Amoy network to wallet', addError);
					return false;
				}
			}
			console.error('Failed to switch network', switchError);
			return false;
		}
	} catch (err) {
		console.error('ensureAmoyNetwork error', err);
		return false;
	}
}
