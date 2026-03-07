import { assignToCategory as _assignToCategory } from '@/lib/actions/category.actions'
import { Account, Budget, BudgetView } from 'bread-core/src'
import { create } from 'zustand'

interface BudgetState {
    accounts: Account[]
    setAccounts: (accounts: Account[]) => void

    budget: Budget
    setBudget: (budget: Budget) => void

    monthlyBudgetsView: Record<string, BudgetView>
    setMonthlyBudgetsView: (month: string, budgetView: BudgetView) => void
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
    accounts: [],
    setAccounts: (accounts: Account[]) => set({ accounts }),

    budget: {} as Budget,
    setBudget: (budget: Budget) => set({ budget }),

    monthlyBudgetsView: {} as Record<string, BudgetView>,
    setMonthlyBudgetsView: (month: string, budgetView: BudgetView) => {
        set((state) => ({ monthlyBudgetsView: { ...state.monthlyBudgetsView, [month]: budgetView}}))
    }
}))