'use client'

import { useBudgetStore } from "@/store/budget-store"
import { PlusCircle } from "lucide-react"
import { Transaction, Category } from "bread-core"

const row_spacing = 'px-3 py-2.5 gap-2.5'
const cell_padding = 'px-3 py-2.5'
const TransactionRow = ({ transaction, accountName, categoryName }: { transaction: Transaction, accountName: string, categoryName: string }) => {

    return (
        <div>

        </div>
    )
}

export const TransactionsView = ({ transactions, groupedCategories }: { transactions: Transaction[], groupedCategories: Record<string, { id: string, name: string, createdAt: {}, categories: Record<string, Category> }> }) => {
    const accounts = useBudgetStore(s => s.accounts)
    const categoryGroupsMap = Object.values(groupedCategories).map(group => ({
    }))
    // categoryGroups.map(group => {
    //     Object.values(group.categories).map(category => {
    //         category.
    //     })
    // })

    return (
        <div className="w-full flex flex-col">
            <div className="w-full h-24 flex items-center justify-center">
                <h1 className="text-2xl font-extralight">transactions</h1>
            </div>

            <div className="px-3 w-full">
                <button onClick={() => null} className="flex px-3 py-2.5 gap-2.5 items-center">
                    <PlusCircle size={18} />
                    <span className="">add transaction</span>
                </button>
            </div>

            {/* table index */}
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
                <div className="opacity-100 p-2">
                    <PlusCircle size={18} />
                </div>
            </div>

        </div>
    )
}