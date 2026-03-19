import { CascadeComputeCategoryEntriesResult, CategoryEntry, MonthId } from "../types";

/**
 * 
 * sorts the category entries
 * iteratively calculates available for each month based on the previous month
 * @param categoryEntries 
 * @returns 
 */
export const __cascadeComputeCategoryEntries__ = (categoryEntries: Record<MonthId, CategoryEntry>): CascadeComputeCategoryEntriesResult => {
    const months = Object.keys(categoryEntries).sort()
    const updatedCategoryEntries = structuredClone(categoryEntries)

    let prevCategoryEntry: CategoryEntry | null = null
    for (const month of months) {
        if (!prevCategoryEntry) {
            prevCategoryEntry = updatedCategoryEntries[month]
            continue
        }
        const prevAvailable = prevCategoryEntry.available
        const currCategoryEntry = updatedCategoryEntries[month]
        currCategoryEntry.available = currCategoryEntry.assigned + currCategoryEntry.activity + prevAvailable
        prevCategoryEntry = currCategoryEntry
    }

    return { updatedCategoryEntries } 
}