import { CategoryEntry, CategoryTransaction, CategoryTransactionResult, MonthId, toMonthId, Transaction, TransactionResult, TransferTransaction, TransferTransactionResult } from "bread-core/src"
import { db, FieldValue } from "../firebase/server"
import { getAccount, getAccountRef } from "./account-service"
import { getBudget, getBudgetRef } from "./budget-service"
import { cascadeComputeCategoryEntries, getCategoryEntryForMonth, getMonthlyCategoryEntriesRef, rangeComputeCategoryEntries } from "./category-service"
import assert from "assert"

export const getTransactionRef = (userId: string, budgetId: string, transactionId: string | null = null) => {
    return transactionId === null
        ? getBudgetRef(userId, budgetId).collection('transactions').doc()
        : getBudgetRef(userId, budgetId).collection('transactions').doc(transactionId)
}

export const createTransferTransaction = async (
    userId: string,
    budgetId: string,
    accountId: string,
    toAccountId: string,
    amount: number,
    date: number,
): Promise<TransferTransactionResult> => {
    if (amount < 0) {
        throw new Error("amount should be +ve")
    }

    if (accountId === toAccountId) {
        throw Error('can\'t make a transfer between the same accounts')
    }

    const budgetRef = getBudgetRef(userId, budgetId)
    const budget = await getBudget(userId, budgetId)
    assert(budget, "budget doesn't exist")

    const accountRef = getAccountRef(userId, budgetId, accountId)
    const account = await getAccount(userId, budgetId, accountId)
    assert(account, "account doesn't exist")

    const toAccountRef = getAccountRef(userId, budgetId, toAccountId)
    const toAccount = await getAccount(userId, budgetId, toAccountId)
    assert(toAccount, "to account doesn't exist")

    account.balance -= amount
    toAccount.balance += amount

    const batch = db.batch()
    batch.update(accountRef, {
        balance: account.balance
    })

    batch.update(toAccountRef, {
        balance: toAccount.balance
    })

    const transactionRef = getTransactionRef(userId, budgetId)
    const transaction: TransferTransaction = {
        id: transactionRef.id,
        type: 'transfer',
        accountId: account.id,
        toAccountId: toAccount.id,
        amount: amount,
        date: date,
        createdAt: FieldValue.serverTimestamp()
    }

    await batch.commit()

    return {
        transaction,
        updatedAccounts: [
            { id: account.id, balance: account.balance },
            { id: toAccount.id, balance: toAccount.balance }
        ]
    }
}

export const createCategoryTransaction = async (
    userId: string,
    budgetId: string,
    accountId: string,
    categoryId: string,
    amount: number,
    date: number,
): Promise<CategoryTransactionResult> => {
    const budgetRef = getBudgetRef(userId, budgetId)
    const budget = await getBudget(userId, budgetId)
    assert(budget, "budget doesn't exist")

    const accountRef = getAccountRef(userId, budgetId, accountId)
    const account = await getAccount(userId, budgetId, accountId)
    assert(account, "account doesn't exist")

    const month = toMonthId(new Date(date))
    const categoryEntry = await getCategoryEntryForMonth(userId, budgetId, categoryId, month)
    assert(categoryEntry, "category entry doesn't exist")

    const batch = db.batch()
    if (categoryId === 'readytoassign') { // income
        if (amount < 0) {
            throw new Error("amount should be +ve for readytoassign category/income")
        }
        budget.totalIncome += amount

        batch.update(budgetRef, {
            totalIncome: budget.totalIncome
        })
    }

    account.balance += amount 

    categoryEntry.activity += amount
    categoryEntry.available += amount
    
    const transactionRef = getTransactionRef(userId, budgetId)
    const transaction: CategoryTransaction = {
        id: transactionRef.id,
        type: 'category',
        accountId: account.id,
        categoryId,
        amount,
        date,
        createdAt: FieldValue.serverTimestamp()
    }

    batch.update(accountRef, {
        balance: account.balance
    })
    

    // use the cascade function to update all future category entries for this category
    const result = await cascadeComputeCategoryEntries(userId, budgetId, categoryEntry, budget.maxMonth, batch)

    await batch.commit()

    return {
        transaction,
        updatedAccounts: [{ id: account.id, balance: account.balance }],
        : result
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
}