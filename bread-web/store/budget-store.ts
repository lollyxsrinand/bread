import { Account } from 'bread-core'
import { create } from 'zustand'

interface BudgetState {
    accounts: Account[]
    setAccounts: (accounts: Account[]) => void

    // categories: Record<string, any>
    // setCategories: (categories: Record<string, any>) => void

    updateAccountBalance: (accountId: string, delta: number) => void
}

export const useBudgetStore = create<BudgetState>((set) => ({
    accounts: [],
    setAccounts: (accounts: Account[]) => set({ accounts }),

    // categories: [],
    // setCategories: (categories: Record<string, any>) => set({ categories }),
    updateAccountBalance: (accountId: string, delta: number) => set((state) => ({
        accounts: state.accounts.map((account) =>
            account.id === accountId
                ? { ...account, balance: account.balance + delta }
                : account
        )
    })),
  }))