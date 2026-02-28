import { Account } from "bread-core/src"
import { db } from "../firebase/server"
import { createTransaction } from "./transaction-service"

export const createAccount = async (userId: string, budgetId: string, data: { name: string, type: string, balance: number }) => {
    const ref = db
        .collection('users')
        .doc(userId)
        .collection('budgets')
        .doc(budgetId)
        .collection('accounts')
        .doc()

    const account: Account = {
        id: ref.id,
        name: data.name,
        type: data.type,
        balance: 0,
        createdAt: Date.now(),
    }

    await ref.set(account)
    await createTransaction(userId, budgetId, account.id, null, 'readytoassign', data.balance, new Date())

    return account
}

export const getAccounts = async (uid: string, budgetId: string) => {
    const snapshot = await db.collection('users').doc(uid).collection('budgets').doc(budgetId).collection('accounts').get()
    const accounts: Account[] = []

    snapshot.forEach((doc) => {
        accounts.push(doc.data() as Account)
    })

    return accounts
}

export const getAccount = async (userId: string, budgetId: string, accountId: string) => {
    const accountSnapshot = await db.collection('users').doc(userId).collection('budgets').doc(budgetId).collection('accounts').doc(accountId).get()

    if (!accountSnapshot.exists) {
        return null
    }

    const data = accountSnapshot.data()

    if (!data) {
        return null
    }

    const account: Account = {
        id: data.id,
        name: data.name,
        type: data.type,
        balance: data.balance,
        createdAt: data.createdAt,
    }

    return account
}