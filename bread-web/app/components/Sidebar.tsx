'use client'
import { Banknote, Calendar, ChartNoAxesColumn, LucideChevronDown, LucideChevronRight, Settings } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useToggle } from '../hooks/useToggle'
import { Account } from 'bread-core/src'
import { useBudgetStore } from '@/store/budget-store'

const AccountLink = ({ account }: { account: Account }) => {
    return (
        <Link href="#" className='px-4 py-2 flex justify-between'>
            <div className='flex items-center gap-2'>
                <LucideChevronDown size={18} className='opacity-0' />
                <span>{account.name}</span>
            </div>
            <span className='tabular-nums'>{account.balance}</span>
        </Link>
    )
}

const AccountGroupRow = ({ name, accounts }: { name: string, accounts: Account[] }) => {
    const { value: open, toggle: toggle } = useToggle(true)
    return (
        <div className='flex flex-col'>
            <button onClick={toggle} className='px-4 py-2 gap-2 flex items-center rounded-lg hover:bg-neutral-900'>
                {open
                    ? <LucideChevronDown size={18} />
                    : <LucideChevronRight size={18} />}
                <span className='font-bold'>{name}</span>
            </button>
            <div>
                {open && accounts.map((account: Account) => (
                    <AccountLink key={account.id} account={account} />
                ))}
            </div>
        </div>
    )
}

const SidebarLink = ({ href, label, icon }: { href: string, label: string, icon: any }) => {
    const pathname = usePathname()
    return (
        <Link href={href} className={`py-2 px-4 items-center ${pathname === href ? 'bg-neutral-950' : ''} rounded-lg cursor-pointer flex gap-2 hover:bg-neutral-900`}>
            {icon}
            <span>{label}</span>
        </Link>
    )
}

const Sidebar = () => {
    const accounts = useBudgetStore(s => s.accounts)
    const pathname = usePathname()

    if (pathname === '/settings') {
        return null
    }

    const accountsGrouped = accounts.reduce((acc, account) => {
        if (!acc[account.type]) acc[account.type] = []
        acc[account.type].push(account)
        return acc
    }, {} as Record<string, Account[]>)

    return (
        <div className="w-64 text-white p-2 flex flex-col gap-2">
            <div className='px-4 py-2 flex items-center justify-between'>
                <span className='font-bold'>bread</span>
                <Link href="/settings" className='text-sm text-neutral-500 hover:text-white transition-colors p-2'>
                    <Settings size={18} />
                </Link>
            </div>

            <div className='flex flex-col gap-6'>
                <div className='flex flex-col gap-1'>
                    <SidebarLink href='/plan' label="plan" icon={<Calendar size={18} />} />
                    <SidebarLink href='/reports' label="reports" icon={<ChartNoAxesColumn size={18} />} />
                    <SidebarLink href='/transactions' label="transactions" icon={<Banknote size={18} />} />
                </div>
            </div>

            <div className='flex flex-col gap-1'>
                <span className='font-bold px-4 py-2'>accounts</span>
                {Object.entries(accountsGrouped).map(([accountGroupName, accounts]) => (
                    <AccountGroupRow key={accountGroupName} name={accountGroupName} accounts={accounts as Account[]} />
                ))}
            </div>
        </div>
    )
}

export default Sidebar