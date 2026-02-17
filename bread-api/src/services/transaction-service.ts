import { db, FieldValue } from "../firebase/server"
import { getBudgetRef } from "./budget-service"

export const createTransaction = async (
    userId: string,
    budgetId: string,
    accountId: string,
    categoryId: string | null,
    amount: number,
    type: 'inflow' | 'outflow',
    date: Date
) => {
    const budgetRef = getBudgetRef(userId, budgetId)
    const txnRef = budgetRef.collection('transactions').doc()
    const accountRef = budgetRef.collection('accounts').doc(accountId)

    const batch = db.batch()

    batch.set(txnRef, {
        id: txnRef.id,
        accountId,
        categoryId,
        amount,
        date: date.getTime(),
        createdAt: Date.now(),
    })

    batch.update(accountRef, {
        balance: FieldValue.increment(amount)
    })


}