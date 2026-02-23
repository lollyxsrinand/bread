import { getCurrentMonthId } from "../utils/date-id-format"
import { db, FieldValue } from "../firebase/server"
import { getCategories, getCategoriesMonth, getCategoryGroups } from "./category-service"
import { Budget, Category, CategoryGroupView, CategoryMonth, CategoryView, MonthlyBudgetView } from "bread-core"

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

export const getMonthlyBudget = async (userId: string, budgetId: string, month: string) => {
    const categories = await getCategories(userId, budgetId)
    const categoryGroups = await getCategoryGroups(userId, budgetId)
    const categoriesMonth = await getCategoriesMonth(userId, budgetId, month)

    const categoriesView: CategoryView[] = []
    for(const categoryId in categories) {
        const category = categories[categoryId] as Category
        const categoryMonth = categoriesMonth[`${categoryId}${month}`] as CategoryMonth

        categoriesView.push({
            id: category.id,
            name: category.name,
            isSystem: category.isSystem,
            activity: categoryMonth.activity ?? 0,
            available: categoryMonth.available ?? 0,
            budgeted: categoryMonth.budgeted ?? 0,
        })
    }

    const categoryGroupsView: CategoryGroupView[] = []
    for(const categoryGroupId in categoryGroups) {
        const categoryGroup = categoryGroups[categoryGroupId] as CategoryGroupView

        categoryGroupsView.push({
            id: categoryGroup.id,
            name: categoryGroup.name,
            categories: categoriesView.filter(category => (categories[category.id] as Category).categoryGroupId === categoryGroupId)
        })
    }

    const monthlyBudgetView: MonthlyBudgetView = {
        month,
        toBeAssigned: categoriesMonth['readytoassign' + month]?.available || 0,
        categoryGroups: categoryGroupsView
    }

    return monthlyBudgetView
}