import { useState, useCallback } from 'react';
import { Contract } from 'ethers';
import { parseErrorMessage } from '@/lib/utils';
import { TransactionState } from '@/types';

export const useContract = (contract: Contract | null) => {
  const [txState, setTxState] = useState<TransactionState>({
    isProcessing: false,
    message: '',
    isSuccess: false,
    error: null,
  });

  const executeTransaction = useCallback(async <T,>(
    transactionFn: () => Promise<T>,
    successMessage: string = 'Transaction successful'
  ): Promise<T | null> => {
    if (!contract) {
      throw new Error('Contract not initialized');
    }

    setTxState({
      isProcessing: true,
      message: 'Processing transaction...',
      isSuccess: false,
      error: null,
    });

    try {
      const result = await transactionFn();

      // If result has a wait method (it's a transaction), wait for confirmation
      if (result && typeof (result as any).wait === 'function') {
        await (result as any).wait();
      }

      setTxState({
        isProcessing: false,
        message: successMessage,
        isSuccess: true,
        error: null,
      });

      return result;
    } catch (error) {
      const errorMessage = parseErrorMessage(error);

      setTxState({
        isProcessing: false,
        message: '',
        isSuccess: false,
        error: errorMessage,
      });

      throw new Error(errorMessage);
    }
  }, [contract]);

  const resetTxState = useCallback(() => {
    setTxState({
      isProcessing: false,
      message: '',
      isSuccess: false,
      error: null,
    });
  }, []);

  return {
    txState,
    executeTransaction,
    resetTxState,
  };
};
