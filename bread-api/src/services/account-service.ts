import { Account, CreateAccountResult } from "bread-core/src"
import { db, FieldValue } from "../firebase/server"
import { createIncomeTransaction } from "./transaction-service"
import { getBudgetRef } from "./budget-service"
import assert from "assert"

export const createAccount = async (
    userId: string, 
    budgetId: string, 
    data: { name: string, type: string, balance: number }
): Promise<CreateAccountResult> => {
    const ref = db
        .collection('users').doc(userId)
        .collection('budgets').doc(budgetId)
        .collection('accounts').doc()

    const account: Account = {
        id: ref.id,
        name: data.name,
        type: data.type,
        balance: 0,
        createdAt: Date.now(),
        isClosed: false
    }

    await ref.set(account)

    const incomeTransactionResult = await createIncomeTransaction(userId, budgetId, account.id, data.balance, Date.now())

    return {
        ...incomeTransactionResult,
        account
    }

}

export const getAccountRef = (userId: string, budgetId: string, accountId: string) => {
    return getBudgetRef(userId, budgetId).collection('accounts').doc(accountId)
}

export const getAccounts = async (userId: string, budgetId: string) => {
    const snapshot = await db.collection('users').doc(userId).collection('budgets').doc(budgetId).collection('accounts').get()
    const accounts: Account[] = []

    snapshot.forEach((doc) => {
        accounts.push(doc.data() as Account)
    })

    return accounts
}

export const getAccount = async (userId: string, budgetId: string, accountId: string) => {
    const snapshot = await db.collection('users').doc(userId).collection('budgets').doc(budgetId).collection('accounts').doc(accountId).get()

    if (!snapshot.exists || !snapshot.data()) {
        return null
    }

    return snapshot.data() as Account
}

export const closeAccount = async (userId: string, budgetId: string, accountId: string): Promise<Account> => {
    const ref = getAccountRef(userId, budgetId, accountId)
    const account = await getAccount(userId, budgetId, accountId)
    assert(account, "account not found")
    assert(!account.isClosed, "account already closed wtf?")
    assert(account.balance === 0, "account balance must be 0 to close")

    const updatedAccount = {
        ...account,
        isClosed: true,
        closedAt: Date.now()
    }

    await ref.update(updatedAccount)

    return updatedAccount
}

export const openAccount = async (userId: string, budgetId: string, accountId: string): Promise<Account> => {
    const ref = getAccountRef(userId, budgetId, accountId)
    const account = await getAccount(userId, budgetId, accountId)
    assert(account, "account not found")
    assert(account.isClosed, "account already open wtf?")

    const updatedAccount = {
        ...account,
        isClosed: false,
        closedAt: Date.now()
    }

    await ref.update(updatedAccount)

    return updatedAccount
}

export const updateAccount = async (userId: string, budgetId: string, accountId: string, data: { name: string, type: string }) => {
    const ref = getAccountRef(userId, budgetId, accountId)
    const account = await getAccount(userId, budgetId, accountId)
    assert(account, "account not found")
    assert(!account.isClosed, "can't update an account that's closed")

    if (account.name === data.name && account.type === data.type) {
        return account
    }

    const updatedAccount = {
        ...account,
        ...data
    }

    await ref.update(updatedAccount)

    return updatedAccount
}