import { db } from "../firebase/server"
import { getCategories, getCategoriesMonth, getCategoryGroups } from "./category-service"

/**
 * @returns `id` of the created budget
 */
export const createBudget = async (userId: string, budgetName: string) => {
    const budgetRef = db.collection('users').doc(userId).collection('budgets').doc()

    await budgetRef.set({
        id: budgetRef.id,
        name: budgetName,
        createdAt: new Date(),
        currency: 'INR'
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

// currently get
export const getBudgetMonth = async (userId: string, budgetId: string, month: string) => {
    const categories = await getCategories(userId, budgetId)
    const categoryGroups = await getCategoryGroups(userId, budgetId)
    const categoriesMonth = await getCategoriesMonth(userId, budgetId, month)
    console.log(categories);
    console.log(categoriesMonth);
    console.log(categoryGroups);

    const budgetMonth = {
        categories: categories.map((category: any) => {
            const categoryMonth = categoriesMonth.find((cm: any) => cm.categoryId === category.id)

            return {
                ...category,
                activity: categoryMonth?.activity || 0,
                available: categoryMonth?.available || 0,
            }
        }),
        categoryGroups,
    }
    return budgetMonth
}