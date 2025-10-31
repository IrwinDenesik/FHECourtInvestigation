import { useState, useEffect, useCallback } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import { WalletState } from '@/types';
import { CONTRACT_CONFIG, CONTRACT_ABI } from '@/lib/contract';
import { isMetaMaskInstalled } from '@/lib/utils';

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    provider: null,
    signer: null,
    contract: null,
    chainId: null,
  });

  // Check for existing connection on mount
  useEffect(() => {
    checkConnection();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (!isMetaMaskInstalled()) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        connectWallet();
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum?.on('accountsChanged', handleAccountsChanged);
    window.ethereum?.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

  const checkConnection = async () => {
    if (!isMetaMaskInstalled()) return;

    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        await connectWallet();
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  };

  const connectWallet = useCallback(async () => {
    if (!isMetaMaskInstalled()) {
      throw new Error('Please install MetaMask to use this application');
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

      if (accounts.length === 0) {
        throw new Error('No accounts found. Please authorize access in your wallet');
      }

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = accounts[0];
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);

      // Initialize contract
      const contract = new Contract(CONTRACT_CONFIG.address, CONTRACT_ABI, signer);

      // Test contract connection
      try {
        await contract.currentInvestigationId();
      } catch (error) {
        console.warn('Contract test failed:', error);
      }

      setWalletState({
        isConnected: true,
        address,
        provider,
        signer,
        contract,
        chainId,
      });

      // Check if on correct network
      if (chainId !== CONTRACT_CONFIG.chainId) {
        console.warn(`Wrong network. Expected ${CONTRACT_CONFIG.chainId}, got ${chainId}`);
      }

    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setWalletState({
      isConnected: false,
      address: null,
      provider: null,
      signer: null,
      contract: null,
      chainId: null,
    });
  }, []);

  const switchNetwork = useCallback(async () => {
    if (!isMetaMaskInstalled()) {
      throw new Error('MetaMask not installed');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: CONTRACT_CONFIG.chainIdHex }],
      });
    } catch (error: any) {
      // Network not added, try to add it
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: CONTRACT_CONFIG.chainIdHex,
              chainName: CONTRACT_CONFIG.networkName,
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: [CONTRACT_CONFIG.rpcUrl],
              blockExplorerUrls: [CONTRACT_CONFIG.explorerUrl],
            }],
          });
        } catch (addError) {
          throw new Error('Failed to add network');
        }
      } else {
        throw error;
      }
    }
  }, []);

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
    switchNetwork,
  };
};
