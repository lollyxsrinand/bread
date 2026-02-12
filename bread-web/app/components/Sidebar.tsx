'use client'
import { Settings } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
const accountGroups = [
    {
        name: "cash",
        accounts: [
            { name: "SBI", balance: 9500 },
        ],
    },
    {
        name: "investments",
        accounts: [
            { name: "Zerodha", balance: 47000 },
        ],
    }
]
const SidebarLink = ({ href, label }: { href: string, label: string }) => {
    const pathname = usePathname()
    return (
        <Link href={href} className={`py-2 px-4 ${pathname === href ? 'bg-neutral-950' : ''} rounded-lg cursor-pointer`}>
            {label}
        </Link>
    )
}

const AccountGroup = ({ name, accounts }: { name: string, accounts: { name: string, balance: number }[] }) => {
    return (
        <div className='flex flex-col gap-2'>
            <div className='text-sm uppercase text-neutral-500'>{name}</div>
            <div className='flex flex-col gap-1'>
                {accounts.map((account, idx) => (
                    <div key={idx} className='flex justify-between text-sm px-4 py-2 rounded-lg hover:bg-neutral-950 cursor-pointer'>
                        <span>{account.name}</span>
                        <span>₹{account.balance}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

const Sidebar = () => {
    const pathname = usePathname()
    if(pathname === '/settings') return null


    return (
        <div className="w-64 text-white p-4 flex flex-col gap-2">
            <div className='py-2 px-4 flex'>
                <span className='font-bold'>bread</span>
                <Link href="/settings" className='ml-auto text-sm text-neutral-500 hover:text-white transition-colors'>
                <Settings size={18} />
                </Link>
            </div>
            <div className='flex flex-col gap-6'>
                <div className='flex flex-col gap-2'>
                    <SidebarLink href='/home' label="plan" />
                    <SidebarLink href='/reports' label="reports" />
                    <SidebarLink href='/transactions' label="transactions" />
                </div>
                <div className='flex flex-col gap-4'>
                    {accountGroups.map((group, idx) => (
                        <AccountGroup key={idx} name={group.name} accounts={group.accounts} />
                    ))}
                </div>
            </div>

        </div>
    )
}

export default Sidebar