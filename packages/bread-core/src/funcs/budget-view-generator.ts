import { Category, CategoryEntry, CategoryGroup, CategoryGroupView, CategoryView, BudgetView } from "../types"

export const generateBudgetView = (
    categories: Record<string, Category>,
    categoryGroups: Record<string, CategoryGroup>,
    categoryEntries: Record<string, CategoryEntry>,
    month: string,
) => {
    const categoryGroupsViewRecord: Record<string, CategoryGroupView> = {}
    for (const categoryId in categories) {
        const category = categories[categoryId]
        const categoryEntry = categoryEntries[categoryId] ?? { assigned: 0, activity: 0, available: 0 }

        const categoryView: CategoryView = {
            id: category.id,
            name: category.name,
            isSystem: category.isSystem,
            assigned: categoryEntry.assigned,
            activity: categoryEntry.activity,
            available: categoryEntry.available,
        }
        
        if (!categoryGroupsViewRecord[category.categoryGroupId]) {
            categoryGroupsViewRecord[category.categoryGroupId] = {
                id: category.categoryGroupId,
                name: categoryGroups[category.categoryGroupId].name,
                assigned: 0,
                activity: 0,
                available: 0,
                categories: []
            }
        }
        
        categoryGroupsViewRecord[category.categoryGroupId].activity += categoryView.activity
        categoryGroupsViewRecord[category.categoryGroupId].assigned += categoryView.assigned 
        categoryGroupsViewRecord[category.categoryGroupId].available += categoryView.available 
        categoryGroupsViewRecord[category.categoryGroupId].categories.push(categoryView)
    }

    const budgetView: BudgetView = {
        month,
        readytoassign: categoryEntries['readytoassign'].available,
        categoryGroups: Object.values(categoryGroupsViewRecord)
    }

    return budgetView
}