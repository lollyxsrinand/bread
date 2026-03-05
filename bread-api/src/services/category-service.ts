import { Category, CategoryEntry, CategoryGroup } from "bread-core/src"
import { db } from "../firebase/server"

// path -> entity name as in dtype
// monthly-category-entries -> MonthlyCategoryEntries
// monthly-category-entries/{month}/category-entries -> CategoryEntries (CategoryEntry[])
// monthly-category-entries/{month}/category-entries/{category-entry} -> CategoryEntry

/**
 * - creates a new `CategoryGroup` doc under `budgets/{budgetId}/categoryGroups` collection
 * @returns the created `CategoryGroup` 
 */
export const createCategoryGroup = async (userId: string, budgetId: string, name: string) => {
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
 * - creates a new `CategoryEntry` doc under `budgets/{budgetId}/mothly-category-entries/{month}/category-entries/{categoryEntry}` collection
 * - this is used to track the budgeted, activity and possibly available amounts for a category in a given month
 * @returns the created `CategoryEntry`
 */
export const createCategoryEntry = async (userId: string, budgetId: string, categoryId: string, month: string) => {
    const ref = db
        .collection('users').doc(userId)
        .collection('budgets').doc(budgetId)
        .collection('monthly-category-entries').doc(month)
        .collection('category-entries').doc(categoryId)

    const categoryEntry: CategoryEntry = {
        id: categoryId,
        month: month,
        assigned: 0,
        activity: 0,
        available: 0,
        createdAt: Date.now(),
    }

    await ref.create(categoryEntry)

    return categoryEntry
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

/**
 * @returns all categories mapped to their ids 
 */
export const getCategories = async (userId: string, budgetId: string) => {
    const snapshot = await db
        .collection('users').doc(userId)
        .collection('budgets').doc(budgetId)
        .collection('categories')
        .get()
    
    if (snapshot.empty || !snapshot.docs) {
        return null
    }

    const categories: Record<string, Category> = Object.fromEntries(
        snapshot.docs.map(doc => [doc.id, doc.data() as Category])
    )

    return categories
}


/**
 * gets all the category entries in `month` as a map
 * @returns 
 */
export const getCategoryEntries = async (userId: string, budgetId: string, month: string) => {
    const categoryEntriesRef = db
        .collection('users').doc(userId)
        .collection('budgets').doc(budgetId)
        .collection('monthly-category-entries').doc(month)
        .collection('category-entries')
    
    const categoryEntriesSnapshot = await categoryEntriesRef.get()
    if (categoryEntriesSnapshot.empty || !categoryEntriesSnapshot.docs) {
        return null
    }

    const categoryEntries: Record<string, CategoryEntry> = Object.fromEntries(
        categoryEntriesSnapshot.docs.map(doc => [doc.id, doc.data() as CategoryEntry]) 
    )

    return categoryEntries
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