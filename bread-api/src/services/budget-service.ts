import { getCurrentMonthId } from "../utils/date-id-format"
import { db } from "../firebase/server"
import { getCategories, getCategoriesMonth, getCategoryGroups } from "./category-service"
import { Budget } from "bread-core/src"

/**
 * @returns `id` of the created budget
 */
export const createBudget = async (userId: string, budgetName: string) => {
    const budgetRef = db.collection('users').doc(userId).collection('budgets').doc()

    const budgetData: Budget = {
        id: budgetRef.id,
        name: budgetName,
        createdAt: Date.now(),
        currency: 'INR',
        minMonth: getCurrentMonthId(),
        maxMonth: getCurrentMonthId(),
    }

    await budgetRef.set(budgetData)

    // when a budget is created, we also need to update the user's currentBudgetId field to this newly created budget
    await db.collection('users').doc(userId).update({
        currentBudgetId: budgetRef.id,
    })

    return budgetRef.id
}

export const getBudgetRef = (userId: string, budgetId: string) => {
    return db.collection('users').doc(userId).collection('budgets').doc(budgetId)
}

export const getBudgets = async (userId: string) => {
    const budgetsSnapshot = await db.collection('users').doc(userId).collection('budgets').get()
    const budgets = [] as any

    budgetsSnapshot.forEach((doc) => {
        budgets.push(doc.data())
    })

    return budgets
}

export const getBudget = async (userId: string, budgetId: string) => {
    const budgetSnapshot = await db.collection('users').doc(userId).collection('budgets').doc(budgetId).get()

    if (!budgetSnapshot.exists) {
        return null
    }

    const data = budgetSnapshot.data()

    if (!data) {
        return null
    }

    const budget: Budget = {
        id: data.id,
        name: data.name,
        createdAt: data.createdAt,
        currency: data.currency,
        minMonth: data.minMonth,
        maxMonth: data.maxMonth
    }
    console.log(budget)

    return budget
}

export const getBudgetMonth = async (userId: string, budgetId: string, month: string) => {
    const categories = await getCategories(userId, budgetId)
    const categoryGroups = await getCategoryGroups(userId, budgetId)
    const categoriesMonth = await getCategoriesMonth(userId, budgetId, month)

    const budgetMonth: Record<string, any> = {}

    for (const categoryId in categories) {
        categories[categoryId] = {
            ...categories[categoryId],
            available: categoriesMonth[`${categoryId}${month}`].available,
            budgeted: categoriesMonth[`${categoryId}${month}`].budgeted,
            activity: categoriesMonth[`${categoryId}${month}`].activity,
        }
    }

    for (const categoryGroupId in categoryGroups) {
        budgetMonth[categoryGroupId] = {
            ...categoryGroups[categoryGroupId],
            categories: Object.values(categories).filter((category: any) => category.categoryGroupId === categoryGroupId)
        }
    }

    return Object.values(budgetMonth)
}