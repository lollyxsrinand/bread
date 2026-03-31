'use server'
import { getToken } from "@/utils/get-cookie"
import { AssignToCategoryResult, Category, CategoryEntry, CategoryGroup, MonthSummary } from "bread-core/src"

export const getCategories = async (budgetId: string) => {
    const token = await getToken()
    const res = await fetch(`http://localhost:3001/budgets/${budgetId}/categories`, {
        headers: {
            'authorization': `Bearer ${token}`
        },
    })

    if (!res.ok) {
        throw new Error('failed to fetch categories')
    }

    return await res.json() as Record<string, Category>
}

export const getCategoryGroups = async (budgetId: string) => {
    const token = await getToken()
    const res = await fetch(`http://localhost:3001/budgets/${budgetId}/categoryGroups`, {
        headers: {
            'authorization': `Bearer ${token}`
        },
    })

    if (!res.ok) {
        throw new Error('failed to fetch categories')
    }

    return await res.json() as Record<string, CategoryGroup>
}

export const getCategoryEntries = async (budgetId: string, month: string) => {
    const token = await getToken()
    console.log("fuck man")
    const res = await fetch(`http://localhost:3001/budgets/${budgetId}/category-entries/${month}`, {
        headers: {
            'authorization': `Bearer ${token}`
        },
    })

    if (!res.ok) {
        throw new Error('failed to fetch categories')
    }

    return await res.json() as Record<string, CategoryEntry>
}

export const getMonthSummary = async (budgetId: string, month: string) => {
    const token = await getToken()
    const res = await fetch(`http://localhost:3001/budgets/${budgetId}/summary/${month}`, {
        headers: {
            'authorization': `Bearer ${token}`
        },
    })

    if (!res.ok) {
        throw new Error('failed to fetch categories')
    }

    return await res.json() as MonthSummary
}

export const assignToCategory = async (budgetId: string, categoryId: string, month: string, amount: number) => {
    const token = await getToken()
    const res = await fetch(`http://localhost:3001/budgets/${budgetId}/months/${month}/categories/${categoryId}/assign`, {
        method: 'POST',
        headers: {
            'authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount })
    })

    if (!res.ok) {
        throw new Error('failed to assign transaction to category')
    }

    return await res.json() as AssignToCategoryResult
}

export const rolloverToNextMonth = async (budgetId: string) => {
    const token = await getToken()
    const res = await fetch(`http://localhost:3001/budgets/${budgetId}/rollover`, {
        method: 'POST',
        headers: {
            'authorization': `Bearer ${token}`,
        },
    })

    if (!res.ok) {
        throw new Error('failed to rollover to next month')
    }

    return await res.json()
}

export const createCategory = async (budgetId: string, name: string, groupId: string) => {
    const token = await getToken()
    const res = await fetch(`http://localhost:3001/budgets/${budgetId}/categories`, {
        method: 'POST',
        headers: {
            'authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, groupId })
    })

    if (!res.ok) {
        throw new Error('failed to create category')
    }

    return await res.json() as Category
}

export const renameCategoryGroup = async (budgetId: string, groupId: string, newName: string) => {
    const token = await getToken()
    const res = await fetch(`http://localhost:3001/budgets/${budgetId}/categoryGroups/${groupId}/rename`, {
        method: 'PATCH',
        headers: {
            'authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newName })
    })

    if (!res.ok) {
        throw new Error('failed to rename category group')
    }

    return await res.json() as CategoryGroup
}

export const renameCategory = async (budgetId: string, categoryId: string, newName: string) => {
    const token = await getToken()
    const res = await fetch(`http://localhost:3001/budgets/${budgetId}/categories/${categoryId}/rename`, {
        method: 'PATCH',
        headers: {
            'authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newName })
    })

    if (!res.ok) {
        throw new Error('failed to rename category')
    }

    return await res.json() as Category
}