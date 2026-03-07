'use client'

import { useEffect } from "react"
import { useBudgetStore } from "./budget-store"
import { Account, Budget, BudgetView } from "bread-core/src"

export const BudgetHydrator = ({ accounts, budget, budgetView }: { accounts?: Account[], budget?: Budget, budgetView?: BudgetView }) => {
  const setAccounts = useBudgetStore((s) => s.setAccounts)
  const setMonthlyBudgetsView = useBudgetStore((s) => s.setMonthlyBudgetsView)
  const setBudget = useBudgetStore((s) => s.setBudget)
  const monthlyView = useBudgetStore(s => s.monthlyBudgetsView)

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