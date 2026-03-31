import { Category, CategoryEntry, CategoryGroup, getNextMonthId, __cascadeComputeCategoryEntries__, MonthSummary, CascadeComputeCategoryEntriesResult, MonthId, AssignToCategoryResult, getCurrentMonthId } from "bread-core/src"
import { db } from "../firebase/server"
import { getBudget, getBudgetRef } from "./budget-service"
import assert from "assert"

// path -> entity name as in dtype
// monthly-category-entries -> MonthlyCategoryEntries
// monthly-category-entries/{month}/category-entries -> CategoryEntries (CategoryEntry[])
// monthly-category-entries/{month}/category-entries/{category-entry} -> CategoryEntry

export const getCategory = async (userId: string, budgetId: string, categoryId: string) => {
    const categoryRef = db
        .collection('users').doc(userId)
        .collection('budgets').doc(budgetId)
        .collection('categories').doc(categoryId)

    const snapshot = await categoryRef.get()

    if (!snapshot.exists || !snapshot.data()) {
        return null
    }

    return snapshot.data() as Category
}

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
        available: 0,
        overspent: 0
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

    if (snapshot.empty || !snapshot.docs) {
        return null
    }

    const categories: Record<string, Category> = Object.fromEntries(
        snapshot.docs.map(doc => [doc.id, doc.data() as Category])
    )

    return categories
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

export const getMonthlyCategoryEntriesRef = (userId: string, budgetId: string) => {
    return db.collection('users').doc(userId).collection('budgets').doc(budgetId).collection('monthly-category-entries')
}

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

    if (!snapshot.exists || !snapshot.data()) {
        return null
    }

    return snapshot.data() as CategoryEntry
}

/**
 * creates empty month entries from given month...maxMonth
 * stops creation when an entry is found 
 */
export const fixMyEntriesPls = async (
    userId: string,
    budgetId: string,
    categoryId: string,
    month: MonthId,
    maxMonth: MonthId,
) => {
    const monthlyCategoryEntriesRef = getMonthlyCategoryEntriesRef(userId, budgetId)

    const batch = db.batch()

    for (let m = month; m <= maxMonth; m = getNextMonthId(m)) {
        const entryRef = monthlyCategoryEntriesRef.doc(m)
            .collection('category-entries').doc(categoryId)

        const snapshot = await entryRef.get()

        if (snapshot.exists)
            break

        const categoryEntry: CategoryEntry = {
            id: categoryId,
            month: m,
            assigned: 0,
            activity: 0,
            available: 0,
            createdAt: Date.now(),
        }

        batch.set(entryRef, categoryEntry)
    }

    await batch.commit()
}

export const assignToCategory = async (
    userId: string,
    budgetId: string,
    month: string,
    categoryId: string,
    amount: number
): Promise<AssignToCategoryResult> => {
    const budget = await getBudget(userId, budgetId)
    assert(budget, "budget does not exist")

    const category = await getCategory(userId, budgetId, categoryId)
    assert(category, "category does not exist")

    await fixMyEntriesPls(userId, budgetId, categoryId, month, budget.maxMonth)

    const monthlyCategoryEntriesRef = getMonthlyCategoryEntriesRef(userId, budgetId)
    const categoryEntry = await getCategoryEntryForMonth(userId, budgetId, categoryId, month)
    assert(categoryEntry, "category entry does not exist. it must bro it must")


    const delta = amount - categoryEntry.assigned

    budget.totalAssigned += delta

    categoryEntry.assigned += delta
    categoryEntry.available += delta

    const batch = db.batch()

    batch.update(monthlyCategoryEntriesRef.doc(month).collection('category-entries').doc(categoryId), {
        assigned: categoryEntry.assigned,
        available: categoryEntry.available
    })

    const res = await cascadeComputeCategoryEntries(userId, budgetId, categoryEntry, budget.maxMonth, batch)

    const budgetRef = getBudgetRef(userId, budgetId)

    batch.update(budgetRef, {
        totalAssigned: budget.totalAssigned
    })

    await batch.commit()

    return {
        ...res,
        updatedBudget: {
            id: budget.id,
            totalAssigned: budget.totalAssigned
        }
    }
}

export const getMonthSummary = async (userId: string, budgetId: string, month: string) => {
    const snapshot = await db
        .collection('users').doc(userId)
        .collection('budgets').doc(budgetId)
        .collection('monthly-category-entries').doc(month)
        .get()

    if (!snapshot.exists || !snapshot.data()) {
        return null
    }

    return snapshot.data() as MonthSummary
}

/**
 * - fetches all the category entries from `categoryEntry.month` to `maxMonth`
 * - cascade updates the available to maxMonth
 * @returns all the updated category entries mapped by month
 */
export const cascadeComputeCategoryEntries = async (
    userId: string,
    budgetId: string,
    categoryEntry: CategoryEntry,
    maxMonth: string,
    batch: FirebaseFirestore.WriteBatch
): Promise<CascadeComputeCategoryEntriesResult> => {
    const categoryId = categoryEntry.id

    // generate months [(m+1)...maxMonth]
    const months = []
    for (let month = getNextMonthId(categoryEntry.month); month <= maxMonth; month = getNextMonthId(month)) {
        months.push(month)
    }

    // fetch the category entries starting from month to maxMonth
    const categoryEntries: Record<MonthId, CategoryEntry> = Object.fromEntries(
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
    categoryEntries[categoryEntry.month] = categoryEntry // also include the current month entry which is being updated

    // update all the available values 
    const result = __cascadeComputeCategoryEntries__(categoryEntries)
    const updatedCategoryEntries = result.updatedCategoryEntries

    // store the updated available back to db
    for (const entryId in updatedCategoryEntries) {
        const entry = updatedCategoryEntries[entryId]

        const entryRef = getMonthlyCategoryEntriesRef(userId, budgetId).doc(entry.month)
            .collection('category-entries').doc(entry.id)

        batch.update(entryRef, { available: entry.available })
    }

    return result
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

    batch.set(db
        .collection('users').doc(userId)
        .collection('budgets').doc(budgetId)
        .collection('monthly-category-entries').doc(nextMonth),
        {
            income: 0,
            assigned: 0,
            available: 0,
            overspent: 0
        }

    )

    await batch.commit()
}

// i don't trust my code come back later someday to fix it
export const renameCategory = async (userId: string, budgetId: string, categoryId:string, newName: string) => {
    const categoryRef = db
        .collection('users').doc(userId)
        .collection('budgets').doc(budgetId)
        .collection('categories').doc(categoryId)
    
    const category = await getCategory(userId, budgetId, categoryId)
    assert(category, "category doesn't exist")

    category.name = newName
    await categoryRef.update({ name: newName })

    return category
}

export const getCategoryGroup = async (userId: string, budgetId: string, categoryGroupId: string) => {
    const categoryGroupRef = db
        .collection('users').doc(userId)
        .collection('budgets').doc(budgetId)
        .collection('categoryGroups').doc(categoryGroupId)

    const snapshot = await categoryGroupRef.get()

    if (!snapshot.exists || !snapshot.data()) {
        return null
    }

    return snapshot.data() as CategoryGroup
}

export const renameCategoryGroup = async (userId: string, budgetId: string, categoryGroupId:string, newName: string) => {
    const categoryRef = db
        .collection('users').doc(userId)
        .collection('budgets').doc(budgetId)
        .collection('categoryGroups').doc(categoryGroupId)
    
    const categoryGroup = await getCategoryGroup(userId, budgetId, categoryGroupId)
    assert(categoryGroup, "category doesn't exist")

    categoryGroup.name = newName
    await categoryRef.update({ name: newName })

    return categoryGroup
}