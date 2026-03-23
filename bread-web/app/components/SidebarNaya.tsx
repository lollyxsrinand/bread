'use client'

import { useBudgetStore } from "@/store/budget-store"
import { Account } from "bread-core/src"
import { ArrowUpRight, Banknote, Calendar, CalendarDays, ChartColumn, ChartNoAxesColumn, ChevronDown, ChevronsUpDownIcon, LogOut, MoreHorizontal, PiggyBank, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { JSX, useMemo } from "react"

// probably create custom class in globals.css
const sidebar_item_classes = 'h-11 w-full px-4 py-2 rounded-xl hover:bg-neutral-800 transition-colors flex justify-between items-center'

const LinkRow = ({ icon, label, href }: { icon: JSX.Element, label: string, href: string }) => {
    const pathname = usePathname()
    const is_active = pathname.startsWith(href)
    return (
        <Link href={href} className={`${sidebar_item_classes} ${is_active ? 'bg-neutral-800' : ''}`}>
            <div className="flex gap-2.5 items-center">
                {icon}
                <span className="text-lg">{label}</span>
            </div>
        </Link>
    )
}


const Links = () => {
    return (
        <div className="flex flex-col gap-1 border-t border-t-neutral-800 pt-2.5">
            <LinkRow
                icon={<Calendar size={18} />}
                label="plan"
                href="/plan"
            />
            <LinkRow
                icon={<ChartNoAxesColumn size={18} />}
                label="reports"
                href="/reports"
            />
            <LinkRow
                icon={<Banknote size={18} />}
                label="transactions"
                href="/transactions"
            />
            <LinkRow
                icon={<PiggyBank size={18} />}
                label="all accounts"
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

const AccountRow = ({ account }: { account: Account }) => {
    return (
        <div className={`${sidebar_item_classes} group`}>
            <div className="flex gap-2.5 items-center">
                <button className=" text-neutral-500 hover:bg-neutral-400 hover:text-neutral-50 transition-colors rounded-md">
                    <MoreHorizontal className="opacity-0 group-hover:opacity-100 transition-all" size={18} />
                </button>
                <span className="text-neutral-500">{account.name}</span>
            </div>
            <div>
                <span className="tabular-nums text-neutral-500">{formatBalance(account.balance)}</span>
            </div>
        </div>
    )
}

const AccountGroupRow = ({ name, accounts }: { name: string, accounts: Account[] }) => {
    return (
        <div>
            {/* name of the account type */}
            <div className={`${sidebar_item_classes}`}>
                <div className="flex gap-2.5 items-center">
                    <ChevronDown size={18} />
                    <span className="text-lg">{name}</span>
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

const Accounts = () => {
    const accountsMap = useBudgetStore(s => s.accounts)
    if (!accountsMap) return null

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
            <span className={`h-11 w-full px-4 py-2 flex justify-between items-center text-neutral-500 text-lg`}>accounts</span>
            {Object.entries(accountsGrouped).map(([name, accounts]) => (
                <AccountGroupRow key={name} name={name} accounts={accounts} />
            ))}

            <button className="px-4 py-2 flex items-center justify-center hover:bg-neutral-100 hover:text-black transition-colors rounded-xl">add account</button>
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

const SidebarNaya = () => {

    return (
        <div className='w-64 h-full border-r border-r-neutral-800 p-2.5 flex flex-col gap-2.5'>

            {/* header thing */}
            <div className={`${sidebar_item_classes}`}>
                <div className="flex gap-2.5">
                    {/* place holder icon */}
                    <div className="h-5 w-5"></div>
                    <span>my budget</span>
                </div>
                <ChevronsUpDownIcon size={18} />
            </div>

            {/* Links */}
            <Links />

            {/* Accounts */}
            {/* todo: feature: be able to add accounts into view so only they load in the sidebar */}
            {/* todo: feature: three dot icon on hovering over an account to either delete or update the account*/}
            <Accounts />

            {/* <SidebarFooter /> */}
        </div>
    )
}

export default SidebarNaya