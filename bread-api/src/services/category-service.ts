import { Category, CategoryEntry, CategoryGroup, getNextMonthId, magic } from "bread-core/src"
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

    const maxMonth = budget.maxMonth

    const categoryEntryForCurrMonth = await getCategoryEntryForMonth(userId, budgetId, categoryId, month)
    // const RTAEntryForCurrMonth = await getCategoryEntryForMonth(userId, budgetId, 'readytoassign', month)
    assert(categoryEntryForCurrMonth, "category entry missing. required for assigning value")
    // assert(RTAEntryForCurrMonth, "ready to assign entry for current month is missing. can't assign value")

    const months: string[] = []
    for (let m = getNextMonthId(month); m <= maxMonth; m = getNextMonthId(m)) {
        months.push(m)
    }

    const categoryEntriesForFutureMonths: Record<string, CategoryEntry> = Object.fromEntries(
        await Promise.all(
            months.map(async (m) => {
                const entry = await getCategoryEntryForMonth(userId, budgetId, categoryId, m)
                assert(entry, "category entry missing. required for assigning value")
                return [m, entry] as const
            })
        )
    )

    // const rtaEntriesForFutureMonths: Record<string, CategoryEntry> = Object.fromEntries(
    //     await Promise.all(
    //         months.map(async (m) => {
    //             const entry = await getCategoryEntryForMonth(userId, budgetId, 'readytoassign', m)
    //             assert(entry, "ready to assign entry missing. required for assigning value")
    //             return [m, entry] as const
    //         })
    //     )
    // )

    // RTAEntryForCurrMonth.available = RTAEntryForCurrMonth.available + categoryEntryForCurrMonth.assigned
    // RTAEntryForCurrMonth.available = RTAEntryForCurrMonth.available - amount

    const globalReadyToAssign = budget.globalReadyToAssign
    const delta = amount - categoryEntryForCurrMonth.assigned
    globalReadyToAssign.assigned += delta

    categoryEntryForCurrMonth.assigned = amount
    categoryEntryForCurrMonth.available = categoryEntryForCurrMonth.assigned - categoryEntryForCurrMonth.activity

    const updatedCategoryEntries = magic(categoryEntryForCurrMonth, categoryEntriesForFutureMonths)
    const allUpdatedCategoryEntries = { [month]: categoryEntryForCurrMonth, ...updatedCategoryEntries }

    // const updatedRTAEntries = magic(RTAEntryForCurrMonth, rtaEntriesForFutureMonths)
    // const allUpdatedRTAEntries = { [month]: RTAEntryForCurrMonth, ...updatedRTAEntries}

    const batch = db.batch()

    for (const m in allUpdatedCategoryEntries) {
        const entry = allUpdatedCategoryEntries[m]
        const ref = getMonthlyCategoryEntriesRef(userId, budgetId).doc(m).collection('category-entries').doc(categoryId)

        batch.set(ref, entry)
    }

    // for (const m in allUpdatedRTAEntries) {
    //     const entry = allUpdatedRTAEntries[m]
    //     const ref = getMonthlyCategoryEntriesRef(userId, budgetId).doc(m).collection('category-entries').doc('readytoassign')

    //     batch.set(ref, entry)
    // }

    batch.set(db.collection('users').doc(userId).collection('budgets').doc(budgetId), budget, { merge: true})

    await batch.commit()

    return { changed_entities: [categoryEntryForCurrMonth, updatedCategoryEntries, budget] }
}

/* rewrite this */
export const rolloverToNextMonth = async (userId: string, budgetId: string) => {
    const budget = await getBudget(userId, budgetId)
    assert(budget, "budget doesn't exist")

    const maxMonth = budget.maxMonth
    const nextMonth = getNextMonthId(maxMonth)

    const categories = await getCategories(userId, budgetId)
    assert(categories, "no categories available to rollover")

    for (const categoryId in categories) {
        await createCategoryEntry(userId, budgetId, categoryId, nextMonth)
    }

    budget.maxMonth = nextMonth
    const budgetRef = db.collection('users').doc(userId).collection('budgets').doc(budgetId)
    await budgetRef.set(budget, { merge: true })
}