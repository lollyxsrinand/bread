import { Budget, Category, CategoryGroup, CategoryMonth, getNextMonthId, getPreviousMonthId, toMonthId } from "bread-core/src"
import { db, FieldValue } from "../firebase/server"
import { getBudget, getBudgetRef } from "./budget-service"

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

export const createCategoryMonth = async (userId: string, budgetId: string, categoryId: string, month: string) => {
    const categoryMonthId = `${categoryId}${month}`

    const ref = db
        .collection('users').doc(userId)
        .collection('budgets').doc(budgetId)
        .collection('categoryMonths').doc(categoryMonthId)
    
    const categoryMonth: CategoryMonth = {
        id: categoryMonthId,
        categoryId,
        month,
        budgeted: 0,
        activity: 0,
        available: 0,
        createdAt: Date.now(),
    }

    await ref.set(categoryMonth)

    return categoryMonth
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

    const categories: Record<string, Category> = Object.fromEntries(
        snapshot.docs.map(doc => [doc.id, doc.data() as Category])
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
    
    if (snapshot.empty) {
        throw new Error(`no category months found for month ${month}`)
    }

    const categoriesMonth: Record<string, CategoryMonth> = Object.fromEntries(
        snapshot.docs.map(doc => [doc.id, doc.data() as CategoryMonth])
    )

    return categoriesMonth
}

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

// apparently this should be done using db.runTransaction() to avoid any race conditions
export const assignToCategoryMonth = async (
    userId: string, 
    budgetId: string, 
    month: string, 
    categoryId: string, 
    amount: number
) => {
    if (categoryId === "readytoassign") {
        throw new Error("cannot assign to readytoassign")
    }

    const budgetRef = db.collection('users').doc(userId).collection('budgets').doc(budgetId)
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
    // probably return something useful
}

export const rolloverToNextMonth = async (userId: string, budgetId: string) => {
    const budget = await getBudget(userId, budgetId)
    const currentMonthId = budget.maxMonth
    const nextMonthId = getNextMonthId(currentMonthId)

    const currentCategoriesMonth = await getCategoriesMonth(userId, budgetId, currentMonthId)
    const rolloverCategoriesMonth: CategoryMonth[] = Object.values(currentCategoriesMonth).map((categoryMonth) => ({
        id: `${categoryMonth.categoryId}${nextMonthId}`,
        month: nextMonthId,
        categoryId: categoryMonth.categoryId,
        activity: 0,
        budgeted: 0,
        available: categoryMonth.available,
        createdAt: Date.now()
    }))

    const batch = db.batch()
    const budgetRef = db.collection('users').doc(userId).collection('budgets').doc(budgetId)

    rolloverCategoriesMonth.forEach((categoryMonth) => {
        const ref = budgetRef.collection('categoryMonths').doc(categoryMonth.id)
        batch.set(ref, categoryMonth)
    })

    batch.update(budgetRef, {maxMonth: nextMonthId})
    await batch.commit()

    return rolloverCategoriesMonth
}