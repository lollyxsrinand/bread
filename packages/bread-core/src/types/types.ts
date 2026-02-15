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