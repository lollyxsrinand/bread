import { Account } from "bread-core/src"
import { db } from "../firebase/server"

export const createAccount = async (uid: string, budgetId: string, data: {name: string, type: string, balance: number}) => {
        const accountRef = db.collection('users').doc(uid).collection('budgets').doc(budgetId).collection('accounts').doc()
    
        const accountData: Account = {
            id: accountRef.id,
            name: data.name,
            type: data.type,
            balance: data.balance,
            createdAt: Date.now(),
        }
    
        await accountRef.set(accountData)
    
        return accountData
}

export const getAccounts = async (uid: string, budgetId: string) => {
    const accountsSnapshot = await db.collection('users').doc(uid).collection('budgets').doc(budgetId).collection('accounts').get()
    const accounts: Account[] = []

    accountsSnapshot.forEach((doc) => {
        const data = doc.data()
        accounts.push(doc.data() as Account)
    })

    return accounts
}