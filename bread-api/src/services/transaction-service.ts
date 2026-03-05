import { toMonthId, Transaction } from "bread-core/src"
import { db, FieldValue } from "../firebase/server"
import { getAccount } from "./account-service"
import { getBudgetRef } from "./budget-service"

export const createTransaction = async (
    userId: string,
    budgetId: string,
    accountId: string,
    transferAccountId: string | null,
    categoryId: string | null,
    amount: number,
    date: Date
) => {
    const budgetRef = db.collection('users').doc(userId).collection('budgets').doc(budgetId)
    const budgetSnapshot = await budgetRef.get()

    if (!budgetSnapshot.exists) {
        throw Error('budget not found')
    }

    const txnRef = budgetRef.collection('transactions').doc()

    const batch = db.batch()

    // can i xor this? 
    if (transferAccountId && categoryId)
        throw Error('transaction cannot have both transferAccountId and categoryId')

    if (!transferAccountId && !categoryId)
        throw Error('transaction must have either transferAccountId or categoryId')


    /**
     *  case: category transaction
     *  inflow/outflow is relative to both the account and the category
     *      an inflow -> +ve amount. means money comes into both account and category entry
     *      an outflow -> -ve amount, means money goes out of both account and category entry
     *  in case of ready to assign category it gets weird when there is an outflow -> -ve amount. because ready to assign is basically an inflow category. used for income
     *  can't have a -ve income, straight up weird. but we'll allow that
     *  inflow/outflow: 
     *      account.bal = account.bal + amount
     *      categoryEntry.activity = categoryEntry.activity + amount
     *      categoryEntry.available = categoryEntry.available + amount
     * 
     *  case: transfer(account, transferAccount)
     *  inflow/outflow is relative to only from account for a transaction
     *      an inflow -> +ve amount means money comes into the account and flows out of the transfer account so amount is tranferred "from" the transfer account
     *      so if amount is +ve, effectively swap to and from accounts and proceed normally
     *      an outflow (makes the mose sense) -> -ve amount means money goes out of the account and flows into the transfer account
     *  so for inflow: swap to and from
     *  then proceed with an outflow
     *  intflow: transfer Account becomes `fromAccount`, account passed in args becomes `toAccount`
     *  inflow is stupidly weird, so we'll go with only outflow for a transfer
     *  outflow:
     *      fromAccount.bal = fromAccount.bal + amount (value decrements as amount is -ve)
     *      toAccount.bal = toAccount.bal - amount (value increments as amount is -ve)
     */

    if (transferAccountId) {
        if (amount > 0) {
            throw Error("amount should be negative")
        }
        if (accountId === transferAccountId) {
            throw Error('can\'t make a transfer between the same accounts')
        }
        const fromAccountRef = budgetRef.collection('accounts').doc(accountId)
        const toAccountRef = budgetRef.collection('accounts').doc(transferAccountId)

        batch.update(fromAccountRef, {
            balance: FieldValue.increment(amount),
        })

        batch.update(toAccountRef, {
            balance: FieldValue.increment(-amount),
        })
    } else if (categoryId) {
        const accountRef = budgetRef.collection('accounts').doc(accountId)
        const categoryEntryRef = db.collection('users').doc(userId).collection('budgets').doc(budgetId).collection('monthly-category-entries').doc(toMonthId(new Date(date))).collection('category-entries').doc(categoryId)

        batch.set(accountRef, {
            balance: FieldValue.increment(amount),
        }, { merge: true })

        batch.set(categoryEntryRef, {
            activity: FieldValue.increment(amount),
            available: FieldValue.increment(amount),
        }, { merge: true })
    }

    const transaction: Transaction = {
        id: txnRef.id,
        accountId,
        transferAccountId,
        categoryId,
        amount,
        date: Date.now(),
        createdAt: FieldValue.serverTimestamp()
    }

    batch.set(txnRef, transaction)

    await batch.commit()

    const account = await getAccount(userId, budgetId, accountId)
    const toAccount = transferAccountId ? await getAccount(userId, budgetId, transferAccountId) : null
    return {
        transaction,
        updatedAccounts: [
            ...(account ? [{ id: account.id, balance: account.balance }] : []),
            ...(toAccount ? [{ id: toAccount.id, balance: toAccount.balance }] : [])
        ]
    }
}

export const getTransactions = async (userId: string, budgetId: string) => {
    const snapshot = await db.collection('users').doc(userId).collection('budgets').doc(budgetId).collection('transactions').get()

    const transactions: Transaction[] = []
    snapshot.forEach((doc) => {
        transactions.push(doc.data() as Transaction /* we need zod schema here */)
    })

    return transactions
}

export const deleteTransaction = async (userId: string, budgetId: string, transactionId: string) => {
    const budgetRef = getBudgetRef(userId, budgetId)
    const ref = budgetRef.collection('transactions').doc(transactionId)
    const snapshot = await ref.get()

    if (!snapshot.exists) {
        throw Error('transaction not found')
    }

    const { accountId, transferAccountId, categoryId, amount, date } = snapshot.data() as Transaction

    const batch = db.batch()

    if (transferAccountId) {
        const fromAccountRef = budgetRef.collection('accounts').doc(accountId)
        const toAccountRef = budgetRef.collection('accounts').doc(transferAccountId)

        batch.update(fromAccountRef, {
            balance: FieldValue.increment(-amount),
        })

        batch.update(toAccountRef, {
            balance: FieldValue.increment(amount),
        })
    } else if (categoryId) {
        const accountRef = budgetRef.collection('accounts').doc(accountId)
        // const categoryMonthRef = getCategoriesMonthRef(userId, budgetId, categoryId)
        // const categoryMonthRef = getCategoriesMonthRef(userId, budgetId, toMonthId(new Date(date))).doc(categoryId)
        const categoryEntryRef = db.collection('users').doc(userId).collection('budgets').doc(budgetId).collection('monthly-category-entries').doc(toMonthId(new Date(date))).collection('category-entries').doc(categoryId)

        batch.set(accountRef, {
            balance: FieldValue.increment(-amount),
        }, { merge: true })

        batch.set(categoryEntryRef , {
            activity: FieldValue.increment(-amount),
            available: FieldValue.increment(-amount),
        }, { merge: true })

    }

    batch.delete(ref)
    await batch.commit()
}