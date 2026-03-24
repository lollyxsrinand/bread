'use client'

import { createTransaction, deleteTransaction } from "@/lib/actions/transaction.actions"
import { useBudgetStore } from "@/store/budget-store"
import { Account, Budget, Category, Transaction } from "bread-core/src"
import { Plus, PlusCircle, Trash } from "lucide-react"
import { useState } from "react"
import { toast } from "react-toastify"

const HeaderColumns = () => {
    return (
        <div className="px-8 py-1 w-full h-12 border-t-2 border-neutral-800 flex justify-around items-center">
            <div className="w-36 p-2.5 font-bold">date</div>
            <div className="w-36 p-2.5 font-bold">type</div>
            <div className="w-36 p-2.5 font-bold">account name</div>
            <div className="w-36 p-2.5 font-bold">category</div>
            <div className="w-36 p-2.5 font-bold text-right">to account</div>
            <div className="w-36 p-2.5 font-bold text-right">amount</div>
            <button className="h-fit w-fit p-2.5 hover:bg-neutral-100 hover:text-black  rounded-full transition-colors bg-neutral-900 border border-neutral-800">
                <Plus size={18} />
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
    const toAccountName = type === 'transfer' ? accounts[transaction.toAccountId].name : 'none'
    const categoryName = toAccountName === 'none' && type === 'category' ? categories[transaction.categoryId].name : 'readytoassign'
    const amount = transaction.amount

    const handleDeleteTransaction = async () => {
        try {
            const res = await deleteTransaction(budget.id, transaction.id)
            const state = useBudgetStore.getState()
            const updatedAccounts = {
                ...state.accounts
            }
            res.updatedAccounts.map(acc => updatedAccounts[acc.id] = {...updatedAccounts[acc.id], balance: acc.balance})

            // idk if this is legal
            delete state.transactions[transaction.id]

            state.setPartial({
                accounts: updatedAccounts,
                // transactions: updatedTransactions
            })
        } catch (error) {
            console.log("horrrrrible")
        }
    }

    return (
        <div className="px-8 py-1 w-full h-12 border-t-2 border-neutral-800 flex justify-around items-center">
            <div className="p-2.5 w-36">{parsedDate}</div>
            <div className="p-2.5 w-36">{type}</div>
            <div className="p-2.5 w-36">{accountName}</div>
            <div className="p-2.5 w-36">{categoryName}</div>
            <div className="p-2.5 w-36 text-right">{toAccountName}</div>
            <div className="p-2.5 w-36 text-right">{amount}</div>
            <button onClick={handleDeleteTransaction} className="h-fit w-fit p-2.5 hover:bg-neutral-100 hover:text-black  rounded-full transition-colors">
                <Trash size={18} />
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

            state.setPartial({
                accounts: updatedAccounts,
                transactions: updatedTransactions
            })

        } catch (error) {
            toast.error('failed to create txn bro better lick next time')
        }
    }


    return (
        <div className="px-8 py-1 w-full h-12 border-t-2 border-neutral-800 flex justify-around items-center">
            {/* take date input */}
            <input
                value={date}
                onChange={(e) => setDate(e.target.value)}
                type="date"
                className="w-36 p-2.5 font-bold"
            />

            {/* take txn type input */}
            <select
                name="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-36 p-2.5 font-bold"
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
                className="w-36 p-2.5 font-bold"
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
                className="w-36 p-2.5 font-bold"
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
                className="w-36 p-2.5 font-bold text-right"
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
            className="w-36 p-2.5 font-bold text-right"></input>

            <button 
            onClick={handleCreateTransaction}
            className="h-fit w-fit p-2.5 hover:bg-neutral-100 hover:text-black  rounded-full transition-colors bg-neutral-900 border border-neutral-800">
                <Plus size={18} />
            </button>
        </div>
    )
}

export const TransactionsView = () => {
    const transactions = useBudgetStore(s => s.transactions)
    const budget = useBudgetStore(s => s.budget)
    const accounts = useBudgetStore(s => s.accounts)
    const categories = useBudgetStore(s => s.categories)
    if (!transactions || !accounts || !categories || !budget) {
        return <h1>we are loading...</h1>
    }

    const transactionsList = Object.values(transactions)

    // const { value: showDraftTransaction, toggle, setValue:  } = useToggle(false)
    const [showDraftTransaction, setShowDraftTransaction] = useState<boolean>(false)


    return (
        <div className="h-full w-full flex flex-col gap-2.5 p-2.5">
            <div className="h-28 w-full flex justify-center items-center">
                <span className="text-2xl">
                    transactions
                </span>
            </div>

            <button onClick={() => setShowDraftTransaction(!showDraftTransaction)} className="w-fit p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-100 hover:text-black hover:border-neutral-100 transition-colors">
                <div className="flex items-center justify-center gap-2.5">
                    {/* <Plus size={16} /> */}
                    <span>new transaction</span>
                </div>
            </button>

            <div>
                {/* display column names */}
                <HeaderColumns />

                {/* transactions list */}
                <div className="w-full flex flex-col">
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