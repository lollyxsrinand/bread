import { db, FieldValue } from "../firebase/server"
import { getBudgetRef } from "./budget-service"
import { getCategoryMonthRef } from "./category-service"

export const createTransaction = async (
    userId: string,
    budgetId: string,
    accountId: string,
    toAccountId: string | null,
    categoryId: string | null,
    amount: number,
    date: Date
) => {
    const budgetRef = getBudgetRef(userId, budgetId)
    const txnRef = budgetRef.collection('transactions').doc()

    const batch = db.batch()

    if (amount === 0) {
        throw Error('amount cannot be 0 for a transaction')
    }

    if (toAccountId && categoryId)
        throw Error('transaction cannot have both toAccountId and categoryId')

    if (!toAccountId && !categoryId)
        throw Error('transaction must have either toAccountId or categoryId')



    if (toAccountId) {
        // amount always positive. it's subtracted from fromAccount and added to toAccount. 

        if (amount < 0) {
            throw Error('amount cannot be negative for account transfer transaction')
        }

        if (accountId === toAccountId) {
            throw Error('from and to accounts cannot be the same for account transfer transaction')
        }

        const fromAccountRef = budgetRef.collection('accounts').doc(accountId)
        const toAccountRef = budgetRef.collection('accounts').doc(toAccountId)

        batch.update(fromAccountRef, {
            balance: FieldValue.increment(-amount),
        })

        batch.update(toAccountRef, {
            balance: FieldValue.increment(amount),
        })
    } else if (categoryId) {
        // amount < 0 ? money going out of the account : money coming into the account
        const accountRef = budgetRef.collection('accounts').doc(accountId)
        const categoryMonthRef = getCategoryMonthRef(userId, budgetId, categoryId, date)


        batch.set(accountRef, {
            balance: FieldValue.increment(amount),
        }, { merge: true })

        batch.set(categoryMonthRef, {
            activity: FieldValue.increment(amount),
            available: FieldValue.increment(amount),
        }, { merge: true })
    }

    batch.set(txnRef, {
        id: txnRef.id,
        accountId,
        toAccountId,
        categoryId,
        amount,
        date: date.getTime(),
        createdAt: Date.now(),
    })

    await batch.commit()
    return txnRef.id
}

export const getTransactions = async (userId: string, budgetId: string) => {
    const snapshot = await db.collection('users').doc(userId).collection('budgets').doc(budgetId).collection('transactions').get()

    const transactions = [] as any
    snapshot.forEach((doc) => {
        transactions.push(doc.data())
    })

    return transactions
}

export const deleteTransaction = async (userId: string, budgetId: string, transactionId: string) => {
    const ref = db.collection('users').doc(userId).collection('budgets').doc(budgetId).collection('transactions').doc(transactionId)
    const snapshot = await ref.get()

    if (!snapshot.exists) {
        throw Error('transaction not found')
    }

    const { id, accountId, toAccountId, categoryId, amount, date, createdAt } = snapshot.data() as any
    console.log(id);
    console.log(accountId);
    console.log(toAccountId);
    console.log(categoryId);
    console.log(amount);
    console.log(date);

    const batch = db.batch()

    if (toAccountId) {
        // later do me this
    } else if (categoryId) {
        const accountRef = db.collection('users').doc(userId).collection('budgets').doc(budgetId).collection('accounts').doc(accountId)
        const categoryMonthRef = getCategoryMonthRef(userId, budgetId, categoryId, new Date(date))

        batch.set(accountRef, {
            balance: FieldValue.increment(-amount),
        }, { merge: true })

        batch.set(categoryMonthRef, {
            activity: FieldValue.increment(-amount),
            available: FieldValue.increment(-amount),
        }, { merge: true })

    }

    await ref.delete()
    await batch.commit()

}