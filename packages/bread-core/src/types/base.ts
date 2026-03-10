export interface User {
  id: string
  email: string
  createdAt?: any 
  currentBudgetId: string | null
}

export interface Budget {
  id: string
  name: string
  createdAt: number
  currency: string
  minMonth: string
  maxMonth: string
  totalIncome: number
  totalAssigned: number
}

export interface Account {
  id: string
  name: string
  type: string
  balance: number
  createdAt?: any 
}

export interface Category {
  id: string
  categoryGroupId: string
  name: string
  isSystem: boolean
  createdAt?: any
}

export interface CategoryGroup {
  id: string
  name: string
  createdAt?: any 
}

export interface CategoryEntry {
  id: string
  month: string 
  activity: number
  assigned: number
  available: number
  createdAt?:any 
}

export interface Transaction {
  id: string
  accountId: string
  categoryId: string | null
  transferAccountId: string | null
  amount: number
  date: number
  createdAt?: any
}

export interface MonthSummary {
  income: number,
  assigned: number,
}