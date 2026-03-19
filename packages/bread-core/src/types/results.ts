import { CategoryEntry, CategoryTransaction, MonthId, TransferTransaction, } from "./base"

export interface CategoryTransactionResult extends CascadeComputeCategoryEntriesResult {
    transaction: CategoryTransaction
    updatedAccounts: {
        id: string
        balance: number
    }[]
}

export interface TransferTransactionResult  {
    transaction: TransferTransaction
    updatedAccounts: {
        id: string
        balance: number
    }[]
}


export type TransactionResult = CategoryTransactionResult | TransferTransactionResult

export interface createAccountResult extends TransactionResult {
    
}
// because in the future we could add overspent and other shit we might need
export type CascadeComputeCategoryEntriesResult = {
    updatedCategoryEntries: Record<MonthId, CategoryEntry>
}