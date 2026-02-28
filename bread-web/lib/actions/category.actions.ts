'use server'
import { getcookielikewtfbro } from "@/utils/get-cookie"

export const getGroupedCategories = async (budgetId: string) => {
    const token = await getcookielikewtfbro()
    const res = await fetch(`http://localhost:3001/budgets/${budgetId}/categories`, {
        headers: {
            'authorization': `Bearer ${token}`
        },
    })

    if (!res.ok) {
        throw new Error('failed to fetch categories')
    }

    return await res.json() as any
}

export const assignToCategory = async (budgetId: string, categoryId: string, month: string, amount: number) => {
    const token = await getcookielikewtfbro()
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

    return await res.json()
}
