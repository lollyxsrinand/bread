import { CategoryGroup, getCurrentMonthId } from "bread-core/src"
import { db, FieldValue } from "../firebase/server"
import { getCategories, getCategoriesMonth, getCategoryGroups } from "./category-service"
import { Budget, Category, CategoryGroupView, CategoryMonth, CategoryView, MonthlyBudgetView } from "bread-core/src"

export const createBudget = async (userId: string, budgetName: string) => {
    const ref = db.collection('users').doc(userId).collection('budgets').doc()

    const budget: Budget = {
        id: ref.id,
        name: budgetName,
        createdAt: Date.now(),
        currency: 'INR',
        minMonth: getCurrentMonthId(),
        maxMonth: getCurrentMonthId(),
    }

    await ref.set(budget)

    // when a budget is created, we also need to update the user's currentBudgetId field to this newly created budget
    await db.collection('users').doc(userId).update({
        currentBudgetId: ref.id,
    })

    return budget
}

export const getBudgetRef = (userId: string, budgetId: string) => {
    return db.collection('users').doc(userId).collection('budgets').doc(budgetId)
}

export const getBudgets = async (userId: string) => {
    const snapshot = await db.collection('users').doc(userId).collection('budgets').get()
    const budgets: Budget[] = [] 

    snapshot.forEach((doc) => {
        budgets.push(doc.data() as Budget)
    })

    return budgets
}

export const getBudget = async (userId: string, budgetId: string) => {
    const snapshot = await db.collection('users').doc(userId).collection('budgets').doc(budgetId).get()

    const data = snapshot.data()
    if (!data) {
        throw new Error(`budget with id ${budgetId} not found for user ${userId}`)
    }
    return data as Budget
}

export const getMonthlyBudgetView = async (userId: string, budgetId: string, month: string) => {
    const [budget, categories, categoryGroups, categoriesMonth] = await Promise.all([
        getBudget(userId, budgetId),
        getCategories(userId, budgetId),
        getCategoryGroups(userId, budgetId),
        getCategoriesMonth(userId, budgetId, month)
    ])

    const categoriesView: CategoryView[] = []
    for(const categoryId in categories) {
        const category = categories[categoryId]
        const categoryMonth = categoriesMonth[`${categoryId}${month}`] 

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
        const categoryGroup = categoryGroups[categoryGroupId] 

        categoryGroupsView.push({
            id: categoryGroup.id,
            name: categoryGroup.name,
            categories: categoriesView.filter(category => (categories[category.id] as Category).categoryGroupId === categoryGroupId)
        })
    }

    const monthlyBudgetView: MonthlyBudgetView = {
        month,
        minMonth: budget.minMonth,
        maxMonth: budget.maxMonth, 
        toBeAssigned: categoriesMonth['readytoassign' + month]?.available || 0, // sketchy
        categoryGroups: categoryGroupsView
    }

    return monthlyBudgetView
}