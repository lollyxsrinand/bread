export interface User {
  id: string
  email: string
  createdAt: number
  currentBudgetId: string | null
}

export interface Budget {
  id: string
  name: string
  createdAt: number
  currency: string
  minMonth: string
  maxMonth: string
}

export interface Account {
  id: string
  name: string
  type: string
  balance: number
  createdAt: number
}

export interface Category {
  id: string
  categoryGroupId: string
  name: string
  isSystem: boolean
  createdAt: number
}

export interface CategoryGroup {
  id: string
  name: string
  createdAt: number
}

export interface CategoryMonth {
  id: string
  month: string
  categoryId: string
  activity: number
  available: number
  budgeted: number
  createdAt: number
}

export interface Transaction {
  id: string
  accountId: string
  categoryId: string | null
  toAccountId: string | null
  amount: number
  date: number
  createdAt: number
}