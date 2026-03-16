import { useBudgetStore } from "../budget-store"
import { generateBudgetView } from "bread-core/src"

export const useBudgetView = (month: string) => {
  return useBudgetStore((state) => {
    const entries = state.monthlyCategoryEntries[month]

    if (!entries) return null

    return generateBudgetView(
      state.categories,
      state.categoryGroups,
      entries,
      month
    )
  })
}