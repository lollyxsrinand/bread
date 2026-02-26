'use client'

import { useBudgetStore } from "@/store/budget-store"
import { PlusCircle, Trash } from "lucide-react"
import { Transaction, Category, Account, CategoryView } from "bread-core"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"
import { createTransaction, deleteTransaction } from "@/lib/actions/transaction.actions"

const row_spacing = 'px-3 gap-2.5'
const cell_padding = 'px-3 py-2.5'

const TableHeader = () => {
    return (
        <div className={`${row_spacing} w-full flex items-center`}>
            <div className={`${cell_padding} w-full`}>
                <span>date</span>
            </div>
            <div className={`${cell_padding} w-full`}>
                <span>account</span>
            </div>
            <div className={`${cell_padding} w-full`}>
                <span>category</span>
            </div>
            <div className={`${cell_padding} w-full`}>
                <span>transfer to</span>
            </div>
            <div className={`${cell_padding} w-full text-right`}>
                <span>outflow</span>
            </div>
            <div className={`${cell_padding} w-full text-right`}>
                <span>inflow</span>
            </div>
            <button className={`${cell_padding} p-1 opacity-0 pointer-events-none`}>
                <Trash size={18} />
            </button>
        </div>
    )
}

const DraftTransactionRow = ({ transaction, setDraftTransaction, onSave, accountMap, categoryMap }: { transaction: Partial<Transaction>, setDraftTransaction: React.Dispatch<React.SetStateAction<Partial<Transaction> | null>>, onSave: () => void, accountMap: Record<string, Account>, categoryMap: Record<string, CategoryView> }) => {
    return (
        <div className={`${row_spacing} w-full flex items-center bg-neutral-950`}>
            <div className={`${cell_padding} w-full`}>
                <input name="date" type="date"
                    value={transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : ''}
                    onChange={(e) => setDraftTransaction(prev => prev ? ({ ...prev, date: new Date(e.target.value).getTime() }) : prev)}
                    className="w-full" />
            </div>
            <div className={`${cell_padding} w-full`}>
                <select
                    value={transaction.accountId ?? ''}
                    onChange={(e) => setDraftTransaction(prev => prev ? { ...prev, accountId: e.target.value } : prev)}
                >
                    <option value="">select account</option>
                    {Object.values(accountMap).map(a => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                </select>
            </div>
            <div className={`${cell_padding} w-full`}>
                <select
                    value={transaction.categoryId ?? ''}
                    onChange={(e) => setDraftTransaction(prev => prev ? { ...prev, categoryId: e.target.value } : prev)} >
                    <option value="">select category</option>
                    {Object.values(categoryMap).map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>
            <div className={`${cell_padding} w-full`}>
                <select
                    value={transaction.toAccountId ?? ''}
                    onChange={(e) => setDraftTransaction(prev => prev ? { ...prev, toAccountId: e.target.value || null } : prev)} >
                    <option value="">no transfer</option>
                    {Object.values(accountMap).map(a => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                </select>
            </div>
            <div className={`${cell_padding} w-full text-right`}>
                <input
                    type="number"
                    placeholder="0.00"
                    value={transaction.amount && transaction.amount < 0 ? -transaction.amount : ''}
                    onChange={(e) => {
                        const value = Number(e.target.value)
                        setDraftTransaction(prev =>
                            prev ? { ...prev, amount: value ? -value : 0 } : prev
                        )
                    }}
                />
            </div>
            <div className={`${cell_padding} w-full text-right`}>
                <input
                    type="number"
                    placeholder="0.00"
                    value={transaction.amount && transaction.amount > 0 ? transaction.amount : ''}
                    onChange={(e) => {
                        const value = Number(e.target.value)
                        setDraftTransaction(prev =>
                            prev ? { ...prev, amount: value || 0 } : prev
                        )
                    }}
                />
            </div>
            <button onClick={onSave} className={`${cell_padding} text-right p-1`}>
                <PlusCircle size={18} />
            </button>
        </div>
    )
}

const TransactionRow = ({ transaction, accountMap, categoryMap, onDelete }: { transaction: Transaction, accountMap: Record<string, Account>, categoryMap: Record<string, CategoryView>, onDelete: (transactionId: string) => void }) => {
    const transactionDate = new Date(transaction.date).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })
    const accountName = accountMap[transaction.accountId]?.name ?? 'unknown account'
    const categoryName = transaction.categoryId
        ? categoryMap[transaction.categoryId]?.name ?? 'unknown category'
        : 'no category'
    const transferAccountName = transaction.toAccountId
        ? accountMap[transaction.toAccountId]?.name ?? 'unknown account'
        : 'no transfer'
    const inflow = transaction.amount > 0 ? transaction.amount : 0
    const outflow = transaction.amount < 0 ? -transaction.amount : 0

    return (
        <div className={`${row_spacing} w-full flex items-center`}>
            <div className={`${cell_padding} w-full`}>
                <span>{transactionDate}</span>
            </div>
            <div className={`${cell_padding} w-full`}>
                <span>{accountName}</span>
            </div>
            <div className={`${cell_padding} w-full`}>
                <span>{categoryName}</span>
            </div>
            <div className={`${cell_padding} w-full`}>
                <span>{transferAccountName}</span>
            </div>
            <div className={`${cell_padding} w-full text-right`}>
                <span>{outflow}</span>
            </div>
            <div className={`${cell_padding} w-full text-right`}>
                <span>{inflow}</span>
            </div>
            <button onClick={() => onDelete(transaction.id)} className={`${cell_padding} text-right p-1`}>
                <Trash size={18} />
            </button>
        </div>
    )
}

export const TransactionsView = ({ transactions }: { transactions: Transaction[] }) => {
    const accounts = useBudgetStore(s => s.accounts)
    const categoryGroups = useBudgetStore(s => s.monthlyBudgets['202602']?.categoryGroups)
    const [draftTransaction, setDraftTransaction] = useState<Partial<Transaction> | null>(null)
    const router = useRouter()

    if (!accounts || !categoryGroups) return null

    const handleSave = async () => {
        if (!draftTransaction) return

        if (!draftTransaction.accountId) {
            toast.error('ow man: please select an account')
            return
        }

        if (!draftTransaction.amount) {
            toast.error('ow man: amount cannot be zero')
            return
        }

        if (!draftTransaction.date) {
            toast.error('ow man:please select a date')
            return
        }

        if (!draftTransaction.categoryId && !draftTransaction.toAccountId) {
            toast.error('ow man: please select a category or a transfer account')
            return
        }

        try {
            const { id, updatedAccounts } = await createTransaction('V1P1gGXgk5EixClmmI1d', draftTransaction)
            console.log(id, updatedAccounts);
            setDraftTransaction(null)
            router.refresh()
            toast.success(':) good luck: transaction saved')

        } catch (error) {
            console.error('failed to save transaction:', error)
            toast.error(':( bad luck: transaction couldn\'t be saved')
        }
    }

    const handleDelete = async (transactionId: string) => {

        try {
            const yes = await deleteTransaction('V1P1gGXgk5EixClmmI1d', transactionId)
            console.log(yes);
            router.refresh()
            toast.success('transaction deleted')
        } catch (error) {
            console.error('failed to delete transaction:', error)
            toast.error(':( bad luck: transaction couldn\'t be deleted')
        }
    }


    const accountMap = Object.fromEntries(accounts.map(a => [a.id, a]))
    const categoryMap = Object.fromEntries(categoryGroups.flatMap(g => g.categories).map(c => [c.id, c]))

    return (
        <div className="w-full flex flex-col">
            <div className="w-full h-24 flex items-center justify-center">
                <h1 className="text-2xl font-extralight">transactions</h1>
            </div>

            <div className="px-3 w-full">
                <button
                    onClick={() => setDraftTransaction({
                        date: Date.now(),
                        accountId: '',
                        categoryId: '',
                        toAccountId: null,
                        amount: 0,
                    })}
                    className="flex px-3 py-2 gap-2.5 items-center hover:bg-neutral-100 hover:text-neutral-950">
                    <PlusCircle size={18} />
                    <span>add transaction</span>
                </button>
            </div>

            <TableHeader />
            {draftTransaction && <DraftTransactionRow transaction={draftTransaction} setDraftTransaction={setDraftTransaction} onSave={handleSave} accountMap={accountMap} categoryMap={categoryMap} /> }
            {transactions.map(transaction => (
                <TransactionRow key={transaction.id}
                    transaction={transaction}
                    accountMap={accountMap}
                    categoryMap={categoryMap}
                    onDelete={handleDelete}
                />
            ))}
        </div>
    )
}