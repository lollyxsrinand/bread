'use client'

import { useEffect } from "react"
import { useAccountStore } from "./account-store"
import { Account } from "bread-core/src"

export const AccountHydrator = ({accounts}: {accounts: Account[]}) => {
    const setAccounts = useAccountStore((s) => s.setAccounts)

    useEffect(() => {
      setAccounts(accounts)
    }, [accounts, setAccounts])
  
    return null
}