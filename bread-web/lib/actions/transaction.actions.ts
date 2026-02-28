'use server'

import { getcookielikewtfbro } from "@/utils/get-cookie"
import { Transaction } from "bread-core/src"

export const getTransactions = async (budgetId: string) => {
    const token = await getcookielikewtfbro()

    const res = await fetch(`http://localhost:3001/budgets/${budgetId}/transactions`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    
    return await res.json()
}

export const createTransaction = async (budgetId: string, transaction: Partial<Transaction>) => {
    const token = await getcookielikewtfbro()

    const res = await fetch(`http://localhost:3001/budgets/${budgetId}/transactions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(transaction)
    })
    
    return await res.json()
}

export const deleteTransaction = async (budgetId: string, transactionId: string) => {
    const token = await getcookielikewtfbro()

    const res = await fetch(`http://localhost:3001/budgets/${budgetId}/transactions/${transactionId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    
    return await res.json()
}