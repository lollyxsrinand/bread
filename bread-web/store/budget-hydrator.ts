'use client'

import { useEffect } from "react"
import { useBudgetStore } from "./budget-store"
import { HydrateBudgetState } from "@/utils/hydrate-budget-type"

export const BudgetHydrator = (props: HydrateBudgetState) => {
  const hydrate = useBudgetStore((s) => s.hydrate)

  useEffect(() => {
    hydrate(props)
  }, [hydrate])

  return null
}