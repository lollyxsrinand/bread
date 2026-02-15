import { getcookielikewtfbro } from "@/utils/get-user"
import { Budget } from "bread-core/src"

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

    const res = await fetch(`http://localhost:3001/budget/${budgetId}`, {
        headers: {
            'authorization': `Bearer ${token}`
        },
    })

    return await res.json() as Budget

}

export const getBudgetMonth = async (budgetId: string, month: string) => {
    const token = await getcookielikewtfbro()

    const res = await fetch(`http://localhost:3001/budgetMonth/${budgetId}/${month}`, {
        headers: {
            'authorization': `Bearer ${token}`
        },
    })

    const budgetMonth = await res.json()

    return budgetMonth
}