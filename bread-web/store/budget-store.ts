import { assignToCategory as _assignToCategory } from '@/lib/actions/category.actions'
import { Account, Budget, BudgetView, Category, CategoryEntry, CategoryGroup } from 'bread-core/src'
import { create } from 'zustand'

interface BudgetState {
    accounts: Account[]
    setAccounts: (accounts: Account[]) => void

    budget: Budget
    setBudget: (budget: Budget) => void

    categories: Record<string, Category>
    setCategories: (categories: Record<string, Category>) => void

    categoryGroups: Record<string, CategoryGroup>
    setCategoryGroups: (categoryGroups: Record<string, CategoryGroup>) => void

    categoryEntries: Record<string, Record<string, CategoryEntry>>
    setCategoryEntries: (month: string, categoryEntries: Record<string, CategoryEntry>) => void

    budgetViews: Record<string, BudgetView>
    setBudgetViews: (month: string, budgetView: BudgetView) => void
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
    accounts: [],
    setAccounts: (accounts: Account[]) => set({ accounts }),

    budget: {} as Budget,
    setBudget: (budget: Budget) => set({ budget }),

    categories: {},
    setCategories: (categories: Record<string, Category>) => set({ categories }),

    categoryGroups: {},
    setCategoryGroups: (categoryGroups: Record<string, CategoryGroup>) => set({ categoryGroups }),

    categoryEntries:{},
    setCategoryEntries: (month: string, categoryEntries: Record<string, CategoryEntry>) => set((state) => ({ categoryEntries: {...state.categoryEntries, [month]: categoryEntries} })),

    budgetViews: {} as Record<string, BudgetView>,
    setBudgetViews: (month: string, budgetView: BudgetView) => {
        set((state) => ({ budgetViews: { ...state.budgetViews, [month]: budgetView}}))
    }

}))