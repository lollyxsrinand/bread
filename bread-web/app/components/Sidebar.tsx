'use client'

import { closeAccount, createAccount, updateAccount } from "@/lib/actions/account.actions"
import { useBudgetStore } from "@/store/budget-store"
import { Account, Budget, getCurrentMonthId } from "bread-core/src"
import { ArrowUpRight, Banknote, Calendar, CalendarDays, ChartColumn, ChartNoAxesColumn, ChevronDown, ChevronsUpDownIcon, Edit2, Info, LogOut, LucideInfo, MoreHorizontal, PiggyBank, Settings, TriangleAlert, X } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { JSX, SetStateAction, useMemo, useState } from "react"
import { toast } from "react-toastify"

// probably create custom class in globals.css
const sidebar_item_classes = 'w-full px-4 py-2 rounded-xl hover:bg-neutral-800 transition-colors flex justify-between items-center'

const LinkRow = ({ icon, label, href }: { icon: JSX.Element, label: string, href: string }) => {
    const pathname = usePathname()
    const router = useRouter()
    const is_active = pathname.startsWith(href)
    return (
        <div onClick={() => router.push(href)} className={`${sidebar_item_classes} ${is_active ? 'bg-neutral-800' : ''}`}>
            <div className="flex gap-2.5 items-center">
                {icon}
                <span>{label}</span>
            </div>
        </div>
    )
}


const Links = () => {
    return (
        <div className="flex flex-col gap-1 border-t border-t-neutral-800 pt-2.5">
            <LinkRow
                icon={<Calendar size={16} />}
                label="plan"
                href={`/plan/${getCurrentMonthId()}`}
            />
            <LinkRow
                icon={<ChartNoAxesColumn size={16} />}
                label="reports"
                href="/reports"
            />
            <LinkRow
                icon={<Banknote size={16} />}
                label="transactions"
                href="/transactions"
            />
            <LinkRow
                icon={<PiggyBank size={16} />}
                label="accounts"
                href="/accounts"
            />
        </div>
    )
}

// format balance in indian format with rupee sign and also format floating point numbers to 2 decimal places
const formatBalance = (balance: number) => {
    const formatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })

    return formatter.format(balance)
}

const EditAccountPrompt = ({ setShowEditAccountPrompt, budget, account }: { setShowEditAccountPrompt: React.Dispatch<SetStateAction<boolean>>, budget: Budget, account: Account }) => {
    const [name, setName] = useState(account.name)
    const [type, setType] = useState(account.type)

    const handleCloseAccount = async () => {
        try {
            if (account.balance !== 0) {
                toast.error("balance must be 0 to close account")
                return
            }
            const closedAccount = await closeAccount(budget.id, account.id)
            const state = useBudgetStore.getState()
            const updatedAccount = {
                ...state.accounts[account.id],
                ...closedAccount
            }

            state.setPartial({
                accounts: {
                    ...state.accounts,
                    [account.id]: updatedAccount
                }
            })
            toast.success("account closed successfully")
        } catch (error) {
            console.log(error)
            toast.error('failed to close account')
        }
    }

    const handleUpdateAccount = async () => {
        try {
            const updatedAccount = await updateAccount(budget.id, account.id, { name, type })
            const state = useBudgetStore.getState()

            state.setPartial({
                accounts: {
                    ...state.accounts,
                    [account.id]: updatedAccount
                }
            })
            toast.success("account updated successfully")
            setShowEditAccountPrompt(false)
        } catch (error) {
            toast.error("something went wrong")
            console.log(error)
        }
    }

    return (
        <div className="h-full w-full flex justify-center items-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 backdrop-blur-xs">
            <div className="flex flex-col justify-center items-center w-86 gap-6 py-6 px-10 rounded-xl bg-neutral-950 border border-neutral-800">
                <span className="text-2xl text-neutral-100 font-extralight">edit account</span>

                <div className="flex flex-col w-full gap-2.5">
                    <input
                        className="px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 focus:outline-none focus:ring-2 ring-neutral-600 transition-all"
                        type="text"
                        onChange={(e) => setName(e.target.value)}
                        value={name}
                        placeholder="account name" />

                    <select
                        className="px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 focus:outline-none focus:ring-2 ring-neutral-600 transition-all appearance-none"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        name="type">
                        <option value="">type</option>
                        <option value="cash">cash</option>
                        <option value="savings">savings</option>
                        <option value="checking">checking</option>
                        <option value="investments">investments</option>
                    </select>


                    <div className="p-2 text-neutral-500 bg-neutral-900 rounded-xl flex gap-2">
                        <p className="text-sm font-extralight text-neutral-500">to update balance make a -ve income transaction under this account</p>
                        <div>
                            <Info size={16} />
                        </div>
                    </div>

                    <button
                        onClick={handleUpdateAccount}
                        className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-100 hover:text-black transition-colors" type="submit">
                        save
                    </button>
                    <button
                        className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-100 hover:text-black transition-colors"
                        type="button"
                        onClick={handleCloseAccount}
                    >
                        close account
                    </button>
                    <button
                        className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-100 hover:text-black transition-colors"
                        type="button"
                        onClick={() => setShowEditAccountPrompt(false)}
                    >
                        cancel
                    </button>
                </div>
            </div>
        </div>
    )
}

const AccountRow = ({ account }: { account: Account }) => {
    const budget = useBudgetStore(s => s.budget)
    if (!budget) return
    const [showEditAccountPrompt, setShowEditAccountPrompt] = useState(false)

    return (
        <div className={`${sidebar_item_classes} group`}>
            <div className="flex gap-2.5 items-center">
                <button
                    onClick={() => setShowEditAccountPrompt(true)}
                    className=" text-neutral-500 transition-colors rounded-md">
                    <Edit2 className="opacity-0 group-hover:opacity-100 hover:text-neutral-100 transition-all" size={16} />
                </button>
                <span className="text-neutral-500">{account.name}</span>
            </div>
            <div>
                <span className="tabular-nums text-neutral-500 text-sm">{formatBalance(account.balance)}</span>
            </div>
            {showEditAccountPrompt && <EditAccountPrompt setShowEditAccountPrompt={setShowEditAccountPrompt} budget={useBudgetStore.getState().budget!} account={account} />}
        </div>
    )
}

const AccountGroupRow = ({ name, accounts }: { name: string, accounts: Account[] }) => {
    const totalBalance = useMemo(() => {
        return accounts.reduce((sum, account) => sum + account.balance, 0)
    }, [accounts])
    return (
        <div className="flex flex-col gap-1">
            {/* name of the account type */}
            <div className={`${sidebar_item_classes}`}>
                <div className="flex gap-2.5 items-center">
                    <ChevronDown size={16} />
                    <span>{name}</span>
                </div>
                <div>
                    <span className="tabular-nums text-sm">{formatBalance(totalBalance)}</span>
                </div>
            </div>

            {/* all the accounts of type render below */}
            <div className="flex flex-col gap-1">
                {accounts.map(account => (
                    <AccountRow key={account.id} account={account} />
                ))}
            </div>
        </div>
    )
}

const CreateAccountPrompt = ({ setShowCreateAccountPrompt }: { setShowCreateAccountPrompt: React.Dispatch<SetStateAction<boolean>> }) => {
    const budget = useBudgetStore(s => s.budget)
    if (!budget) return
    const [name, setName] = useState('')
    const [balance, setBalance] = useState(0)
    const [type, setType] = useState('')

    const handleCreateAccount = async () => {
        try {
            if (!name || !type) {
                toast.error("all fields are required")
                return
            }

            const state = useBudgetStore.getState()
            const res = await createAccount(budget.id, { name, type, balance })

            const updatedTransactions = {
                ...state.transactions,
                [res.transaction.id]: res.transaction
            }
            const updatedAccounts = {
                ...state.accounts,
                [res.account.id]: res.account
            }
            res.updatedAccounts.map(acc => updatedAccounts[acc.id].balance = acc.balance)

            const updatedBudget = {
                ...budget,
                ...res.updatedBudget
            }

            state.setPartial({
                budget: updatedBudget,
                transactions: updatedTransactions,
                accounts: updatedAccounts
            })
            toast.success('account created successfully')
            setShowCreateAccountPrompt(false)
        } catch (error) {
            toast.error("something went wrong")
            console.log(error)
        }
    }

    return (
        <div className="h-full w-full flex justify-center items-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 backdrop-blur-xs">
            <div className="flex flex-col justify-center items-center w-86 gap-6 py-6 px-10 rounded-xl bg-neutral-950 border border-neutral-800">
                <span className="text-2xl text-neutral-100 font-extralight">create account</span>

                <div className="flex flex-col w-full gap-2.5">
                    <input
                        className="px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 focus:outline-none focus:ring-2 ring-neutral-600 transition-all"
                        type="text"
                        onChange={(e) => setName(e.target.value)}
                        placeholder="account name" />
                    <select
                        className="px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 focus:outline-none focus:ring-2 ring-neutral-600 transition-all appearance-none"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        name="type">
                        <option value="">type</option>
                        <option value="cash">cash</option>
                        <option value="savings">savings</option>
                        <option value="checking">checking</option>
                        <option value="investments">investments</option>
                    </select>

                    <input
                        className="px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 focus:outline-none focus:ring-2 ring-neutral-600 transition-all"
                        type="number"
                        onChange={(e) => setBalance(parseInt(e.target.value))}
                        placeholder="balance"
                    />

                    <div className="p-2 text-neutral-500 bg-neutral-900 rounded-xl flex gap-2">
                        <p className="text-sm font-extralight text-neutral-500">a transaction of ₹{balance} will created to initiate balance</p>
                        <div>
                            <Info size={16} />
                        </div>
                    </div>

                    <button
                        onClick={handleCreateAccount}
                        className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-100 hover:text-black transition-colors" type="submit">
                        create account
                    </button>
                    <button
                        className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-100 hover:text-black transition-colors"
                        type="button"
                        onClick={() => setShowCreateAccountPrompt(false)}
                    >
                        cancel
                    </button>
                </div>
            </div>
        </div>
    )
}
const Accounts = () => {
    const accountsMap = useBudgetStore(s => s.accounts)
    const budget = useBudgetStore(s => s.budget)
    const [showCreateAccountPrompt, setShowCreateAccountPrompt] = useState(false)
    if (!accountsMap && !budget) return null

    const accounts = useMemo(
        () => Object.values(accountsMap).filter(acc => !acc.isClosed),
        [accountsMap]
    )

    const accountsGrouped = useMemo(() => {
        const groups: Record<string, Account[]> = {}
        for (const account of accounts) {
            if (!groups[account.type]) groups[account.type] = []
            groups[account.type].push(account)
        }
        return groups
    }, [accounts])

    return (
        <div className="flex flex-col gap-1 border-t border-t-neutral-800 pt-2.5">
            <span className={`w-full px-4 py-2 flex justify-between items-center text-neutral-500`}>accounts</span>
            {Object.entries(accountsGrouped).map(([name, accounts]) => (
                <AccountGroupRow key={name} name={name} accounts={accounts} />
            ))}

            <button
                className="px-4 py-2 flex items-center justify-center hover:bg-neutral-100 hover:text-black bg-neutral-900 transition-colors rounded-xl"
                onClick={() => setShowCreateAccountPrompt(true)}
            >
                add account
            </button>
            {showCreateAccountPrompt && <CreateAccountPrompt setShowCreateAccountPrompt={setShowCreateAccountPrompt} />}
        </div>
    )
}

// const SidebarFooter = () => {
//     return (
//         <div className="border-t border-t-neutral-800 pt-2.5">
//             <LinkRow
//                 icon={<Settings size={18} />}
//                 label="settings"
//                 href="/settings"
//             />
//         </div>
//     )
// }

const Sidebar = () => {
    return (
        <div className='w-64 h-full border-r border-r-neutral-800 p-2.5 flex flex-col gap-2.5'>

            {/* header thing */}
            <div className={`${sidebar_item_classes}`}>
                <div className="flex gap-2.5">
                    {/* place holder icon */}
                    <div className="h-5 w-5"></div>
                    <span>my budget</span>
                </div>
                <ChevronsUpDownIcon size={16} />
            </div>

            {/* Links */}
            <Links />

            {/* Accounts */}
            {/* todo: feature: be able to add accounts into view so only they load in the sidebar */}
            {/* todo: feature: three dot icon on hovering over an account to either delete or update the account*/}
            {/* todo: make edit comp */}
            <Accounts />

            {/* <button className="px-4 py-2 flex items-center justify-center hover:bg-neutral-100 hover:text-black bg-neutral-900 border border-neutral-800 transition-colors rounded-xl">logout</button> */}

            {/* <SidebarFooter /> */}
        </div>
    )
}

export default Sidebar