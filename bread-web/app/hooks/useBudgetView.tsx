import { useMemo } from "react"
import { useBudgetStore } from "@/store/budget-store"
import { generateBudgetView } from "bread-core/src"

export function useBudgetView(month: string) {
    const categories = useBudgetStore((s) => s.categories)
    const categoryGroups = useBudgetStore((s) => s.categoryGroups)
    const monthlyCategoryEntries = useBudgetStore((s) => s.monthlyCategoryEntries)

    const entries = monthlyCategoryEntries[month]

    // what about monthly summary here? hello moto?
    return useMemo(() => {
        if (!entries) return null

        return generateBudgetView(
            categories,
            categoryGroups,
            entries,
            month
        )
    }, [categories, categoryGroups, entries, month])
}