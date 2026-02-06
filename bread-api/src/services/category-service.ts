import { db } from "../firebase/server"

/**
 * 
 * @param userId 
 * @param budgetId
 * @param categoryGroupName 
 * @returns `categoryGroupRef.id`
 */
export const createCategoryGroup = async (userId: string, budgetId: string, categoryGroupName: string) => {
    const categoryGroupRef = db
        .collection('users').doc(userId) // users/{userId}
        .collection('budgets').doc(budgetId) // users/{userId}/budgets/{budgetId}
        .collection('categoryGroups').doc() // users/{userId}/budgets/{budgetId}/categoryGroups/{categoryGroupId} holy.

    await categoryGroupRef.set({
        id: categoryGroupRef.id,
        name: categoryGroupName,
        createdAt: new Date(),
    })

    return categoryGroupRef.id
}

/**
 * 
 * @param userId 
 * @param budgetId
 * @param categoryGroupId 
 * @param categoryName 
 * @returns `categoryId`
 */
export const createCategory = async (userId: string, budgetId: string, categoryGroupId: string, categoryName: string) => {
    const categoryRef = db
        .collection('users').doc(userId) // users/{userId}
        .collection('budgets').doc(budgetId) // users/{userId}/budgets/{budgetId}
        .collection('categories').doc() // users/{userId}/budgets/{budgetId}/categories/{categoryId} holy.

    await categoryRef.set({
        id: categoryRef.id,
        name: categoryName,
        categoryGroupId: categoryGroupId,
        createdAt: new Date(),
    })

    return categoryRef.id
}