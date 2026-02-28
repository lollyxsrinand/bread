import { getcookielikewtfbro } from "@/utils/get-cookie"
import { Budget, MonthlyBudgetView } from "bread-core/src"

export const getBudgets = async () => {
    const token = await getcookielikewtfbro()

    const res = await fetch(`http://localhost:3001/budgets`, {
        headers: {
            'authorization': `Bearer ${token}`
        },
    })

    const budgets = await res.json()

    return budgets
}

export const getBudget = async (budgetId: string) => {
    const token = await getcookielikewtfbro()

    const res = await fetch(`http://localhost:3001/budgets/${budgetId}`, {
        headers: {
            'authorization': `Bearer ${token}`
        },
    })

    return await res.json() as Budget

}

export const getMonthlyBudget = async (budgetId: string, month: string) => {
    const token = await getcookielikewtfbro()

    const res = await fetch(`http://localhost:3001/budgets/${budgetId}/months/${month}`, {
        headers: {
            'authorization': `Bearer ${token}`
        },
    })
    
    if (!res.ok) {
        throw new Error(`failed to fetch monthly budget: ${res.status}`)
    }

    return await res.json()
}