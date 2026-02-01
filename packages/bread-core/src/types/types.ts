// ========================
// user
// ========================
export interface User {
  id: string
  name: string
  email: string
  createdAt: number
  preferences: {
    currency: string
    theme: string
  }
}

// ========================
// budget
// ========================
export interface Budget {
  id: string
  userId: string
  name: string
  currency: string
  createdAt: number
  lastAccessed: number
}

// ========================
// month (budget/{id}/months)
// months are anchors, not state containers
// ========================
export interface BudgetMonth {
  id: string // YYYY-MM
}

// ========================
// category group
// ========================
export interface CategoryGroup {
  id: string
  budgetId: string
  name: string
  sortOrder: number
  isHidden: boolean
}

// ========================
// category
// metadata only, no numbers
// ========================
export interface Category {
  id: string
  budgetId: string
  groupId: string
  name: string
  sortOrder: number
  isHidden: boolean
  isDeleted: boolean
}

// ========================
// category month
// THIS is the budget brain
// ========================
export interface CategoryMonth {
  id: string                 // categoryId_YYYY-MM
  budgetId: string
  categoryId: string
  month: string              // YYYY-MM

  budgeted: number           // user intent
  available: number          // cached rollover result

  notes?: string
}

// ========================
// account
// reconciliation lives here
// ========================
export type AccountType =
  | 'checking'
  | 'savings'
  | 'cash'
  | 'credit'
  | 'loan'
  | 'investment'
  | 'other'

export interface Account {
  id: string
  budgetId: string
  name: string
  type: AccountType

  balance: number
  clearedBalance: number
  unclearedBalance: number

  sortOrder: number
  closed: boolean
  createdAt: number
}

// ========================
// transaction
// source of all activity
// ========================
export type ClearedState = 'cleared' | 'uncleared' | 'reconciled'

export interface Transaction {
  id: string
  budgetId: string
  accountId: string

  date: string              // YYYY-MM-DD
  amount: number            // cents

  payeeId: string | null
  categoryId: string | null // null = ready to assign

  memo?: string
  cleared: ClearedState

  transferAccountId: string | null
  createdAt: number

  isSplit: boolean
}

// ========================
// split transaction
// ========================
export interface SplitTransaction {
  id: string
  transactionId: string
  categoryId: string
  amount: number
  memo?: string
}

// ========================
// payee
// ========================
export interface Payee {
  id: string
  budgetId: string
  name: string
  isTransferAccount: boolean
}

// ========================
// derived-only views (NOT stored)
// ========================
export interface MonthSummary {
  month: string

  income: number
  toBeBudgeted: number

  totalBudgeted: number
  totalActivity: number
  totalAvailable: number

  overspentLastMonth: number
}
