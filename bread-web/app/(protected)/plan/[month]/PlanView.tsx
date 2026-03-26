'use client'
import { assignToCategory, createCategory, rolloverToNextMonth } from "@/lib/actions/category.actions"
import { useBudgetStore } from "@/store/budget-store"
import { Budget, BudgetView, CategoryGroupView, CategoryView, generateBudgetView, getNextMonthId, getPreviousMonthId } from "bread-core/src"
import { ChevronDown, ChevronLeftCircle, ChevronRightCircle, Plus, PlusCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { SetStateAction, useEffect, useState } from "react"
import { toast } from "react-toastify"
import { useBudgetView } from "@/app/hooks/useBudgetView"
const formatBalance = (balance: number) => {
    const formatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })

    return formatter.format(balance)
}

const Topbar = ({ budgetView, budget }: { budgetView: BudgetView, budget: Budget }) => {
    return (
        <div className="h-24 w-full flex items-center justify-center">
            <span className="text-2xl">{formatBalance(budget.totalIncome - budget.totalAssigned)} is available to assign</span>
        </div>
    )
}

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
                <span>{monthNames[parseInt(month.slice(4, 7)) - 1]}</span>
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

const DraftCategory = ({ setShowDraftCategory, categoryGroupId, budget }: { setShowDraftCategory: React.Dispatch<SetStateAction<boolean>>, categoryGroupId: string, budget: Budget }) => {
    const [name, setName] = useState('')
    const handleCreateCategory = async () => {
        try {
            const res = await createCategory(budget.id, name, categoryGroupId)
            const state = useBudgetStore.getState()
            const updatedCategories = {
                ...state.categories,
                res
            }

            state.setPartial({
                categories: updatedCategories,
            })

            console.log(res);
        } catch (error) {
            console.log(error)
            toast.error('Failed to create category')
        }
    }
    return (
        <div className="w-full px-3 gap-2.5 flex">
            <div className="px-3 py-2 w-full flex items-center gap-1">
                <button className="p-1 opacity-0 pointer-events-none cursor-none">
                    <ChevronDown size={18} />
                </button>
                <input className="bg-neutral-900 w-full border border-neutral-800 rounded-lg p-1 focus:outline-none focus:ring-2 focus:ring-neutral-600"
                    type="text"
                    onChange={(e) => setName(e.target.value)}
                    placeholder="category name"
                    value={name}
                />
            </div>
            <button className="px-3 py-2 w-full flex items-center gap-1"
                onClick={handleCreateCategory}
            >
                <div className="flex gap-2 items-center justify-center rounded-full hover:bg-neutral-100 bg-neutral-900 border border-neutral-800 p-1 transition-colors hover:text-black">
                    <Plus size={18} />
                </div>
            </button>
        </div>
    )
}

const CategoryGroupRow = ({ budget, categoryGroup, month }: { budget: Budget, categoryGroup: CategoryGroupView, month: string }) => {
    const [showDraftCategory, setShowDraftCategory] = useState(false)
    return (
        <div>
            <div className="w-full px-3 flex gap-2.5 group">
                <div className="px-3 py-2 w-full flex items-center gap-1">
                    <button className="p-1">
                        <ChevronDown size={18} />
                    </button>
                    <span>{categoryGroup.name}</span>
                    <button
                        className="p-1 group-hover:opacity-100 opacity-0 pointer-events-none group-hover:pointer-events-auto transition-all"
                        onClick={() => setShowDraftCategory(!showDraftCategory)}
                    >
                        <PlusCircle className="" size={18} />
                    </button>
                </div>
                <div className="px-3 py-2 w-full flex items-center gap-1 justify-end">
                    <span>{categoryGroup.assigned}</span>
                </div>
                <div className="px-3 py-2 w-full flex items-center gap-1 justify-end">
                    <span>{categoryGroup.activity}</span>
                </div>
                <div className="px-3 py-2 w-full flex items-center gap-1 justify-end">
                    <span>{categoryGroup.available}</span>
                </div>
            </div>
            {showDraftCategory &&
                <DraftCategory
                    setShowDraftCategory={setShowDraftCategory}
                    categoryGroupId={categoryGroup.id}
                    budget={budget}
                />
            }
            {categoryGroup.categories.map(category => (
                <CategoryRow budget={budget} category={category} key={category.id} month={month} />
            ))}
        </div>
    )
}

const CategoryRow = ({ budget, category, month }: { budget: Budget, category: CategoryView, month: string }) => {
    const [assigned, setAssigned] = useState(category.assigned.toString())

    const handleAssignToCategory = async () => {
        try {
            const newAssigned = parseInt(assigned)
            if (category.assigned - newAssigned === 0) {
                return
            }
            const res = await assignToCategory(budget.id, category.id, month, newAssigned)

            const state = useBudgetStore.getState()
            const updatedCategoryEntries = {
                ...state.monthlyCategoryEntries,
            }
            Object.values(res.updatedCategoryEntries).map(entry => {
                updatedCategoryEntries[entry.month] = {
                    ...updatedCategoryEntries[entry.month],
                    [entry.id]: entry,
                }
            })

            // const updatedBudget = {
            //     ...budget,
            //     ...res.updatedBudget
            // }
            if (state.budget) {
                state.budget.totalAssigned = res.updatedBudget.totalAssigned
            }

            state.setPartial({
                // budget: updatedBudget,
                monthlyCategoryEntries: updatedCategoryEntries,
            })
        } catch (error) {
            console.log(error)
            toast.error('Failed to assign to category')
        }
    }

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
                    onBlur={handleAssignToCategory}
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
    const budget = useBudgetStore(s => s.budget)
    const budgetView = useBudgetView(month)

    if (!budget || !budgetView) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <span>Loading...</span>
            </div>
        )
    }

    return (
        <div className='w-full h-full flex flex-col'>
            <Topbar budgetView={budgetView} budget={budget} />

            <div className="h-full w-full flex flex-col">
                <Toolbar month={month} budget={budget} />
                <Header />

                {budgetView.categoryGroups.map(categoryGroup => (
                    <CategoryGroupRow
                        budget={budget}
                        categoryGroup={categoryGroup}
                        key={categoryGroup.id}
                        month={month}
                    />
                ))}
            </div>
        </div>
    )
}

export default PlanView