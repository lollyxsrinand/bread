'use client'

import { useEffect } from "react"
import { useBudgetStore } from "./budget-store"
import { Account, MonthlyBudgetView } from "bread-core/src"

export const BudgetHydrator = ({accounts, monthlyBudget }: {accounts?: Account[], monthlyBudget?: MonthlyBudgetView}) => {
    const setAccounts = useBudgetStore((s) => s.setAccounts)
    const setMonthlyBudget = useBudgetStore((s) => s.setMonthlyBudget)

    useEffect(() => {
      if (accounts) {
        setAccounts(accounts)
      }

      if(monthlyBudget) {
        setMonthlyBudget(monthlyBudget.month, monthlyBudget)
      }

    }, [accounts, setAccounts, monthlyBudget, setMonthlyBudget])
  
    return null
}