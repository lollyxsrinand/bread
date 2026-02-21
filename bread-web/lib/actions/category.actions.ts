'use server'
import { getcookielikewtfbro } from "@/utils/get-user"

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