'use client'

import { Account } from "bread-core/src"

// later define this in bread-core
interface Transaction {
    id: string
    accountId: string
    categoryId: string
    toAccountId: string
    amount: number
    date: number
    createdAt: number
}

const TransactionRow = ({ transaction, accountName }: { transaction: Transaction, accountName: string }) => {

    return (
        <div className="px-4 py-2 flex">
            <span className="w-full">{new Date(transaction.date).toDateString()}</span>
            <span className="w-full">{accountName}</span>
            <span className="w-full">{transaction.categoryId}</span>
            <div className="w-full flex">
                <span className="w-full">{transaction.amount > 0 ? transaction.amount : ''}</span>
                <span className="w-full">{transaction.amount < 0 ? -transaction.amount : ''}</span>
            </div>
        </div>
    )
}

export const TransactionsView = ({ transactions, accounts }: { transactions: Transaction[], accounts: Account[] }) => {
    const mapped_accounts = Object.fromEntries(
        accounts.map((account: Account) => [account.id, account])
    )


    return (
        <div className="flex flex-col gap-2.5">
            <div className="h-24 flex items-center">
                <h1 className="font-bold">transactions</h1>
            </div>

            <div className="flex flex-col">
                <div className="flex px-4 py-2">
                    <span className="w-full font-bold">date</span>
                    <span className="w-full font-bold">account</span>
                    <span className="w-full font-bold">category</span>
                    <div className="w-full flex">
                        <span className="w-full font-bold">inflow</span>
                        <span className="w-full font-bold">outflow</span>
                    </div>
                </div>

                {transactions.map((transaction: Transaction) => (
                    <TransactionRow key={transaction.id} transaction={transaction} accountName={mapped_accounts[transaction.accountId]?.name ?? 'unknown'} />
                ))}
            </div>
        </div>
    )
}