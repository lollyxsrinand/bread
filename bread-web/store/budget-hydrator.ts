'use client'

import { useEffect } from "react"
import { useBudgetStore } from "./budget-store"
import { Account, Budget, BudgetView, Category, CategoryEntry, CategoryGroup } from "bread-core/src"
interface Props {
  accounts?: Account[],
  budget?: Budget,
  budgetView?: BudgetView,
  categories?: Record<string, Category>,
  categoryGroups?: Record<string, CategoryGroup>,
  categoryEntries?: {
    month: string,
    entries: Record<string, CategoryEntry>
  }
}
export const BudgetHydrator = ({accounts, budget, budgetView, categories, categoryGroups, categoryEntries}: Props) => {
  const setAccounts = useBudgetStore((s) => s.setAccounts)
  const setMonthlyBudgetsView = useBudgetStore((s) => s.setBudgetViews)
  const setBudget = useBudgetStore((s) => s.setBudget)
  const monthlyView = useBudgetStore(s => s.budgetViews)

  useEffect(() => {
    if (accounts) {
      setAccounts(accounts)
    }

    if (budgetView) {
      setMonthlyBudgetsView(budgetView.month, budgetView)
    }

    if (budget) {
      setBudget(budget)
    }
  }, [accounts, setAccounts, budget, setBudget, budgetView, setMonthlyBudgetsView])

  return null
}