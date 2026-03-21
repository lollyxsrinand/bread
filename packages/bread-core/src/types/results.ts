import { Account, CategoryEntry, CategoryTransaction, IncomeTransaction, MonthId, Transaction, TransferTransaction, } from "./base"

// in the future we could add overspent and other shit we might need so
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

export interface IncomeTransactionResult extends CascadeComputeCategoryEntriesResult {
    transaction: IncomeTransaction
    updatedAccounts: {
        id: string
        balance: number
    }[]
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

// why do i need this
export type TransactionResult = CategoryTransactionResult | TransferTransactionResult | IncomeTransactionResult

export interface CreateAccountResult extends IncomeTransactionResult {
   account: Account 
} 

export interface DeleteIncomeTransactionResult extends CascadeComputeCategoryEntriesResult {
    type: 'income'
    updatedBudget: {
        totalIncome: number;
    };
    updatedAccounts: {
        id: string
        balance: number;
    }[];
}

export interface DeleteCategoryTransactionResult extends CascadeComputeCategoryEntriesResult {
    type: 'category'
    updatedAccounts: {
        id: string
        balance: number;
    }[];
}

export interface DeleteTransferTransactionResult {
    type: 'transfer'
    updatedAccounts: {
        id: string
        balance: number;
    }[];
}

export type DeleteTransactionResult = DeleteCategoryTransactionResult | DeleteIncomeTransactionResult | DeleteTransferTransactionResult