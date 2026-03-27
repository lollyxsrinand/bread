import { Account, CategoryEntry, CategoryTransaction, IncomeTransaction, MonthId, Transaction, TransferTransaction, } from "./base"

// in the future we could add overspent and other shit we might need so
export interface CascadeComputeCategoryEntriesResult  {
    updatedCategoryEntries: Record<MonthId, CategoryEntry>
}

export interface CategoryTransactionResult extends CascadeComputeCategoryEntriesResult {
    type: 'category'
    transaction: CategoryTransaction
    updatedAccounts: {
        id: string
        balance: number
    }[]
}

export interface IncomeTransactionResult extends CascadeComputeCategoryEntriesResult {
    type: 'income'
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
    type: 'transfer'
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

export interface DeleteIncomeTransactionResult extends CascadeComputeCategoryEntriesResult {
    type: 'income'
    updatedBudget: {
        // id: string
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

export interface AssignToCategoryResult extends CascadeComputeCategoryEntriesResult {
    updatedBudget: {
        id: string
        totalAssigned: number
    }
}