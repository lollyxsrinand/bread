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

interface BudgetState {
  transactions: Record<string, Transaction>
  accounts: Record<string, Account>
  budget: Budget | null
  categories: Record<string, Category>
  categoryGroups: Record<string, CategoryGroup>
  monthlyCategoryEntries: Record<string, Record<string, CategoryEntry>>
  monthlySummary: Record<string, MonthSummary>

  setPartial: (data: Partial<BudgetState>) => void
}

export const useBudgetStore = create<BudgetState>((set) => ({
  transactions: {},
  accounts: {},
  budget: null,
  categories: {},
  categoryGroups: {},
  monthlyCategoryEntries: {},
  monthlySummary: {},

  setPartial: (data) =>
    set((state) => {
      let hasChanged = false

      const nextState: BudgetState = {
        ...state
      }

      for (const key in data) {
        if (
          key !== "monthlyCategoryEntries" &&
          key !== "monthlySummary"
        ) {
          const k = key as keyof BudgetState

          if (state[k] !== data[k]) {
            (nextState as any)[k] = data[k]
            hasChanged = true
          }
        }
      }

      if (data.monthlyCategoryEntries) {
        console.log('we are here atleast')
        const merged = { ...state.monthlyCategoryEntries }

        for (const month in data.monthlyCategoryEntries) {
          if (
            state.monthlyCategoryEntries[month] !==
            data.monthlyCategoryEntries[month]
          ) {
            console.log("but we're just not here yet i suppose")
            merged[month] = data.monthlyCategoryEntries[month]
            hasChanged = true
          }
        }

        nextState.monthlyCategoryEntries = merged
      }

      if (data.monthlySummary) {
        const merged = { ...state.monthlySummary }

        for (const month in data.monthlySummary) {
          if (
            state.monthlySummary[month] !==
            data.monthlySummary[month]
          ) {
            merged[month] = data.monthlySummary[month]
            hasChanged = true
          }
        }

        nextState.monthlySummary = merged
      }

      if (!hasChanged) return state

      return nextState
    })
}))