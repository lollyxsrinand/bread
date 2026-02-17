import { formatDateId } from "../utils/date-id-format"
import { db } from "../firebase/server"

/**
 * @returns `categoryGroupRef.id` of the created category group
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
 * @returns `categoryId` of the created category
 */
export const createCategory = async (userId: string, budgetId: string, categoryGroupId: string, categoryName: string, isUserCategory: boolean=true) => {
    const categoryRef = db
        .collection('users').doc(userId) // users/{userId}
        .collection('budgets').doc(budgetId) // users/{userId}/budgets/{budgetId}
        .collection('categories').doc() // users/{userId}/budgets/{budgetId}/categories/{categoryId} holy.

    await categoryRef.set({
        id: categoryRef.id,
        name: categoryName,
        categoryGroupId: categoryGroupId,
        isUserCategory, 
        createdAt: new Date(),
    })

    return categoryRef.id
}

export const createCategoryMonth = async (userId: string, budgetId: string, categoryId: string, month: string) => {
    const categoryMonthId = `${categoryId}${month}`

    const ref = db
        .collection('users').doc(userId)
        .collection('budgets').doc(budgetId)
        .collection('categoryMonths').doc(categoryMonthId)

    await ref.set({
        id: categoryMonthId,
        categoryId,
        month,
        budgeted: 0,
        activity: 0,
        available: 0,
        createdAt: new Date(),
    })

    return ref.id
}

export const getCategoryMonthRef = (userId: string, budgetId: string, categoryId: string, date: Date) => {
    return db
        .collection('users').doc(userId)
        .collection('budgets').doc(budgetId)
        .collection('categoryMonths').doc(`${categoryId}${formatDateId(date)}`)
}

export const getCategories = async (userId: string, budgetId: string) => {
    const snapshot = await db
        .collection('users').doc(userId)
        .collection('budgets').doc(budgetId)
        .collection('categories').get()

    const categories: Record<string, any> = Object.fromEntries(
        snapshot.docs.map(doc => [doc.id, doc.data()])
    )

    return categories
}

export const getCategoriesMonth = async (userId: string, budgetId: string, month: string) => {
    const snapshot = await db
        .collection('users').doc(userId)
        .collection('budgets').doc(budgetId)
        .collection('categoryMonths')
        .where('month', '==', month)
        .get()

    const categoriesMonth: Record<string, any> = Object.fromEntries(
        snapshot.docs.map(doc => [doc.id, doc.data()])
    )

    return categoriesMonth
}

export const getCategoryGroups = async (userId: string, budgetId: string) => {
    const snapshot = await db
        .collection('users').doc(userId)
        .collection('budgets').doc(budgetId)
        .collection('categoryGroups')
        .get()

    const categoryGroups: Record<string, any> = Object.fromEntries(
        snapshot.docs.map(doc => [doc.id, doc.data()])
    )

    return categoryGroups
}