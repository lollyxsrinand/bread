'use client'
import { Banknote, Calendar, ChartNoAxesColumn, Divide, LucideChevronDown, LucideChevronRight, Settings, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useToggle } from '../hooks/useToggle'
import { Account } from 'bread-core/src'
import { useBudgetStore } from '@/store/budget-store'
import { useEffect, useState } from 'react'
import { createAccount } from '@/lib/actions/account.actions'

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

const CreateAccount = ({ handleCreateNewAccount, showCreateAccount, setShowCreateAccount }: {handleCreateNewAccount: any, showCreateAccount: boolean, setShowCreateAccount: React.Dispatch<React.SetStateAction<boolean>> }) => {
    const [name, setName] = useState<string>('')
    const [type, setType] = useState<string>('')
    const [balance, setBalance] = useState<number>(0)
    
    const budget = useBudgetStore(s => s.budget)




    return (
        <div className='fixed h-full w-full flex items-center justify-center'>
            <div className='h-fit w-92 bg-neutral-900 rounded-xl p-5 text-center flex flex-col justify-around gap-12'>
                <span className='text-2xl'>create account</span>
                <div className='flex flex-col gap-2.5'>
                    <input onChange={(e) => setName(e.currentTarget.value)} className='px-4 py-2 focus:outline-none border border-neutral-700 rounded-xl' name='name' type="text" placeholder='name' />
                    <select onChange={(e) => setType(e.currentTarget.value)} className='px-4 py-2 focus:outline-none border border-neutral-700 rounded-xl' name="type" id="">
                        <option value="">account type</option>
                        <option value="checking">checking</option>
                        <option value="savings">savings</option>
                        <option value="cash">cash</option>
                    </select>
                    <input onChange={(e) => setBalance(parseInt(e.currentTarget.value))} className='px-4 py-2 focus:outline-none border border-neutral-700 rounded-xl' name='balance' type="number" placeholder='current balance'/>
                    <button className='w-full rounded-xl hover:bg-neutral-50 transition-colors hover:text-black py-2 px-4' onClick={() => handleCreateNewAccount({name, type, balance})}>create account</button>
                    <button className='w-full rounded-xl hover:bg-neutral-50 transition-colors hover:text-black py-2 px-4' onClick={() => setShowCreateAccount(false)}>cancel</button>
                </div>

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
    const budget = useBudgetStore(s => s.budget)
    const [showCreateAccount, setShowCreateAccount] = useState(false)
    const pathname = usePathname()

    if (pathname === '/settings') {
        return null
    }

    const accountsGrouped = accounts.reduce((acc, account) => {
        if (!acc[account.type]) acc[account.type] = []
        acc[account.type].push(account)
        return acc
    }, {} as Record<string, Account[]>)

    const handleCreateNewAccount = async ({name, type, balance}: {name: string, type: string, balance: number}) => {
        console.log(name, type, balance);
        try {
            const account = await createAccount(budget.id, {name, type, balance})
            accounts.push(account)
        } catch (error) {
            console.log(error);
        }
    }

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
                {Object.entries(accountsGrouped).map(([name, accounts]) => (
                    <AccountGroupRow key={name} name={name} accounts={accounts} />
                ))}
            </div>

            <div className='w-full flex items-center justify-center'>
                <button onClick={() => setShowCreateAccount(!showCreateAccount)} className='w-full px-4 py-2 hover:bg-neutral-50 hover:text-neutral-950 rounded-xl transition-colors'>add account</button>
            </div>
            {showCreateAccount && <CreateAccount handleCreateNewAccount={handleCreateNewAccount} showCreateAccount={showCreateAccount} setShowCreateAccount={setShowCreateAccount} />}
        </div>
    )
}

export default Sidebar