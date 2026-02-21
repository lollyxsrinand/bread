'use client'

import { useEffect } from "react"
import { useBudgetStore } from "./budget-store"
import { Account } from "bread-core"

export const BudgetHydrator = ({accounts }: {accounts: Account[]}) => {
    const setAccounts = useBudgetStore((s) => s.setAccounts)

    useEffect(() => {
      setAccounts(accounts)
    }, [accounts, setAccounts])
  
    return null
}