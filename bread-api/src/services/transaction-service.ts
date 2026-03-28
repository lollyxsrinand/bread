import assert from "assert"
import { CategoryTransaction, CategoryTransactionResult, CreateCategoryTransactionInput, CreateIncomeTransactionInput, CreateTransactionInput, CreateTransferTransactionInput, DeleteCategoryTransactionResult, DeleteIncomeTransactionResult, DeleteTransactionResult, DeleteTransferTransactionResult, IncomeTransactionResult, toMonthId, Transaction, TransactionResult, TransferTransaction, TransferTransactionResult } from "bread-core/src"
import { db, FieldValue } from "../firebase/server"
import { getAccount, getAccountRef } from "./account-service"
import { getBudget, getBudgetRef } from "./budget-service"
import { cascadeComputeCategoryEntries, fixMyEntriesPls, getCategoryEntryForMonth, getMonthlyCategoryEntriesRef } from "./category-service"

export const getTransactionRef = (userId: string, budgetId: string, transactionId: string | null = null) => {
    return transactionId === null
        ? getBudgetRef(userId, budgetId).collection('transactions').doc()
        : getBudgetRef(userId, budgetId).collection('transactions').doc(transactionId)
}

export const createTransaction = async (
    userId: string,
    budgetId: string,
    input: CreateTransactionInput
): Promise<TransactionResult> => {
    let transactionResult: TransactionResult;
    switch (input.type) {
        case 'category':
            transactionResult = await createCategoryTransaction(userId, budgetId, input)
            break
        case 'transfer':
            transactionResult = await createTransferTransaction(userId, budgetId, input)
            break
        case 'income':
            transactionResult = await createIncomeTransaction(userId, budgetId, input)
            break
        default:
            throw new Error("invalid transaction type")
    }

    return transactionResult
}

export const createTransferTransaction = async (
    userId: string,
    budgetId: string,
    input: CreateTransferTransactionInput
): Promise<TransferTransactionResult> => {
    // if (amount < 0) {
    //     throw new Error("amount should be +ve")
    // }
    const { accountId , toAccountId, date, amount, note } = input

    if (accountId === toAccountId) {
        throw Error('can\'t make a transfer between the same accounts')
    }

    const accountRef = getAccountRef(userId, budgetId, accountId)
    const account = await getAccount(userId, budgetId, accountId)
    assert(account, "account doesn't exist")
    assert(!account.isClosed, "can't add a transaction to a closed account")

    const toAccountRef = getAccountRef(userId, budgetId, toAccountId)
    const toAccount = await getAccount(userId, budgetId, toAccountId)
    assert(toAccount, "to account doesn't exist")
    assert(!toAccount.isClosed, "can't add a transaction to a closed account")

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
        type: 'transfer',
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
    input: CreateIncomeTransactionInput,
    batch: FirebaseFirestore.WriteBatch | null = null,
): Promise<IncomeTransactionResult> => {
    const { accountId , date, amount, note } = input
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
    const categoryTransactionResult = await createCategoryTransaction(userId, budgetId, { accountId, date, amount, note, categoryId: 'readytoassign', type: 'category' }, batch)
    // sometimes i actually am blown away how lazy i am
    batch.update(getTransactionRef(userId, budgetId, categoryTransactionResult.transaction.id), {
        type: 'income'
    })

    if (internalBatch)
        await batch.commit()

    return {
        type: 'income',
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
    input: CreateCategoryTransactionInput,
    batch: FirebaseFirestore.WriteBatch | null = null,
): Promise<CategoryTransactionResult> => {
    const { accountId , date, categoryId, amount, note } = input
    const budget = await getBudget(userId, budgetId)
    assert(budget, "budget doesn't exist")

    const accountRef = getAccountRef(userId, budgetId, accountId)
    const account = await getAccount(userId, budgetId, accountId)
    assert(account, "account doesn't exist")
    assert(!account.isClosed, "can't add a transaction to a closed account")

    const month = toMonthId(new Date(date))
    await fixMyEntriesPls(userId, budgetId, categoryId, month, budget.maxMonth)

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
        note,
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
        type: 'category',
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

export const deleteCategoryTransaction = async (
    userId: string, 
    budgetId: string, 
    transactionId: string
): Promise<DeleteCategoryTransactionResult> => {
    const budget = await getBudget(userId, budgetId)
    assert(budget, "budget doesn't exist")

    const transactionRef = getTransactionRef(userId, budgetId, transactionId)
    const transaction = await getTransaction(userId, budgetId, transactionId)
    assert(transaction, 'transaction does not exist')
    assert(transaction.type === 'category', 'transaction is not a category transaction')

    const accountRef = getAccountRef(userId, budgetId, transaction.accountId)
    const account = await getAccount(userId, budgetId, transaction.accountId)
    assert(account, "account doesn't exist")
    assert(!account.isClosed, "can't add a transaction to a closed account")

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
        type: 'category',
        updatedAccounts: [{ id: account.id, balance: account.balance }],
        ...result
    }
}

export const deleteTransferTransaction = async (
    userId: string, 
    budgetId: string, 
    transactionId: string
): Promise<DeleteTransferTransactionResult> => {
    const transactionRef = getTransactionRef(userId, budgetId, transactionId)
    const transaction = await getTransaction(userId, budgetId, transactionId)
    assert(transaction, 'transaction does not exist')
    assert(transaction.type === 'transfer', 'transaction is not a transfer transaction')

    const fromAccountRef = getAccountRef(userId, budgetId, transaction.accountId)
    const fromAccount = await getAccount(userId, budgetId, transaction.accountId)
    assert(fromAccount, "from account doesn't exist")
    assert(!fromAccount.isClosed, "can't add a transaction to a closed account")

    const toAccountRef = getAccountRef(userId, budgetId, transaction.toAccountId!)
    const toAccount = await getAccount(userId, budgetId, transaction.toAccountId!)
    assert(toAccount, "to account doesn't exist")
    assert(!toAccount.isClosed, "can't add a transaction to a closed account")

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
        type: 'transfer',
        updatedAccounts: [
            { id: fromAccount.id, balance: fromAccount.balance },
            { id: toAccount.id, balance: toAccount.balance }
        ]
    }
}

export const deleteIncomeTransaction = async (
    userId: string, 
    budgetId: string, 
    transactionId: string
): Promise<DeleteIncomeTransactionResult> => {
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
    assert(!account.isClosed, "can't delete transaction of a closed account")

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
        type: 'income',
        updatedBudget: {
            totalIncome: budget.totalIncome
        },
        updatedAccounts: [{ id: account.id, balance: account.balance }],
        ...result
    }
}

export const deleteTransaction = async (
    userId: string, 
    budgetId: string,
    transactionId: string
): Promise<DeleteTransactionResult> => {
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