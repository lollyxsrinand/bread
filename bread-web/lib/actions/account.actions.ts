'use server'
import { getToken } from "@/utils/get-cookie"
import { Account } from "bread-core/src"

export const getAccounts = async (budgetId: string) => {
    const token = await getToken()
    const res = await fetch(`http://localhost:3001/budgets/${budgetId}/accounts`, {
        headers: {
            'authorization': `Bearer ${token}`
        },
    })

    if (!res.ok) {
        throw new Error('Failed to fetch accounts')
    }

    return await res.json() as Record<string, Account>
}

export const createAccount = async (budgetId: string, data: {name: string, type: string, balance: number}) => {
    const token = await getToken()
    const res = await fetch(`http://localhost:3001/budgets/${budgetId}/accounts`, {
        method: 'POST',
        headers: {
            'authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })

    if (!res.ok) {
        throw new Error('failed to create account')
    }

    return await res.json() as Account
}