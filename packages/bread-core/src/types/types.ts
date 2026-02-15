// ========================
// user
// ========================
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