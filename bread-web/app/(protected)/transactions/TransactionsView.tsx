'use client'

import { createTransaction, deleteTransaction } from "@/lib/actions/transaction.actions"
import { useBudgetStore } from "@/store/budget-store"
import { Account, Budget, Category, Transaction } from "bread-core/src"
import { MoreHorizontal, Plus, PlusCircle, Trash } from "lucide-react"
import { useState } from "react"
import { toast } from "react-toastify"

const HeaderColumns = () => {
    return (
        <div className="px-4 py-2 w-full flex justify-around items-center gap-2.5 hover:bg-neutral-950 transition-colors">
            <div className="flex-1 px-2 py-1">date</div>
            <div className="flex-1 px-2 py-1">type</div>
            <div className="flex-1 px-2 py-1">account name</div>
            <div className="flex-1 px-2 py-1">category</div>
            <div className="flex-1 px-2 py-1 text-right">to account</div>
            <div className="flex-1 px-2 py-1 text-right">amount</div>
            <button className="p-1 hover:bg-neutral-100 hover:text-black rounded-full transition-colors bg-neutral-900 border border-neutral-800">
                <Plus size={16} />
            </button>
        </div>
    )
}
interface TransactionViewProps {
    transaction: Transaction
    accounts: Record<string, Account>
    categories: Record<string, Category>
    budget: Budget
}
const TransactionView = ({ transaction, accounts, categories, budget }: TransactionViewProps) => {
    const dateObj = new Date(transaction.date)
    const day = `${dateObj.getDate()}`.padStart(2, '0')
    const month = `${dateObj.getMonth()+1}`.padStart(2, '0')
    const year = dateObj.getFullYear()
    const parsedDate = `${day}/${month}/${year}`

    const type = transaction.type
    const accountName = accounts[transaction.accountId].name
    // const toAccountName = type === 'transfer' ? accounts[transaction.toAccountId].name : '-'
    // const categoryName = toAccountName === '-' && type === 'category' ? categories[transaction.categoryId].name : 'readytoassign'
    let toAccountName = '-'
    let categoryName = '-'
    if (type === 'transfer') {
        toAccountName = accounts[transaction.toAccountId].name
    } else if (type === 'category') {
        categoryName = categories[transaction.categoryId].name
    } else if (type === 'income') {
        categoryName = 'ready to assign'
    }


    const amount = transaction.amount

    const handleDeleteTransaction = async () => {
        try {
            const res = await deleteTransaction(budget.id, transaction.id)
            const state = useBudgetStore.getState()
            const updatedAccounts = {
                ...state.accounts
            }
            res.updatedAccounts.map(acc => updatedAccounts[acc.id] = {...updatedAccounts[acc.id], balance: acc.balance})

            delete state.transactions[transaction.id]

            state.setPartial({
                accounts: updatedAccounts,
            })
        } catch (error) {
            console.log("horrrrrible")
        }
    }

    return (
        <div className="px-4 py-2 w-full flex justify-around items-center gap-2.5 border-t border-neutral-800 hover:bg-neutral-900 transition-colors">
            <div className="flex-1 px-2 py-1">{parsedDate}</div>
            <div className="flex-1 px-2 py-1">{type}</div>
            <div className="flex-1 px-2 py-1">{accountName}</div>
            <div className="flex-1 px-2 py-1">{categoryName}</div>
            <div className={`flex-1 px-2 py-1 text-right ${toAccountName === '-' ? 'text-neutral-600': 'text-neutral-50'}`}>{toAccountName}</div>
            <div className="flex-1 px-2 py-1 text-right">{amount}</div>
            <button onClick={() => null} className="p-1 transition-colors border border-transparent text-neutral-600 hover:text-neutral-100">
                <MoreHorizontal size={16} />
            </button>
        </div>
    )
}

interface DraftTransactionProps {
    accounts: Record<string, Account>
    categories: Record<string, Category>
    budget: Budget
    setShowDraftTransaction: React.Dispatch<React.SetStateAction<boolean>>
}
const DraftTransaction = ({ accounts, categories, budget, setShowDraftTransaction }: DraftTransactionProps) => {
    const [date, setDate] = useState("")
    const [type, setType] = useState("")
    const [accountId, setAccountId] = useState("")
    const [categoryId, setCategoryId] = useState("")
    const [toAccountId, setToAccountId] = useState("")
    const [amount, setAmount] = useState(0)

    const handleCreateTransaction = async () => {
        try {
            const res = await createTransaction(budget.id, {
                date: new Date(date).getTime(),
                type,
                accountId,
                categoryId,
                toAccountId,
                amount
            })
            const state = useBudgetStore.getState()
            const updatedAccounts = {
                ...state.accounts
            }

            const updatedTransactions = {
                ...state.transactions,
                [res.transaction.id]: res.transaction
            }
            res.updatedAccounts.map(acc => updatedAccounts[acc.id] = {...updatedAccounts[acc.id], balance: acc.balance})
            const updatedBudget = {
                ...budget
            }
            if (res.type === 'income') {
                updatedBudget.totalIncome = res.updatedBudget.totalIncome
            }

            // todo: update the category entries
            state.setPartial({
                accounts: updatedAccounts,
                transactions: updatedTransactions,
                budget: updatedBudget,
            })

        } catch (error) {
            toast.error('failed to create txn bro better lick next time')
        }
    }


    return (
        <div className="px-4 py-2 w-full flex justify-around items-center gap-2.5 border-t border-neutral-800 hover:bg-neutral-950 transition-colors">
            {/* take date input */}
            <input
                value={date}
                onChange={(e) => setDate(e.target.value)}
                type="date"
                className="px-2 py-1 flex-1 rounded-lg bg-neutral-900 border border-neutral-800 focus:outline-none focus:ring-2 ring-neutral-600 transition-all"
            />

            {/* take txn type input */}
            <select
                name="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="px-2 py-1 flex-1 rounded-lg bg-neutral-900 border border-neutral-800 focus:outline-none focus:ring-2 ring-neutral-600 transition-all appearance-none"
            >
                <option value="">type</option>
                <option value="category">category</option>
                <option value="transfer">transfer</option>
                <option value="income">income</option>
            </select>

            {/* select account */}
            <select
                name="account"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="px-2 py-1 flex-1 rounded-lg bg-neutral-900 border border-neutral-800 focus:outline-none focus:ring-2 ring-neutral-600 transition-all appearance-none"
            >
                <option value="">account</option>
                {Object.values(accounts).map(account => (
                    <option key={account.id} value={account.id}>{account.name}</option>
                ))}
            </select>

            {/* select category */}
            <select
                name="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="px-2 py-1 flex-1 rounded-lg bg-neutral-900 border border-neutral-800 focus:outline-none focus:ring-2 ring-neutral-600 transition-all appearance-none"
            >
                <option value="">category</option>
                {Object.values(categories).map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                ))}
            </select>

            {/* select to account */}
            <select
                name="toAccount"
                value={toAccountId}
                onChange={(e) => setToAccountId(e.target.value)}
                className="px-2 py-1 text-right flex-1 rounded-lg bg-neutral-900 border border-neutral-800 focus:outline-none focus:ring-2 ring-neutral-600 transition-all appearance-none"
            >
                <option value="">to account</option>
                {Object.values(accounts).map(account => (
                    <option key={account.id} value={account.id}>{account.name}</option>
                ))}
            </select>

            <input 
            type="number"
            placeholder="amount"
            onChange={(e) => setAmount(parseInt(e.target.value))}
            className="px-2 py-1 flex-1 text-right rounded-lg bg-neutral-900 border border-neutral-800 focus:outline-none focus:ring-2 ring-neutral-600 transition-all" />

            <button 
            onClick={handleCreateTransaction}
            className="p-1 hover:bg-neutral-100 hover:text-black rounded-full transition-colors bg-neutral-900 border border-neutral-800">
                <Plus size={16} />
            </button>
        </div>
    )
}

export const TransactionsView = () => {
    const transactions = useBudgetStore(s => s.transactions)
    const budget = useBudgetStore(s => s.budget)
    const accounts = useBudgetStore(s => s.accounts)
    const categories = useBudgetStore(s => s.categories)
    const [showDraftTransaction, setShowDraftTransaction] = useState<boolean>(false)
    if (!transactions || !accounts || !categories || !budget) {
        return <h1>loading...</h1>
    }

    const transactionsList = Object.values(transactions)

    // const { value: showDraftTransaction, toggle, setValue:  } = useToggle(false)


    return (
        <div className="h-full w-full flex flex-col gap-2.5 p-2.5">
            {/* <div className="h-28 w-full flex items-center">
                <span className="text-2xl">
                    transactions
                </span>
            </div> */}

            <button onClick={() => setShowDraftTransaction(!showDraftTransaction)} className="w-fit p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-100 hover:text-black hover:border-neutral-100 transition-colors">
                <div className="flex items-center justify-center gap-2.5">
                    {/* <Plus size={16} /> */}
                    <span>new transaction</span>
                </div>
            </button>

            <div className="border-2 border-neutral-800 rounded-xl overflow-hidden">
                {/* display column names */}
                <HeaderColumns />

                {/* transactions list */}
                <div className="w-full flex flex-col justify-between">
                    {showDraftTransaction && 
                    <DraftTransaction 
                    accounts={accounts} 
                    categories={categories}
                    budget={budget} 
                    setShowDraftTransaction={setShowDraftTransaction}
                    />}
                    {transactionsList.map(transaction =>
                        <TransactionView
                            key={transaction.id}
                            transaction={transaction}
                            accounts={accounts}
                            categories={categories}
                            budget={budget}
                        />)
                    }
                </div>
            </div>
        </div>
    )
}

export default TransactionsView