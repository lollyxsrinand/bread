import { toMonthId } from "bread-core/src"
import { db, FieldValue } from "../firebase/server"
import { getBudgetRef } from "./budget-service"

/**
 * @returns `categoryGroupRef.id` of the created category group
 */
export const createCategoryGroup = async (userId: string, budgetId: string, categoryGroupName: string) => {
    const categoryGroupRef = db
        .collection('users').doc(userId) // users/{userId}
        .collection('budgets').doc(budgetId) // users/{userId}/budgets/{budgetId}
        .collection('categoryGroups').doc() // users/{userId}/budgets/{budgetId}/categoryGroups/{categoryGroupId} holy.

    await categoryGroupRef.set({
        id: categoryGroupRef.id,
        name: categoryGroupName,
        createdAt: new Date(),
    })

    return categoryGroupRef.id
}

/** 
 * @returns `categoryId` of the created category
 */
export const createCategory = async (userId: string, budgetId: string, categoryGroupId: string, categoryName: string, isSystem: boolean = false, id?: string) => {
    const categoriesRef = db
        .collection('users').doc(userId) // users/{userId}
        .collection('budgets').doc(budgetId) // users/{userId}/budgets/{budgetId}
        .collection('categories') // users/{userId}/budgets/{budgetId}/categories/{categoryId} holy.

    const categoryRef = id ? categoriesRef.doc(id) : categoriesRef.doc()

    await categoryRef.set({
        id: categoryRef.id,
        name: categoryName,
        categoryGroupId: categoryGroupId,
        isSystem,
        createdAt: new Date(),
    })

    return categoryRef.id
}

export const createCategoryMonth = async (userId: string, budgetId: string, categoryId: string, month: string) => {
    const categoryMonthId = `${categoryId}${month}`

    const ref = db
        .collection('users').doc(userId)
        .collection('budgets').doc(budgetId)
        .collection('categoryMonths').doc(categoryMonthId)

    await ref.set({
        id: categoryMonthId,
        categoryId,
        month,
        budgeted: 0,
        activity: 0,
        available: 0,
        createdAt: new Date(),
    })

    return ref.id
}

export const getCategoryMonthRef = (userId: string, budgetId: string, categoryId: string, date: Date) => {
    return db
        .collection('users').doc(userId)
        .collection('budgets').doc(budgetId)
        .collection('categoryMonths').doc(`${categoryId}${toMonthId(date)}`)
}

export const getCategories = async (userId: string, budgetId: string) => {
    const snapshot = await db
        .collection('users').doc(userId)
        .collection('budgets').doc(budgetId)
        .collection('categories').get()

    const categories: Record<string, any> = Object.fromEntries(
        snapshot.docs.map(doc => [doc.id, doc.data()])
    )

    return categories
}

export const getCategoriesMonth = async (userId: string, budgetId: string, month: string) => {
    const snapshot = await db
        .collection('users').doc(userId)
        .collection('budgets').doc(budgetId)
        .collection('categoryMonths')
        .where('month', '==', month)
        .get()

    const categoriesMonth: Record<string, any> = Object.fromEntries(
        snapshot.docs.map(doc => [doc.id, doc.data()])
    )

    return categoriesMonth
}

export const getCategoryGroups = async (userId: string, budgetId: string) => {
    const snapshot = await db
        .collection('users').doc(userId)
        .collection('budgets').doc(budgetId)
        .collection('categoryGroups')
        .get()

    const categoryGroups: Record<string, any> = Object.fromEntries(
        snapshot.docs.map(doc => [doc.id, doc.data()])
    )

    return categoryGroups
}

// TODO: apparently this should be done using db.runTransaction() to avoid "race conditions"
export const assignToCategoryMonth = async (userId: string, budgetId: string, month: string, categoryId: string, amount: number) => {
    if (categoryId === "readytoassign") {
        throw new Error("cannot assign to readytoassign")
    }

    const budgetRef = getBudgetRef(userId, budgetId)

    const readyToAssignMonthRef = budgetRef.collection("categoryMonths").doc(`readytoassign${month}`)

    const categoryMonthRef = budgetRef.collection("categoryMonths").doc(`${categoryId}${month}`)

    const [rtaSnap, categorySnap] = await Promise.all([
        readyToAssignMonthRef.get(),
        categoryMonthRef.get(),
    ])

    if (!rtaSnap.exists) {
        throw new Error("readytoassign month not found")
    }

    if (!categorySnap.exists || !categorySnap.data()) {
        throw new Error("category month not found")
    }

    const batch = db.batch()

    const delta = amount - categorySnap.data()!.budgeted

    batch.update(readyToAssignMonthRef, {
        available: FieldValue.increment(-delta),
    })

    batch.update(categoryMonthRef, {
        available: FieldValue.increment(delta),
        budgeted: FieldValue.increment(delta),
    })

    await batch.commit()
}