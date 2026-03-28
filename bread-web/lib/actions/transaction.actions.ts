'use server'

import { getToken } from "@/utils/get-cookie"
import { CreateTransactionInput, DeleteTransactionResult, Transaction, TransactionResult } from "bread-core/src"

export const getTransactions = async (budgetId: string) => {
    const token = await getToken()
    
    const res = await fetch(`http://localhost:3001/budgets/${budgetId}/transactions`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    
    return await res.json() as Record<string, Transaction>
}

export const createTransaction = async (budgetId: string, data: CreateTransactionInput) => {
    const token = await getToken()

    const res = await fetch(`http://localhost:3001/budgets/${budgetId}/transactions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    })
    if (!res.ok) {
        throw new Error('Failed to create transaction')
    }
    
    return await res.json() as TransactionResult
}

export const deleteTransaction = async (budgetId: string, transactionId: string) => {
    const token = await getToken()

    const res = await fetch(`http://localhost:3001/budgets/${budgetId}/transactions/${transactionId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    
    return await res.json() as DeleteTransactionResult
}
