export interface CreateTransactionBaseInput {
    type: 'category' | 'transfer' | 'income'
    accountId: string
    amount: number
    date: number
    note?: string
    createdAt?: any

}
export interface CreateCategoryTransactionInput extends CreateTransactionBaseInput {
    type: 'category'
    categoryId: string
}

export interface CreateIncomeTransactionInput extends CreateTransactionBaseInput {
    type: 'income'
}

export interface CreateTransferTransactionInput extends CreateTransactionBaseInput {
    type: 'transfer'
    toAccountId: string
}

export type CreateTransactionInput = CreateCategoryTransactionInput | CreateIncomeTransactionInput | CreateTransferTransactionInput