import { BudgetView, generateBudgetView, getCurrentMonthId } from "bread-core/src"
import { db } from "../firebase/server"
import { Budget } from "bread-core/src"
import { getCategories, getAllCategoryEntriesForMonth, getCategoryGroups } from "./category-service"
import assert from "assert"

export const createBudget = async (userId: string, budgetName: string) => {
    const ref = db.collection('users').doc(userId).collection('budgets').doc()
    const budget: Budget = {
        id: ref.id,
        name: budgetName,
        createdAt: Date.now(),
        currency: 'INR',
        minMonth: getCurrentMonthId(),
        maxMonth: getCurrentMonthId(),
        totalAssigned: 0,
        totalIncome: 0, 
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
        return null 
    }
    return data as Budget
}

export const getBudgetView = async (userId: string, budgetId: string, month: string) => {
    const [categories, categoryGroups, categoryEntries] = await Promise.all([
        getCategories(userId, budgetId),
        getCategoryGroups(userId, budgetId),
        getAllCategoryEntriesForMonth(userId, budgetId, month),
    ])

    assert(categories, "pls exist")
    assert(categoryGroups, "pls exist")
    assert(categoryEntries, "pls exist")

    const budgetView: BudgetView = generateBudgetView(categories, categoryGroups, categoryEntries, month)

    return budgetView
} 