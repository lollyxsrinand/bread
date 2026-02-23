import { Account, MonthlyBudgetView } from 'bread-core'
import { create } from 'zustand'

interface BudgetState {
    accounts: Account[]
    setAccounts: (accounts: Account[]) => void
    updateAccountBalance: (accountId: string, delta: number) => void

    monthlyBudgets: Record<string, MonthlyBudgetView>
    setMonthlyBudget: (month: string, budget: MonthlyBudgetView) => void

}

export const useBudgetStore = create<BudgetState>((set) => ({
    accounts: [],
    setAccounts: (accounts: Account[]) => set({ accounts }),

    monthlyBudgets: {},
    setMonthlyBudget: (month: string, budget: MonthlyBudgetView) =>
        set((state) => ({
            monthlyBudgets: {
                ...state.monthlyBudgets,
                [month]: budget,
            },
        })),

    updateAccountBalance: (accountId: string, delta: number) => set((state) => ({
        accounts: state.accounts.map((account) =>
            account.id === accountId
                ? { ...account, balance: account.balance + delta }
                : account
        )
    })),
}))