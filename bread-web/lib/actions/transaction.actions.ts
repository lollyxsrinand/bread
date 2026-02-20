'use server'

import { getcookielikewtfbro } from "@/utils/get-user"

export const getTransactions = async (budgetId: string) => {
    const token = await getcookielikewtfbro()

    const res = await fetch(`http://localhost:3001/budgets/${budgetId}/transactions`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    
    return await res.json()
}