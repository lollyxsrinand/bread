'use client'

import { useEffect } from "react"
import { useBudgetStore } from "./budget-store"
import { Account, MonthlyBudgetView } from "bread-core"

export const BudgetHydrator = ({accounts, monthlyBudget }: {accounts: Account[], monthlyBudget: MonthlyBudgetView}) => {
    const setAccounts = useBudgetStore((s) => s.setAccounts)
    const setMonthlyBudget = useBudgetStore((s) => s.setMonthlyBudget)

    useEffect(() => {
      setAccounts(accounts)
      setMonthlyBudget(monthlyBudget.month, monthlyBudget)
    }, [accounts, setAccounts, monthlyBudget, setMonthlyBudget])
  
    return null
}