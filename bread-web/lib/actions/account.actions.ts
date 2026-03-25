'use server'
import { getToken } from "@/utils/get-cookie"
import { Account, CreateAccountResult } from "bread-core/src"

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

    return await res.json() as CreateAccountResult
}

export const updateAccount = async (budgetId: string, accountId: string, data: {name: string, type: string }) => {
    const token = await getToken()
    const res = await fetch(`http://localhost:3001/budgets/${budgetId}/accounts/${accountId}`, {
        method: 'PATCH',
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

export const closeAccount = async (budgetId: string, accountId: string) => {
    const token = await getToken()
    const res = await fetch(`http://localhost:3001/budgets/${budgetId}/accounts/${accountId}/close`, {
        method: 'PATCH',
        headers: {
            'authorization': `Bearer ${token}`,
        },
    })

    if (!res.ok) {
        throw new Error('failed to close account')
    }

    return await res.json() as Account
}

