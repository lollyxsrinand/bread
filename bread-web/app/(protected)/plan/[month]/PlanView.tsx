'use client'
import { useBudgetStore } from "@/store/budget-store"
import { CategoryGroupView, CategoryView } from "bread-core"
import { ChevronDown, ChevronLeftCircle, ChevronRightCircle, PlusCircle } from "lucide-react"
import { useEffect, useState } from "react"

const PlanToolBar = ({ month }: { month: string }) => {
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
    
    return (
        <div className="w-full h-fit flex px-3 ">
            <div className="flex px-3 py-2 items-center gap-1">
                <button className="p-1">
                    <ChevronLeftCircle size={18} />
                </button>
                <span>{monthNames[parseInt(month.slice(5, 7)) - 1]}</span>
                <button className="p-1">
                    <ChevronRightCircle size={18} />
                </button>
            </div>
        </div>
    )
}

const PlanHeader = () => {
    
    return (
        <div className="w-full px-3 flex gap-2.5">
            <div className="px-3 py-2 w-full flex items-center gap-1">
                <button className="p-1">
                    <PlusCircle size={18} />
                </button>
                <span>category</span>
            </div>
            <div className="px-3 py-2 w-full flex items-center gap-1 justify-end">
                <span>assigned</span>
            </div>
            <div className="px-3 py-2 w-full flex items-center gap-1 justify-end">
                <span>activity</span>
            </div>
            <div className="px-3 py-2 w-full flex items-center gap-1 justify-end">
                <span>available</span>
            </div>
        </div>
    )
}

const CategoryGroupRow = ({ categoryGroup }: { categoryGroup: CategoryGroupView }) => {

    return (
        <div>
            <div className="w-full px-3 flex gap-2.5">
                <div className="px-3 py-2 w-full flex items-center gap-1">
                    <button className="p-1">
                        <ChevronDown size={18} />
                    </button>
                    <span>{categoryGroup.name}</span>
                    <button className="p-1">
                        <PlusCircle size={18} />
                    </button>
                </div>
                <div className="px-3 py-2 w-full flex items-center gap-1 justify-end">
                    <span>0</span>
                </div>
                <div className="px-3 py-2 w-full flex items-center gap-1 justify-end">
                    <span>0</span>
                </div>
                <div className="px-3 py-2 w-full flex items-center gap-1 justify-end">
                    <span>0</span>
                </div>
            </div>
            {categoryGroup.categories.map(category => (
                <CategoryRow category={category} key={category.id} />
            ))}
        </div>
    )
}

const CategoryRow = ({ category }: { category: CategoryView }) => {
    const [assigned, setAssigned] = useState(category.budgeted.toString())  
    const assignToCategory = useBudgetStore(s => s.assignToCategory)

    useEffect(() => {
        setAssigned(category.budgeted.toString())
    }, [category.budgeted])

    return (
        <div className="w-full px-3 gap-2.5 flex">
            <div className="px-3 py-2 w-full flex items-center gap-1">
                <button className="p-1 opacity-0">
                    <ChevronDown size={18} />
                </button>
                <span>{category.name}</span>
            </div>
            <div className="px-3 py-2 w-full flex items-center gap-1 justify-end">
                <input className="text-right bg-transparent w-full" 
                type="number" 
                onChange={(e) => setAssigned(e.target.value)} 
                value={assigned} 
                onBlur={() => assignToCategory('202602', category.id, parseInt(assigned) || 0)}
                />
            </div>
            <div className="px-3 py-2 w-full flex items-center gap-1 justify-end">
                <span>{category.activity}</span>
            </div>
            <div className="px-3 py-2 w-full flex items-center gap-1 justify-end">
                <span>{category.available}</span>
            </div>
        </div>
    )
}

const PlanView = ({ month }: { month: string }) => {
    const monthlyBudget = useBudgetStore(s => s.monthlyBudgets[month])
    if (!monthlyBudget) {
        return null
    }

    return (
        <div className="h-full w-full flex flex-col">
            <PlanToolBar month={month} />
            <PlanHeader />
            {monthlyBudget.categoryGroups.map(categoryGroup => (
                <CategoryGroupRow categoryGroup={categoryGroup} key={categoryGroup.id} />
            ))}
        </div>
    )
}

export default PlanView