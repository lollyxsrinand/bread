import { db, FieldValue } from "../firebase/server"
import { getBudgetRef } from "./budget-service"
import { getCategoryMonthRef } from "./category-service"

export const createTransaction = async (userId: string, budgetId: string, categoryId: string, amount: number, date: Date) => {
    const budgetRef = getBudgetRef(userId, budgetId)
    const txnRef = budgetRef.collection('transactions').doc()
    const categoryMonthRef = getCategoryMonthRef(userId, budgetId, categoryId, date)

    const batch = db.batch()

    batch.set(txnRef, {
        id: txnRef.id,
        categoryId,
        amount,
        date,
        createdAt: new Date(),
    })
    batch.update(categoryMonthRef, {
        activity: FieldValue.increment(amount),
        available: FieldValue.increment(amount),
    })

    await batch.commit()
}