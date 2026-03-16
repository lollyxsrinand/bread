import {
    Account,
    Budget,
    Category,
    CategoryEntry,
    CategoryGroup,
    MonthSummary,
    Transaction
  } from "bread-core/src"
  import { create } from "zustand"
import { HydrateBudgetState } from "@/utils/hydrate-budget-type"
  
  interface BudgetState {
    transactions: Transaction[]
    setTransactions: (transactions: Transaction[]) => void
  
    accounts: Account[]
    setAccounts: (accounts: Account[]) => void
  
    budget: Budget
    setBudget: (budget: Budget) => void
  
    categories: Record<string, Category>
    setCategories: (categories: Record<string, Category>) => void
  
    categoryGroups: Record<string, CategoryGroup>
    setCategoryGroups: (categoryGroups: Record<string, CategoryGroup>) => void
  
    monthlyCategoryEntries: Record<string, Record<string, CategoryEntry>>
    setMonthlyCategoryEntries: (
      month: string,
      categoryEntries: Record<string, CategoryEntry>
    ) => void
  
    monthlySummary: Record<string, MonthSummary>
    setMonthlySummary: (month: string, summary: MonthSummary) => void
  
    hydrate: (data: HydrateBudgetState) => void
  }
  
  export const useBudgetStore = create<BudgetState>((set) => ({
    transactions: [],
    setTransactions: (transactions) => set({ transactions }),
  
    accounts: [],
    setAccounts: (accounts) => set({ accounts }),
  
    budget: {} as Budget,
    setBudget: (budget) => set({ budget }),
  
    categories: {},
    setCategories: (categories) => set({ categories }),
  
    categoryGroups: {},
    setCategoryGroups: (categoryGroups) => set({ categoryGroups }),
  
    monthlyCategoryEntries: {},
    setMonthlyCategoryEntries: (month, categoryEntries) =>
      set((state) => ({
        monthlyCategoryEntries: {
          ...state.monthlyCategoryEntries,
          [month]: categoryEntries
        }
      })),
  
    monthlySummary: {},
    setMonthlySummary: (month, summary) =>
      set((state) => ({
        monthlySummary: {
          ...state.monthlySummary,
          [month]: summary
        }
      })),
  
    hydrate: (data) =>
      set((state) => ({
        transactions: data.transactions ?? state.transactions,
        accounts: data.accounts ?? state.accounts,
        budget: data.budget ?? state.budget,
        categories: data.categories ?? state.categories,
        categoryGroups: data.categoryGroups ?? state.categoryGroups,
  
        monthlyCategoryEntries: {
          ...state.monthlyCategoryEntries,
          ...(data.categoryEntries ?? {})
        },
  
        monthlySummary: {
          ...state.monthlySummary,
          ...(data.monthSummaries ?? {})
        }
      }))
  }))