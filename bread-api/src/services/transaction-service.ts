import assert from "assert"
import { CategoryTransaction, CategoryTransactionResult, IncomeTransactionResult, toMonthId, Transaction, TransactionResult, TransferTransaction, TransferTransactionResult } from "bread-core/src"
import { db, FieldValue } from "../firebase/server"
import { getAccount, getAccountRef } from "./account-service"
import { getBudget, getBudgetRef } from "./budget-service"
import { cascadeComputeCategoryEntries, getCategoryEntryForMonth, getMonthlyCategoryEntriesRef } from "./category-service"

export const getTransactionRef = (userId: string, budgetId: string, transactionId: string | null = null) => {
    return transactionId === null
        ? getBudgetRef(userId, budgetId).collection('transactions').doc()
        : getBudgetRef(userId, budgetId).collection('transactions').doc(transactionId)
}

export const createTransaction = async (
    userId: string,
    budgetId: string,
    type: string,
    accountId: string,
    toAccountId: string | null,
    categoryId: string | null,
    amount: number,
    date: number,
): Promise<TransactionResult> => {
    let transactionResult: TransactionResult;
    switch (type) {
        case 'category':
            assert(categoryId, "category id is required for category transactions")
            transactionResult = await createCategoryTransaction(userId, budgetId, accountId, categoryId, amount, date)
            break
        case 'transfer':
            assert(toAccountId, "to account id is required for transfer transactions")
            transactionResult = await createTransferTransaction(userId, budgetId, accountId, toAccountId, amount, date)
            break
        case 'income':
            transactionResult = await createIncomeTransaction(userId, budgetId, accountId, amount, date)
            break
        default:
            throw new Error("invalid transaction type")
    }

    return transactionResult
}

export const createTransferTransaction = async (
    userId: string,
    budgetId: string,
    accountId: string,
    toAccountId: string,
    amount: number,
    date: number,
): Promise<TransferTransactionResult> => {
    // if (amount < 0) {
    //     throw new Error("amount should be +ve")
    // }

    if (accountId === toAccountId) {
        throw Error('can\'t make a transfer between the same accounts')
    }

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

    batch.create(transactionRef, transaction)

    await batch.commit()

    return {
        transaction,
        updatedAccounts: [
            { id: account.id, balance: account.balance },
            { id: toAccount.id, balance: toAccount.balance }
        ]
    }
}

export const createIncomeTransaction = async (
    userId: string,
    budgetId: string,
    accountId: string,
    amount: number,
    date: number,
    batch: FirebaseFirestore.WriteBatch | null = null,
): Promise<IncomeTransactionResult> => {
    const budgetRef = getBudgetRef(userId, budgetId)
    const budget = await getBudget(userId, budgetId)
    assert(budget, "budget doesn't exist")

    const internalBatch = batch === null
    batch = batch === null ? db.batch() : batch

    budget.totalIncome += amount
    batch.update(budgetRef, {
        totalIncome: budget.totalIncome
    })

    // works but in a lazy way prolly implement the logic here
    const categoryTransactionResult = await createCategoryTransaction(userId, budgetId, accountId, 'readytoassign', amount, date, batch)
    batch.update(getTransactionRef(userId, budgetId, categoryTransactionResult.transaction.id), {
        type: 'income'
    })

    if (internalBatch)
        await batch.commit()

    return {
        transaction: { ...categoryTransactionResult.transaction, type: 'income' },
        updatedBudget: {
            totalIncome: budget.totalIncome
        },
        updatedAccounts: categoryTransactionResult.updatedAccounts,
        updatedCategoryEntries: categoryTransactionResult.updatedCategoryEntries,
    }
}

export const createCategoryTransaction = async (
    userId: string,
    budgetId: string,
    accountId: string,
    categoryId: string,
    amount: number,
    date: number,
    batch: FirebaseFirestore.WriteBatch | null = null,
): Promise<CategoryTransactionResult> => {
    const budget = await getBudget(userId, budgetId)
    assert(budget, "budget doesn't exist")

    const accountRef = getAccountRef(userId, budgetId, accountId)
    const account = await getAccount(userId, budgetId, accountId)
    assert(account, "account doesn't exist")

    const month = toMonthId(new Date(date))
    const categoryEntryRef = getMonthlyCategoryEntriesRef(userId, budgetId).doc(month)
        .collection('category-entries').doc(categoryId)
    const categoryEntry = await getCategoryEntryForMonth(userId, budgetId, categoryId, month)
    assert(categoryEntry, "category entry doesn't exist")

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

    const internalBatch = batch === null
    batch = batch ? batch : db.batch()

    batch.update(accountRef, {
        balance: account.balance
    })
    batch.update(categoryEntryRef, {
        activity: categoryEntry.activity,
        available: categoryEntry.available
    })

    batch.create(transactionRef, transaction)

    // use the cascade function to update all future category entries for this category
    const result = await cascadeComputeCategoryEntries(userId, budgetId, categoryEntry, budget.maxMonth, batch)

    if (internalBatch)
        await batch.commit()

    return {
        transaction,
        updatedAccounts: [{ id: account.id, balance: account.balance }],
        ...result
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

export const getTransaction = async (userId: string, budgetId: string, transactionId: string) => {
    const snapshot = await db.collection('users').doc(userId).collection('budgets').doc(budgetId).collection('transactions').doc(transactionId).get()

    if (!snapshot.exists || !snapshot.data()) {
        return null
    }

    return snapshot.data() as Transaction
}

export const deleteCategoryTransaction = async (userId: string, budgetId: string, transactionId: string) => {
    const budget = await getBudget(userId, budgetId)
    assert(budget, "budget doesn't exist")

    const transactionRef = getTransactionRef(userId, budgetId, transactionId)
    const transaction = await getTransaction(userId, budgetId, transactionId)
    assert(transaction, 'transaction does not exist')
    assert(transaction.type === 'category', 'transaction is not a category transaction')

    const accountRef = getAccountRef(userId, budgetId, transaction.accountId)
    const account = await getAccount(userId, budgetId, transaction.accountId)
    assert(account, "account doesn't exist")

    const month = toMonthId(new Date(transaction.date))
    const categoryEntryRef = getMonthlyCategoryEntriesRef(userId, budgetId).doc(month)
        .collection('category-entries').doc(transaction.categoryId!)
    const categoryEntry = await getCategoryEntryForMonth(userId, budgetId, transaction.categoryId!, month)
    assert(categoryEntry, "category entry doesn't exist")

    account.balance -= transaction.amount

    categoryEntry.activity -= transaction.amount
    categoryEntry.available -= transaction.amount

    const batch = db.batch()

    batch.update(accountRef, {
        balance: account.balance
    })
    batch.update(categoryEntryRef, {
        activity: categoryEntry.activity,
        available: categoryEntry.available
    })

    batch.delete(transactionRef)

    // use the cascade function to update all future category entries for this category
    const result = await cascadeComputeCategoryEntries(userId, budgetId, categoryEntry, budget.maxMonth, batch)

    await batch.commit()

    return {
        updatedAccounts: [{ id: account.id, balance: account.balance }],
        ...result
    }
}

export const deleteTransferTransaction = async (userId: string, budgetId: string, transactionId: string) => {
    const transactionRef = getTransactionRef(userId, budgetId, transactionId)
    const transaction = await getTransaction(userId, budgetId, transactionId)
    assert(transaction, 'transaction does not exist')
    assert(transaction.type === 'transfer', 'transaction is not a transfer transaction')

    const fromAccountRef = getAccountRef(userId, budgetId, transaction.accountId)
    const fromAccount = await getAccount(userId, budgetId, transaction.accountId)
    assert(fromAccount, "from account doesn't exist")

    const toAccountRef = getAccountRef(userId, budgetId, transaction.toAccountId!)
    const toAccount = await getAccount(userId, budgetId, transaction.toAccountId!)
    assert(toAccount, "to account doesn't exist")

    fromAccount.balance += transaction.amount
    toAccount.balance -= transaction.amount

    const batch = db.batch()
    batch.update(fromAccountRef, {
        balance: fromAccount.balance
    })

    batch.update(toAccountRef, {
        balance: toAccount.balance
    })

    batch.delete(transactionRef)

    await batch.commit()

    return {
        updatedAccounts: [
            { id: fromAccount.id, balance: fromAccount.balance },
            { id: toAccount.id, balance: toAccount.balance }
        ]
    }
}

export const deleteIncomeTransaction = async (userId: string, budgetId: string, transactionId: string) => {
    const budgetRef = getBudgetRef(userId, budgetId)
    const budget = await getBudget(userId, budgetId)
    assert(budget, "budget doesn't exist")

    const transactionRef = getTransactionRef(userId, budgetId, transactionId)
    const transaction = await getTransaction(userId, budgetId, transactionId)
    assert(transaction, 'transaction does not exist')
    assert(transaction.type === 'income', 'transaction is not an income transaction')

    const accountRef = getAccountRef(userId, budgetId, transaction.accountId)
    const account = await getAccount(userId, budgetId, transaction.accountId)
    assert(account, "account doesn't exist")

    const month = toMonthId(new Date(transaction.date))
    const categoryEntryRef = getMonthlyCategoryEntriesRef(userId, budgetId).doc(month)
        .collection('category-entries').doc('readytoassign')
    const categoryEntry = await getCategoryEntryForMonth(userId, budgetId, 'readytoassign', month)
    assert(categoryEntry, "category entry doesn't exist")

    account.balance -= transaction.amount
    budget.totalIncome -= transaction.amount

    categoryEntry.activity -= transaction.amount
    categoryEntry.available -= transaction.amount

    const batch = db.batch()
    batch.update(accountRef, {
        balance: account.balance
    })
    batch.update(budgetRef, {
        totalIncome: budget.totalIncome
    })

    batch.update(categoryEntryRef, {
        activity: categoryEntry.activity,
        available: categoryEntry.available
     }
    )


    batch.delete(transactionRef)

    // use the cascade function to update all future category entries for this category
    const result = await cascadeComputeCategoryEntries(userId, budgetId, categoryEntry, budget.maxMonth, batch)

    await batch.commit()


    return {
        updatedBudget: {
            totalIncome: budget.totalIncome
        },
        updatedAccounts: [{ id: account.id, balance: account.balance }],
        ...result
    }
}

export const deleteTransaction = async (userId: string, budgetId: string, transactionId: string) => {
    const transaction = await getTransaction(userId, budgetId, transactionId)
    assert(transaction, "transaction doesn't exist")

    let result

    switch (transaction.type) {
        case 'category':
            result = await deleteCategoryTransaction(userId, budgetId, transactionId)
            break
        case 'transfer':
            result = await deleteTransferTransaction(userId, budgetId, transactionId)
            break
        case 'income':
            result = await deleteIncomeTransaction(userId, budgetId, transactionId)
            break
        default:
            throw new Error("invalid transaction type")
    }

    return result
}