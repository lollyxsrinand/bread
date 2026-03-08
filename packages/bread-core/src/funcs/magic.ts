import { CategoryEntry } from "../types";

export const magic = (
    updatedCategoryEntry: CategoryEntry,
    toBeUpdatedCategoryEntries: Record<string, CategoryEntry> 
) => {
    const categoryId = updatedCategoryEntry.id
    if (toBeUpdatedCategoryEntries[updatedCategoryEntry.month]) {
        throw new Error("wromg")
    }

    const updatedCategoryEntries: Record<string, CategoryEntry> = {}
    let previousUpdatedCategoryEntry = updatedCategoryEntry
    const months = Object.keys(toBeUpdatedCategoryEntries).sort()
    for (const month of months) {
        const categoryEntry = toBeUpdatedCategoryEntries[month]
        categoryEntry.available = categoryEntry.assigned - categoryEntry.activity + previousUpdatedCategoryEntry.available
        updatedCategoryEntries[month] = categoryEntry
        previousUpdatedCategoryEntry = categoryEntry
    }

    return updatedCategoryEntries
}
