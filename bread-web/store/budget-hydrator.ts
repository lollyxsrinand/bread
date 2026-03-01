'use client'

import { useEffect } from "react"
import { useBudgetStore } from "./budget-store"
import { Account, Budget, MonthlyBudgetView } from "bread-core/src"

export const BudgetHydrator = ({ accounts, budget, monthlyBudget }: { accounts?: Account[], budget?: Budget, monthlyBudget?: MonthlyBudgetView }) => {
  const setAccounts = useBudgetStore((s) => s.setAccounts)
  const setMonthlyBudget = useBudgetStore((s) => s.setMonthlyBudget)
  const setBudget = useBudgetStore((s) => s.setBudget)

  useEffect(() => {
    if (accounts) {
      setAccounts(accounts)
    }

    if (monthlyBudget) {
      setMonthlyBudget(monthlyBudget.month, monthlyBudget)
    }

    if (budget) {
      setBudget(budget)
    }
  }, [accounts, setAccounts, budget, setBudget, monthlyBudget, setMonthlyBudget])

  return null
}