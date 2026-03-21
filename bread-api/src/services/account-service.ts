import { Account, CreateAccountResult } from "bread-core/src"
import { db } from "../firebase/server"
import { createIncomeTransaction } from "./transaction-service"
import { getBudgetRef } from "./budget-service"

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