import { Budget, Category, CategoryGroup, CategoryMonth, getNextMonthId, getPreviousMonthId, toMonthId } from "bread-core/src"
import { db, FieldValue } from "../firebase/server"
import { getBudget, getBudgetRef } from "./budget-service"

/**
 * - creates a new `CategoryGroup` doc under `budgets/{budgetId}/categoryGroups` collection
 * @returns the created `CategoryGroup` 
 */
export const createCategoryGroup = async ( userId: string, budgetId: string, name: string ) => {
    const categoryGroupRef = db
        .collection('users').doc(userId) 
        .collection('budgets').doc(budgetId) 
        .collection('categoryGroups').doc()

    const categoryGroup: CategoryGroup = {
        id: categoryGroupRef.id,
        name: name,
        createdAt: Date.now(),
    }

    await categoryGroupRef.set(categoryGroup)
    return categoryGroup
}

/**
 * - creates a new `Category` doc under `budgets/{budgetId}/categories` collection
 * @returns the created `Category`
 */
export const createCategory = async (
    userId: string, 
    budgetId: string, 
    categoryGroupId: string, 
    categoryName: string, 
    isSystem: boolean = false, 
    id?: string
) => {
    const categoriesRef = db
        .collection('users').doc(userId) 
        .collection('budgets').doc(budgetId)
        .collection('categories')

    const categoryRef = id ? categoriesRef.doc(id) : categoriesRef.doc()

    const category: Category = {
        id: categoryRef.id,
        name: categoryName,
        categoryGroupId: categoryGroupId,
        isSystem,
        createdAt: Date.now(),
    }

    await categoryRef.set(category)

    return category
}

/**
 * - creates a new `CategoryMonth` doc under `budgets/{budgetId}/categoryMonths/{month}/categories/{categoryId}` collection
 * - this is used to track the budgeted, activity and possibly available amounts for a category in a given month
 * @returns the created `CategoryMonth`
 */
export const createCategoryMonth = async (userId: string, budgetId: string, categoryId: string, month: string) => {
    const categoryMonthId = `${categoryId}${month}`

    const ref = db
        .collection('users').doc(userId)
        .collection('budgets').doc(budgetId)
        .collection('categoryMonths').doc(month)
        .collection('categories').doc(categoryId)
    
    const categoryMonth: CategoryMonth = {
        id: categoryMonthId,
        categoryId,
        month,
        budgeted: 0,
        activity: 0,
        available: 0,
        createdAt: Date.now(),
    }

    await ref.create(categoryMonth)

    return categoryMonth
}

/**
 * @returns a reference to the all the category month docs for a given month under the path `budgets/{budgetId}/categoryMonths/{month}/categories`
 */
export const getCategoriesMonthRef = (userId: string, budgetId: string, month: string) => {
    return db
        .collection('users').doc(userId)
        .collection('budgets').doc(budgetId)
        .collection('categoryMonths').doc(month)
        .collection('categories')
}

/**
 * @returns all categories mapped to their ids 
 */
export const getCategories = async (userId: string, budgetId: string) => {
    const snapshot = await db
        .collection('users').doc(userId)
        .collection('budgets').doc(budgetId)
        .collection('categories').get()

    const categories: Record<string, Category> = Object.fromEntries(
        snapshot.docs.map(doc => [doc.id, doc.data() as Category])
    )

    return categories
}

/**
 * @returns all category months mapped to their ids for a given month 
 */
export const getCategoriesMonth = async (userId: string, budgetId: string, month: string) => {
    const snapshot = await getCategoriesMonthRef(userId, budgetId, month).get()
    
    if (snapshot.empty) {
        throw new Error(`no category months found for month ${month}`)
    }

    const categoriesMonth: Record<string, CategoryMonth> = Object.fromEntries(
        snapshot.docs.map(doc => [doc.id, doc.data() as CategoryMonth])
    )

    return categoriesMonth
}

/**
 * @returns all category groups mapped to their ids 
 */
export const getCategoryGroups = async (userId: string, budgetId: string) => {
    const snapshot = await db
        .collection('users').doc(userId)
        .collection('budgets').doc(budgetId)
        .collection('categoryGroups')
        .get()

    const categoryGroups: Record<string, CategoryGroup> = Object.fromEntries(
        snapshot.docs.map(doc => [doc.id, doc.data() as CategoryGroup])
    )

    return categoryGroups
}

/* rewrite this */
export const assignToCategoryMonth = async (
    userId: string, 
    budgetId: string, 
    month: string, 
    categoryId: string, 
    amount: number
) => {
    return null
}

/* rewrite this */
export const rolloverToNextMonth = async (userId: string, budgetId: string) => {
    return null
}