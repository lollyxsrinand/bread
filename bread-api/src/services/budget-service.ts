import { db } from "../firebase/server"

/**
 * 
 * @param `userId`
 * @param `budgetName`
 * @returns `id` of the created budget
 */
export const createBudget = async (userId: string, budgetName: string) => {
    const budgetRef = db.collection('users').doc(userId).collection('budgets').doc()

    await budgetRef.set({
        id: budgetRef.id,
        name: budgetName,
        createdAt: new Date(),
        currency: 'INR'
    })

    return budgetRef.id
}