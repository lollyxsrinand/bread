import { toMonthId, Transaction } from "bread-core/src"
import { db, FieldValue } from "../firebase/server"
import { getAccount } from "./account-service"
import { getBudget, getBudgetRef } from "./budget-service"
import { cascadeComputeCategoryEntries, getCategoryEntryForMonth, getMonthlyCategoryEntriesRef } from "./category-service"
import assert from "assert"

export const createTransaction = async (
    userId: string,
    budgetId: string,
    accountId: string,
    transferAccountId: string | null,
    categoryId: string | null,
    amount: number,
    date: Date
) => {
    if (transferAccountId && categoryId || (!transferAccountId && !categoryId)) {
        throw Error('txn should either be a category txn or a transfer txn. can\t be both or none')
    }

    const budgetRef = db.collection('users').doc(userId).collection('budgets').doc(budgetId)
    const budget = await getBudget(userId, budgetId)
    assert(budget, "budget doesn't exist")

    const txnRef = budgetRef.collection('transactions').doc()

    const account = await getAccount(userId, budgetId, accountId)
    assert(account, "account needs to exist for any txn")
    
    const toAccount = transferAccountId ? await getAccount(userId, budgetId, transferAccountId) : null
    
    const batch = db.batch()

    if (transferAccountId) {
        if (amount < 0) {
            throw Error("amount should be positive")
        }

        if (accountId === transferAccountId) {
            throw Error('can\'t make a transfer between the same accounts')
        }

        const fromAccountRef = budgetRef.collection('accounts').doc(accountId)
        const fromAccount = account

        const toAccountRef = budgetRef.collection('accounts').doc(transferAccountId)
        assert(toAccount , "transfer account must exist for transfer")

        fromAccount.balance -= amount
        toAccount.balance += amount

        batch.update(fromAccountRef, {
            ...fromAccount
        })

        batch.update(toAccountRef, {
            ...toAccount
        })
    } else if (categoryId) {
        const month = toMonthId(new Date(date))

        const accountRef = budgetRef.collection('accounts').doc(accountId)
        const account = await getAccount(userId, budgetId, accountId)
        assert(account, "account must exist for a transaction")

        const categoryEntryRef = getMonthlyCategoryEntriesRef(userId, budgetId).doc(month).collection('category-entries').doc(categoryId)
        const categoryEntry = await getCategoryEntryForMonth(userId, budgetId, categoryId, month)
        assert(categoryEntry, "category entry must exxist for a trannsaction")

        account.balance += amount
        
        categoryEntry.activity += amount
        categoryEntry.available += amount

        batch.set(accountRef, {
            ...account
        }, { merge: true })

        batch.set(categoryEntryRef, {
            ...categoryEntry
        }, { merge: true })

        if (categoryId === 'readytoassign') {
            batch.update(budgetRef, {
                totalIncome: FieldValue.increment(amount) 
            })

            batch.update(budgetRef.collection('monthly-category-entries').doc(month), {
                income: FieldValue.increment(amount)
            })
        }

        // practically cascade computing entries should be cheap. who gonna add a txn for two months ago
        // 2month is long and cheap for computation. 
        await cascadeComputeCategoryEntries(userId, budgetId, categoryEntry, batch)
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

        batch.set(categoryEntryRef, {
            activity: FieldValue.increment(-amount),
            available: FieldValue.increment(-amount),
        }, { merge: true })

    }

    batch.delete(ref)
    await batch.commit()
}