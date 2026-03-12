import { CategoryEntry } from "../types";

export const magic = (categoryEntries: Record<string, CategoryEntry>) => {
    const months = Object.keys(categoryEntries).sort()
    const entries = structuredClone(categoryEntries)

    let prevCategoryEntry: CategoryEntry | null = null
    for (const month of months) {
        if (!prevCategoryEntry) {
            prevCategoryEntry = entries[month]
            continue
        }
        const prevAvailable = prevCategoryEntry.available
        // if (prevAvailable <= 0) {
        //     return {updatedEntries: entries, overspent: { amount: prevAvailable, month: prevCategoryEntry.month }}
        // }
        const currCategoryEntry = entries[month]
        currCategoryEntry.available = currCategoryEntry.assigned + currCategoryEntry.activity + prevAvailable
        prevCategoryEntry = currCategoryEntry
    }

    return { updatedEntries: entries, overspent: null }
}