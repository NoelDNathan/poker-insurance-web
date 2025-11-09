"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { createAccount, getAccount, removeAccount, type Account } from "./genlayer";

interface AccountContextType {
  account: Account | null;
  connectAccount: () => Account;
  disconnectAccount: () => void;
  accountAddress: string | null;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null);

  useEffect(() => {
    const savedAccount = getAccount();
    setAccount(savedAccount);
  }, []);

  const connectAccount = () => {
    const newAccount = createAccount();
    setAccount(newAccount);
    return newAccount;
  };

  const disconnectAccount = () => {
    removeAccount();
    setAccount(null);
  };

  const accountAddress = account?.address ? account.address : null;

  return (
    <AccountContext.Provider
      value={{
        account,
        connectAccount,
        disconnectAccount,
        accountAddress,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error("useAccount must be used within an AccountProvider");
  }
  return context;
}




