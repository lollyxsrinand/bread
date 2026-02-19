import { Account } from 'bread-core/src'
import { create } from 'zustand'

interface AccountState {
    accounts: Account[]
    setAccounts: (accounts: Account[]) => void
    updateAccountBalance: (accountId: string, delta: number) => void
}

export const useAccountStore = create<AccountState>((set) => ({
    accounts: [],
    setAccounts: (accounts: Account[]) => set({ accounts }),
    updateAccountBalance: (accountId: string, delta: number) => set((state) => ({
        accounts: state.accounts.map((account) =>
            account.id === accountId
                ? { ...account, balance: account.balance + delta }
                : account
        )
    })),
  }))