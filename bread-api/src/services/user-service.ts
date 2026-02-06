import { db } from "../firebase/server";
import { createBudget } from "./budget-service";
import { createCategory, createCategoryGroup } from "./category-service";

// create user if the user doesn't exist
export const createUser = async (userId: string, email: string) => {
  const userRef = db.collection('users').doc(userId);

  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    await userRef.set({
      email: email || null,
      createdAt: Date.now(),
    });
  }
}

export const setupUser = async (userId: string, email: string) => {
  // create user first
  await createUser(userId, email)

  // create a defualt user budget
  const budgetId = await createBudget(userId, 'My Budget')

  // create default categories for the user budget
  const categories = {
    'wants': ['food', 'subscription', 'clothes'],
    'needs': ['rent', 'utilities', 'groceries'],
    'savings': ['emergency fund', 'investments'],
  } as any // fuck it.

  Object.keys(categories).forEach(async (groupName: string) => {
    const categoryGroupId = await createCategoryGroup(userId, budgetId, groupName)
    categories[groupName].forEach(async (categoryName: string) => {
      await createCategory(userId, budgetId, categoryGroupId, categoryName)
    })
  })
}