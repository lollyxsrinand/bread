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
  
  // could i move this to under monthly-category-entries/?
  totalIncome: number
  totalAssigned: number
  totalOverspent: number
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

interface BaseTransaction {
  id: string
  accountId: string
  amount: number
  date: number
  createdAt?: any
}

export interface CategoryTransaction extends BaseTransaction {
  type: 'category'
  categoryId: string
}

export interface TransferTransaction extends BaseTransaction {
  type: 'transfer'
  toAccountId: string
}

export interface IncomeTransaction extends BaseTransaction {
  type: 'income'
}

export type Transaction = CategoryTransaction | TransferTransaction | IncomeTransaction

// brand the type 
// export type MonthId = string & { __brand: "MonthId" }

export type MonthId = string

// doubtful about this
export interface MonthSummary {
  income: number
  assigned: number
  overspent: number
  available: number
}