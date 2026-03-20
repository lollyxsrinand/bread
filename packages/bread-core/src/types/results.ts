import { Account, CategoryEntry, CategoryTransaction, MonthId, Transaction, TransferTransaction, } from "./base"

// in the future we could add overspent and other shit we might need
export interface CascadeComputeCategoryEntriesResult  {
    updatedCategoryEntries: Record<MonthId, CategoryEntry>
}

export interface CategoryTransactionResult extends CascadeComputeCategoryEntriesResult {
    transaction: CategoryTransaction
    updatedAccounts: {
        id: string
        balance: number
    }[]
}

export interface IncomeTransactionResult extends CategoryTransactionResult {
    updatedBudget: {
        totalIncome: number
    } 
}

export interface TransferTransactionResult  {
    transaction: TransferTransaction
    updatedAccounts: {
        id: string
        balance: number
    }[]
}

export type TransactionResult = CategoryTransactionResult | TransferTransactionResult | IncomeTransactionResult

export interface CreateAccountResult extends IncomeTransactionResult {
   account: Account 
} 