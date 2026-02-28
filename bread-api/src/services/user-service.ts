import { db } from "../firebase/server";
import { createBudget } from "./budget-service";
import { createCategory, createCategoryGroup, createCategoryMonth } from "./category-service";
import { User, getCurrentMonthId } from "bread-core/src"

export const createUser = async (userId: string, email: string) => {
  const ref = db.collection('users').doc(userId);

  const user: User = {
    id: userId,
    email: email,
    createdAt: Date.now(),
    currentBudgetId: null
  }

  await ref.create(user);
  return user
}

export const setupUser = async (userId: string, email: string) => {
  await createUser(userId, email)

  const { id: budgetId } = await createBudget(userId, 'My Budget')

  const categories = {
    'wants': ['food', 'subscription', 'clothes'],
    'needs': ['rent', 'utilities', 'groceries'],
    'savings': ['emergency fund', 'investments'],
  } as any
  const currentMonth = getCurrentMonthId()

  for (const categoryGroupName in categories) {
    const { id: categoryGroupId } = await createCategoryGroup(userId, budgetId, categoryGroupName)

    for (const categoryName of categories[categoryGroupName]) {
      const { id: categoryId } = await createCategory(userId, budgetId, categoryGroupId, categoryName)
      await createCategoryMonth(userId, budgetId, categoryId, currentMonth)
    }
  }

  const { id: inflowGroupId } = await createCategoryGroup(userId, budgetId, 'inflow')
  const { id: readyToAssignId } = await createCategory( userId, budgetId, inflowGroupId, 'ready to assign', true, 'readytoassign')
  await createCategoryMonth(userId, budgetId, readyToAssignId, currentMonth)
}

export const getUser = async (userId: string) => {
  const snapshot = await db.collection('users').doc(userId).get()
  const data = snapshot.data()

  if (!data)
    return null

  return data as User
}