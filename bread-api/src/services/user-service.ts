import { getCurrentMonthId } from "../utils/date-id-format";
import { db } from "../firebase/server";
import { createBudget } from "./budget-service";
import { createCategory, createCategoryGroup, createCategoryMonth } from "./category-service";
import { createTransaction } from "./transaction-service";
import { User } from "bread-core/src/"

// create user if the user doesn't exist
export const createUser = async (uid: string, email: string) => {
  const userRef = db.collection('users').doc(uid);

  const userDoc = await userRef.get();


  if (!userDoc.exists) {
    const userData: User = {
      id: uid,
      email: email,
      createdAt: Date.now(),
      currentBudgetId: null,
    }
    await userRef.set(userData);
  }

  return userRef.id
}

/**
 * 1. creates a user doc
 * 2. creates a budgets collection
 * 3. creates categoryGroups collection, categories collection, categoryMonths collection
 * - all collections are populated with default data
 */
export const setupUser = async (userId: string, email: string) => {
  // create user
  await createUser(userId, email)

  // create a defualt user budget
  const budgetId = await createBudget(userId, 'My Budget')

  // create default categories for the user budget
  const categories = {
    'wants': ['food', 'subscription', 'clothes'],
    'needs': ['rent', 'utilities', 'groceries'],
    'savings': ['emergency fund', 'investments'],
  } as any // fuck it.

  for(const categoryGroupName in categories) {
    const categoryGroupId = await createCategoryGroup(userId, budgetId, categoryGroupName)

    for(const categoryName of categories[categoryGroupName]) {
      const categoryId = await createCategory(userId, budgetId, categoryGroupId, categoryName)
      await createCategoryMonth(userId, budgetId, categoryId, getCurrentMonthId())
    }
  }
}

export const getUser = async (userId: string) => {
  const snapshot = await db.collection('users').doc(userId).get()

  if(!snapshot.exists)
    return null

  const data = snapshot.data()

  if (!data) {
    return null
  }
  const user: User = {
    id: data.id || snapshot.id,
    email: data.email,
    createdAt: data.createdAt,
    currentBudgetId: data.currentBudgetId ?? null
  }

  return user
}