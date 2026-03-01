'use client'
import { rolloverToNextMonth } from "@/lib/actions/category.actions"
import { useBudgetStore } from "@/store/budget-store"
import { Budget, CategoryGroupView, CategoryView, getNextMonthId, getPreviousMonthId } from "bread-core/src"
import { ChevronDown, ChevronLeftCircle, ChevronRightCircle, PlusCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

const Toolbar = ({ month, budget }: { month: string, budget: Budget }) => {
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
    const router = useRouter()

    const handleCreateNextMonth = async () => {
        try {
            const res = await rolloverToNextMonth(budget.id)
            console.log(res);
            router.push(`/plan/${getNextMonthId(month)}`)   
        } catch (error) {
            console.log(error);
            toast.error('Failed to create next month')
        }
    }

    return (
        <div className="w-full h-fit flex px-3 ">
            <div className="flex px-3 py-2 items-center gap-1">
                {budget.minMonth < month ?
                    <button className="p-1" onClick={() => router.push(`/plan/${getPreviousMonthId(month)}`)}>
                        <ChevronLeftCircle size={18} />
                    </button>
                    :
                    <button className="p-1">
                        <ChevronLeftCircle size={18} className="opacity-50" />
                    </button>
                }
                <span>{monthNames[parseInt(month.slice(5, 7)) - 1]}</span>
                {budget.maxMonth > month ?
                    <button className="p-1" onClick={() => router.push(`/plan/${getNextMonthId(month)}`)}>
                        <ChevronRightCircle size={18} />
                    </button>
                    :
                    <button className="p-1" onClick={handleCreateNextMonth}>
                        <PlusCircle size={18} />
                    </button>
                }
            </div>
        </div>
    )
}

const Header = () => {
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

const CategoryGroupRow = ({ budget, categoryGroup, month }: { budget: Budget, categoryGroup: CategoryGroupView, month: string }) => {
    return (
        <div>
            <div className="w-full px-3 flex gap-2.5 group">
                <div className="px-3 py-2 w-full flex items-center gap-1">
                    <button className="p-1">
                        <ChevronDown size={18} />
                    </button>
                    <span>{categoryGroup.name}</span>
                    <button className="p-1 group-hover:opacity-100 opacity-0 pointer-events-none group-hover:pointer-events-auto">
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
                <CategoryRow budget={budget} category={category} key={category.id} month={month} />
            ))}
        </div>
    )
}

const CategoryRow = ({ budget, category, month }: { budget: Budget, category: CategoryView, month: string }) => {
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
                    onBlur={() => assignToCategory(budget.id, month, category.id, parseInt(assigned) || 0)}
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

const PlanView = ({ budget, month }: { budget: Budget, month: string }) => {
    const monthlyBudget = useBudgetStore(s => s.monthlyBudgets[month])
    if (!monthlyBudget) {
        return null
    }

    return (
        <div className="h-full w-full flex flex-col">
            <Toolbar month={month} budget={budget}/>
            <Header />
            {monthlyBudget.categoryGroups.map(categoryGroup => (
                <CategoryGroupRow budget={budget} categoryGroup={categoryGroup} key={categoryGroup.id} month={month} />
            ))}
        </div>
    )
}

export default PlanView