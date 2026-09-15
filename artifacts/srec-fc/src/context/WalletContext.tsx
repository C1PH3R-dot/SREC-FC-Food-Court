import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

type WalletTransaction = {
  id: string;
  amount: number;
  type: 'TOPUP' | 'PAYMENT';
  description: string;
  createdAt: string;
};

type WalletContextValue = {
  walletBalance: number;
  transactions: WalletTransaction[];
  isLoading: boolean;
  error: string;
  refreshWallet: () => Promise<void>;
  topUpWallet: (amount: number) => Promise<number>;
  payWithWallet: (orderId: string, amount: number) => Promise<number>;
};

const WalletContext = createContext<WalletContextValue | null>(null);

async function walletRequest<T>(email: string, path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`/api/wallet/${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-User-Email': email,
      ...options?.headers,
    },
  });
  const body = (await response.json()) as T & { message?: string };
  if (!response.ok) throw new Error(body.message || 'Wallet request failed.');
  return body;
}

export function WalletProvider({ email, children }: { email: string; children: ReactNode }) {
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const refreshWallet = async () => {
    if (!email) return;
    setIsLoading(true);
    try {
      const data = await walletRequest<{ balance: number; transactions: WalletTransaction[] }>(email, 'balance');
      setWalletBalance(data.balance);
      setTransactions(data.transactions);
      setError('');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load wallet.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refreshWallet();
  }, [email]);

  const topUpWallet = async (amount: number) => {
    setIsLoading(true);
    try {
      const data = await walletRequest<{ balance: number }>(email, 'topup', { method: 'POST', body: JSON.stringify({ amount }) });
      setWalletBalance(data.balance);
      await refreshWallet();
      return data.balance;
    } finally {
      setIsLoading(false);
    }
  };

  const payWithWallet = async (orderId: string, amount: number) => {
    setIsLoading(true);
    try {
      const data = await walletRequest<{ balance: number }>(email, 'pay', { method: 'POST', body: JSON.stringify({ orderId, amount }) });
      setWalletBalance(data.balance);
      await refreshWallet();
      return data.balance;
    } finally {
      setIsLoading(false);
    }
  };

  const value = useMemo(() => ({ walletBalance, transactions, isLoading, error, refreshWallet, topUpWallet, payWithWallet }), [walletBalance, transactions, isLoading, error]);
  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWallet must be used inside WalletProvider');
  return context;
}