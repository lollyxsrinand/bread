import { Category, CategoryEntry, CategoryGroup, getNextMonthId, magic, MonthSummary } from "bread-core/src"
import { db } from "../firebase/server"
import { getBudget } from "./budget-service"
import assert from "assert"

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

export const createEmptyMonthSummary = async (userId: string, budgetId: string, month: string) => {
    const ref = db
        .collection('users').doc(userId)
        .collection('budgets').doc(budgetId)
        .collection('monthly-category-entries').doc(month)
    
    const monthSummary: MonthSummary = {
        income: 0,
        assigned: 0, 
    }

    await ref.create(monthSummary)
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

export const getMonthlyCategoryEntriesRef = (userId: string, budgetId: string) => db.collection('users').doc(userId).collection('budgets').doc(budgetId).collection('monthly-category-entries')

/**
 * gets all the category entries in `month` as a map
 * @returns 
 */
export const getAllCategoryEntriesForMonth = async (userId: string, budgetId: string, month: string) => {
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

export const getCategoryEntryForMonth = async (userId: string, budgetId: string, categoryId: string, month: string) => {
    const monthlyCategoryEntriesRef = getMonthlyCategoryEntriesRef(userId, budgetId)
    const snapshot = await monthlyCategoryEntriesRef.doc(month)
        .collection('category-entries').doc(categoryId)
        .get()

    if (!snapshot.exists || !snapshot.data) {
        return null
    }

    return snapshot.data() as CategoryEntry
}

export const assignToCategory = async (
    userId: string,
    budgetId: string,
    month: string,
    categoryId: string,
    amount: number
) => {
    const budget = await getBudget(userId, budgetId)
    assert(budget, "budget does not exist")

    const categoryEntry = await getCategoryEntryForMonth(userId, budgetId, categoryId, month)
    assert(categoryEntry, "category entry missing")

    const delta = amount - categoryEntry.assigned

    budget.globalReadyToAssign.assigned += delta

    categoryEntry.assigned = amount
    categoryEntry.available =
        categoryEntry.assigned - categoryEntry.activity

    await cascadeComputeCategoryEntries(userId, budgetId, categoryEntry)

    const budgetRef = db
        .collection("users")
        .doc(userId)
        .collection("budgets")
        .doc(budgetId)

    await budgetRef.set(budget, { merge: true })

    return { changed_entities: [categoryEntry, budget] }
}

export const cascadeComputeCategoryEntries = async (
    userId: string,
    budgetId: string,
    categoryEntry: CategoryEntry
) => {
    const budget = await getBudget(userId, budgetId)
    assert(budget, "budget must exist for cascade computing entries")

    const categoryId = categoryEntry.id
    const month = categoryEntry.month
    const maxMonth = budget.maxMonth

    const months = []
    for (let m = getNextMonthId(month); m <= maxMonth; m = getNextMonthId(m)) {
        months.push(m)
    }

    const categoryEntriesForFutureMonths: Record<string, CategoryEntry> =
        Object.fromEntries(
            await Promise.all(
                months.map(async (m) => {
                    const entry = await getCategoryEntryForMonth(
                        userId,
                        budgetId,
                        categoryId,
                        m
                    )
                    assert(entry, "category entry missing")
                    return [m, entry] as const
                })
            )
        )

    const updatedCategoryEntries = magic(categoryEntry, categoryEntriesForFutureMonths)

    const allUpdatedCategoryEntries = {
        [month]: categoryEntry,
        ...updatedCategoryEntries
    }

    const batch = db.batch()
    const monthlyRef = getMonthlyCategoryEntriesRef(userId, budgetId)

    for (const entry of Object.values(allUpdatedCategoryEntries)) {
        const ref = monthlyRef
            .doc(entry.month)
            .collection("category-entries")
            .doc(entry.id)

        batch.set(ref, entry)
    }

    await batch.commit()
}

export const rolloverToNextMonth = async (
    userId: string,
    budgetId: string
) => {
    const [budget, categories] = await Promise.all([
        getBudget(userId, budgetId),
        getCategories(userId, budgetId)
    ])

    assert(budget, "budget doesn't exist")
    assert(categories, "categories must exist for rollover")

    const currentMonth = budget.maxMonth
    const nextMonth = getNextMonthId(currentMonth)

    const currentEntries = await getAllCategoryEntriesForMonth(
        userId,
        budgetId,
        currentMonth
    )

    assert(currentEntries, "category entries must exist")

    const batch = db.batch()
    const monthlyRef = getMonthlyCategoryEntriesRef(userId, budgetId)

    for (const entry of Object.values(currentEntries)) {
        const nextEntry: CategoryEntry = {
            id: entry.id,
            month: nextMonth,
            assigned: 0,
            activity: 0,
            available: entry.available
        }

        const ref = monthlyRef
            .doc(nextMonth)
            .collection("category-entries")
            .doc(entry.id)

        batch.set(ref, nextEntry)
    }

    const budgetRef = db
        .collection("users")
        .doc(userId)
        .collection("budgets")
        .doc(budgetId)

    batch.set(
        budgetRef,
        { maxMonth: nextMonth },
        { merge: true }
    )

    await batch.commit()
}