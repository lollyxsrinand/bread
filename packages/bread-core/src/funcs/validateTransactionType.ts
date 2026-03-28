import {
    CreateCategoryTransactionInput,
    CreateIncomeTransactionInput,
    CreateTransactionInput,
    CreateTransferTransactionInput,
} from "../types";

export const validateCreateTransactionInput = (
    input: unknown
): CreateTransactionInput => {

    if (typeof input !== 'object' || input === null) {
        throw new Error('input must be an object')
    }

    const obj = input as Record<string, unknown>

    if (typeof obj.type !== 'string') {
        throw new Error('type is required')
    }

    if (typeof obj.accountId !== 'string') {
        throw new Error('accountId must be a string')
    }

    if (typeof obj.amount !== 'number' || Number.isNaN(obj.amount)) {
        throw new Error('amount must be a valid number')
    }

    if (typeof obj.date !== 'number') {
        throw new Error('date must be a number')
    }

    if (obj.note !== undefined && typeof obj.note !== 'string') {
        throw new Error('note must be a string')
    }

    if (obj.createdAt !== undefined && typeof obj.createdAt !== 'number') {
        throw new Error('createdAt must be a number')
    }

    const baseAllowed = ['type', 'accountId', 'amount', 'date', 'note', 'createdAt']

    switch (obj.type) {
        case 'category': {
            if (typeof obj.categoryId !== 'string') {
                throw new Error('categoryId is required')
            }

            const allowedKeys = [...baseAllowed, 'categoryId']

            for (const key of Object.keys(obj)) {
                if (!allowedKeys.includes(key)) {
                    throw new Error(`unexpected field: ${key}`)
                }
            }

            const result: CreateCategoryTransactionInput = {
                type: 'category',
                accountId: obj.accountId,
                categoryId: obj.categoryId,
                amount: obj.amount,
                date: obj.date,
                note: obj.note as string | undefined,
                createdAt: obj.createdAt as number | undefined,
            }

            return result
        }

        case 'income': {
            const allowedKeys = [...baseAllowed]

            for (const key of Object.keys(obj)) {
                if (!allowedKeys.includes(key)) {
                    throw new Error(`unexpected field: ${key}`)
                }
            }

            const result: CreateIncomeTransactionInput = {
                type: 'income',
                accountId: obj.accountId,
                amount: obj.amount,
                date: obj.date,
                note: obj.note as string | undefined,
                createdAt: obj.createdAt as number | undefined,
            }

            return result
        }

        case 'transfer': {
            if (typeof obj.toAccountId !== 'string') {
                throw new Error('toAccountId is required')
            }

            const allowedKeys = [...baseAllowed, 'toAccountId']

            for (const key of Object.keys(obj)) {
                if (!allowedKeys.includes(key)) {
                    throw new Error(`unexpected field: ${key}`)
                }
            }

            const result: CreateTransferTransactionInput = {
                type: 'transfer',
                accountId: obj.accountId,
                toAccountId: obj.toAccountId,
                amount: obj.amount,
                date: obj.date,
                note: obj.note as string | undefined,
                createdAt: obj.createdAt as number | undefined,
            }

            return result
        }

        default:
            throw new Error('invalid transaction type')
    }
}