'use client'

import { useEffect, useRef } from "react"
import { useBudgetStore } from "./budget-store"
import {
  Account,
  Budget,
  Category,
  CategoryEntry,
  CategoryGroup,
  MonthSummary,
  Transaction
} from "bread-core/src"

type BudgetHydratorProps = Partial<{
  transactions: Record<string, Transaction>
  accounts: Record<string, Account>
  budget: Budget
  categories: Record<string, Category>
  categoryGroups: Record<string, CategoryGroup>
  monthlyCategoryEntries: Record<string, Record<string, CategoryEntry>>
  monthlySummary: Record<string, MonthSummary>
}>

export const BudgetHydrator = ({ data }: { data: BudgetHydratorProps }) => {
  const setPartial = useBudgetStore((s) => s.setPartial)
  const hasHydrated = useRef(false)

  useEffect(() => {
    if (!data || hasHydrated.current) return

    setPartial(data)
    hasHydrated.current = true
  }, [data, setPartial])

  return null
}