import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type WalletTransaction = {
  id: string;
  amount: number;
  type: "TOPUP" | "PAYMENT";
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

const LOCAL_BALANCE_KEY = "srec_wallet_balance";
const LOCAL_TRANSACTIONS_KEY = "srec_wallet_transactions";

function readLocalBalance() {
  const value = Number(localStorage.getItem(LOCAL_BALANCE_KEY));
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

function readLocalTransactions(): WalletTransaction[] {
  try {
    const value = JSON.parse(
      localStorage.getItem(LOCAL_TRANSACTIONS_KEY) || "[]",
    );
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function writeLocalWallet(balance: number, transaction?: WalletTransaction) {
  localStorage.setItem(LOCAL_BALANCE_KEY, balance.toFixed(2));
  if (transaction)
    localStorage.setItem(
      LOCAL_TRANSACTIONS_KEY,
      JSON.stringify([transaction, ...readLocalTransactions()].slice(0, 20)),
    );
}

function localWalletUpdate(
  amount: number,
  type: WalletTransaction["type"],
  description: string,
) {
  const balance = readLocalBalance() + amount;
  if (balance < 0) throw new Error("Insufficient wallet balance.");
  writeLocalWallet(balance, {
    id: `local-${Date.now()}`,
    amount: Math.abs(amount),
    type,
    description,
    createdAt: new Date().toISOString(),
  });
  return balance;
}

async function walletRequest<T>(
  email: string,
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`/api/wallet/${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-User-Email": email,
      ...options?.headers,
    },
  });
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json"))
    throw new Error(`Wallet API returned ${response.status}.`);
  const body = (await response.json()) as T & { message?: string };
  if (!response.ok)
    throw new Error(body.message || `Wallet API returned ${response.status}.`);
  return body;
}

export function WalletProvider({
  email,
  children,
}: {
  email: string;
  children: ReactNode;
}) {
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshWallet = async () => {
    if (!email) return;
    setIsLoading(true);
    try {
      const data = await walletRequest<{
        balance: number;
        transactions: WalletTransaction[];
      }>(email, "balance");
      setWalletBalance(data.balance);
      setTransactions(data.transactions);
      setError("");
    } catch {
      setWalletBalance(readLocalBalance());
      setTransactions(readLocalTransactions());
      setError("");
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
      try {
        const data = await walletRequest<{ balance: number }>(email, "topup", {
          method: "POST",
          body: JSON.stringify({ amount }),
        });
        setWalletBalance(data.balance);
        setError("");
        await refreshWallet();
        return data.balance;
      } catch {
        const balance = localWalletUpdate(
          amount,
          "TOPUP",
          "SREC Wallet top-up",
        );
        setWalletBalance(balance);
        setTransactions(readLocalTransactions());
        setError("");
        return balance;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const payWithWallet = async (orderId: string, amount: number) => {
    setIsLoading(true);
    try {
      try {
        const data = await walletRequest<{ balance: number }>(email, "pay", {
          method: "POST",
          body: JSON.stringify({ orderId, amount }),
        });
        setWalletBalance(data.balance);
        setError("");
        await refreshWallet();
        return data.balance;
      } catch (requestError) {
        if (
          requestError instanceof Error &&
          requestError.message.includes("Insufficient")
        )
          throw requestError;
        const balance = localWalletUpdate(
          -amount,
          "PAYMENT",
          `Wallet payment for order ${orderId}`,
        );
        setWalletBalance(balance);
        setTransactions(readLocalTransactions());
        setError("");
        return balance;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const value = useMemo(
    () => ({
      walletBalance,
      transactions,
      isLoading,
      error,
      refreshWallet,
      topUpWallet,
      payWithWallet,
    }),
    [walletBalance, transactions, isLoading, error],
  );
  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) throw new Error("useWallet must be used inside WalletProvider");
  return context;
}
