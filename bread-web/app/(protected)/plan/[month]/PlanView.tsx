'use client'
import { assignToCategory, createCategory, getCategoryEntries, renameCategory, renameCategoryGroup, rolloverToNextMonth } from "@/lib/actions/category.actions"
import { useBudgetStore } from "@/store/budget-store"
import { Budget, BudgetView, CategoryGroupView, CategoryView, generateBudgetView, getNextMonthId, getPreviousMonthId, MonthId } from "bread-core/src"
import { ArrowLeft, ArrowRight, ChevronDown, ChevronLeftCircle, ChevronRight, ChevronRightCircle, Edit2, Plus, PlusCircle } from "lucide-react"
import { useParams, usePathname, useRouter } from "next/navigation"
import { SetStateAction, useEffect, useState } from "react"
import { toast } from "react-toastify"
import { useBudgetView } from "@/app/hooks/useBudgetView"
import { formatBalance } from "@/utils/format-balance"


const Topbar = ({ budget }: { budget: Budget }) => {
    const available = formatBalance(budget.totalIncome - budget.totalAssigned)
    return (
        <div className="w-full h-24 flex justify-center items-center">
            <div className="">
                <p className="text-lg">{available} is available to assign</p>
                <p className="text-neutral-500 hover:text-neutral-100 text-sm transition-colors font-light">you need to make this number 0</p>
            </div>
        </div>
    )
}

const CreateCategoryPrompt = ({setShowCreateCategoryPrompt} : { setShowCreateCategoryPrompt: React.Dispatch<SetStateAction<boolean>>}) => {
    const categoryGroups = useBudgetStore(s => s.categoryGroups)
    const budget = useBudgetStore(s => s.budget)
    if (!categoryGroups) return null
    const [categoryName, setCategoryName] = useState("")
    const [categoryGroupId, setCategoryGroupId] = useState("")

    const handleCreateCategory = async () => {
        if (!categoryName || !categoryGroupId) {
            toast.error("please fill out all fields")
            return
        }
        if (categoryName === 'readytoassign') {
            toast.error("category name cannot be 'readytoassign'")
            return
        }

        try {
            const res = await createCategory(budget.id, categoryName, categoryGroupId)
            const state = useBudgetStore.getState()
            const updatedCategories = {
                ...state.categories,
                [res.id]: res,
            }
            state.setPartial({
                categories: updatedCategories,
            })

            toast.success("created category")
            setShowCreateCategoryPrompt(false)
        } catch (error) {
            toast.error("failed to create category")
            console.log(error)
        }
    }

    return (
        <div className="h-full w-full flex justify-center items-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 backdrop-blur-xs">
            <div className="flex flex-col justify-center items-center w-86 gap-6 py-6 px-10 rounded-xl bg-neutral-950 border border-neutral-800">
                <span className="text-2xl text-neutral-100 font-extralight">create a category</span>

                <div className="flex flex-col w-full gap-2.5">
                    <input
                        className="px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 focus:outline-none focus:ring-2 ring-neutral-600 transition-all"
                        type="text"
                        onChange={(e) => setCategoryName(e.target.value)}
                        value={categoryName}
                        placeholder="category name" />

                    <select
                        className="px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 focus:outline-none focus:ring-2 ring-neutral-600 transition-all appearance-none"
                        value={categoryGroupId}
                        onChange={(e) => setCategoryGroupId(e.target.value)}
                        name="type">
                            {Object.values(categoryGroups).map(group => (
                                <option key={group.id} value={group.id}>{group.name}</option>
                            ))}
                    </select>


                    <button
                        onClick={handleCreateCategory}
                        className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-100 hover:text-black transition-colors" type="submit">
                        create
                    </button>
                    <button
                        className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-100 hover:text-black transition-colors"
                        type="button"
                        onClick={() => setShowCreateCategoryPrompt(false)}
                    >
                        cancel
                    </button>
                </div>
            </div>
        </div>
    )
}

const CategoryTableHeader = () => {
    const [showCreateCategoryPrompt, setShowCreateCategoryPrompt] = useState<boolean>(false)
    return (
        <div className="px-2 py-1 w-full flex items-center gap-2 justify-between  bg-neutral-950">
            {showCreateCategoryPrompt && <CreateCategoryPrompt setShowCreateCategoryPrompt={setShowCreateCategoryPrompt} /> }
            <div className="w-full flex items-center flex-1 gap-2.5">
                <div className="flex items-center justify-center min-w-4">
                    {/* i have no idea design choice. below button is pure 100% aesthetic choice */}
                    <button className="p-1 opacity-0 ring-1 ring-neutral-800 rounded-full bg-neutral-900 hover:bg-neutral-100 hover:text-black transition-colors">
                        <Plus size={16} />
                    </button>
                    <span className="px-2 py-1">category</span>
                </div>
                <button 
                className="p-1 ring-1 ring-neutral-800 rounded-full bg-neutral-900 hover:bg-neutral-100 hover:text-black transition-colors"
                onClick={() => setShowCreateCategoryPrompt(true)}
                >
                    <Plus size={16} />
                </button>
            </div>
            <span className="text-right min-w-0 flex-1 px-2 py-1">assigned</span>
            <span className="text-right flex-1 px-2 py-1">activity</span>
            <span className="text-right flex-1 px-2 py-1">available</span>
        </div>
    )
}

// why is month being passed wtf? why is budget being passed???? 
// budget can come from store and month from params why pass??????????
const CategoryRow = ({ category, budget, month }: { category: CategoryView, budget: Budget, month: string }) => {
    const [categoryName, setCategoryName] = useState(category.name)
    const [assigned, setAssigned] = useState(category.assigned)
    const handleAssignToCategory = async () => {
        try {
            if (category.assigned - assigned === 0) {
                return
            }
            const res = await assignToCategory(budget.id, category.id, month, assigned)

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

            if (state.budget) {
                state.budget.totalAssigned = res.updatedBudget.totalAssigned
            }

            state.setPartial({
                // budget: updatedBudget,
                monthlyCategoryEntries: updatedCategoryEntries,
            })
            toast.success('assigned to category')
        } catch (error) {
            console.log(error)
            toast.error('Failed to assign to category')
        }
    }
    const handleRenameCategory = async () => {
        const newName = categoryName.trim()
        if (newName === category.name) {
            return
        }

        try {
            const res = await renameCategory(budget.id, category.id, newName)
            const state = useBudgetStore.getState()
            const updatedCategories = {
                ...state.categories,
                [res.id]: res,
            }
            state.setPartial({
                categories: updatedCategories,
            })
            toast.success('renamed category')

        } catch (error) {
            console.log("failed to rename category group", error)
            toast.error('failed to rename category group')
        }
    }


    return (
        <div className="w-full px-2 py-1 flex gap-2 hover:bg-neutral-950 items-center justify-between border-t border-neutral-800 transition-colors">
            <div className='flex-1 flex items-center min-w-4 '>
                <button className="p-1 opacity-0">
                    <ChevronDown size={16} />
                </button>
                <input
                    className="flex-1 px-2 py-1 font-light focus:outline-none focus:ring-2 ring-neutral-800 focus:bg-neutral-900 rounded-lg transition-colors"
                    onChange={(e) => setCategoryName(e.target.value)}
                    onBlur={handleRenameCategory}
                    defaultValue={category.name} />
            </div>
            <input
                className="flex-1 min-w-0 px-2 py-1 focus:outline-none font-light hover:ring-1 focus:bg-neutral-900 focus:ring-2 ring-neutral-800 rounded-lg transition-colors text-right"
                type="number"
                onChange={(e) => setAssigned(parseInt(e.target.value))}
                onBlur={handleAssignToCategory}
                defaultValue={assigned} />
            <span className="flex-1 px-2 py-1 text-right font-light">{category.activity}</span>
            <span className="flex-1 px-2 py-1 text-right font-light">{category.available}</span>
        </div>
    )
}

const CategoryGroupRow = ({ categoryGroup, budget, month }: { categoryGroup: CategoryGroupView, budget: Budget, month: string }) => {
    const [categoryGroupName, setCategoryGroupName] = useState(categoryGroup.name)
    const [showCategories, setShowCategories] = useState(true)
    const handleRenameCategoryGroup = async () => {
        const newName = categoryGroupName.trim()
        if (newName === categoryGroup.name) {
            return
        }

        try {
            const res = await renameCategoryGroup(budget.id, categoryGroup.id, newName)
            const state = useBudgetStore.getState()
            const updatedCategoryGroups = {
                ...state.categoryGroups,
                [res.id]: res,
            }

            state.setPartial({
                categoryGroups: updatedCategoryGroups,
            })
            toast.success('renamed category group')
        } catch (error) {
            console.log("failed to rename category group", error)
            toast.error('failed to rename category group')
        }
    }
    return (
        <>
            <div className="w-full px-2 py-1 flex gap-2 items-center justify-between border-t border-neutral-800 bg-neutral-950" >
                <div className='flex-1 flex items-center min-w-4'>
                    <button onClick={() => setShowCategories(!showCategories)} className="p-1 text-neutral-500 hover:text-neutral-100 transition-colors">
                        {showCategories ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                    <input
                        className="flex-1 px-2 py-1 focus:outline-none focus:ring-1 ring-neutral-800 rounded-lg transition-colors"
                        onChange={(e) => setCategoryGroupName(e.target.value)}
                        onBlur={handleRenameCategoryGroup}
                        defaultValue={categoryGroupName} />
                </div>
                <span className="flex-1 px-2 py-1 text-right">{categoryGroup.assigned}</span>
                <span className="flex-1 px-2 py-1 text-right">{categoryGroup.activity}</span>
                <span className="flex-1 px-2 py-1 text-right">{categoryGroup.available}</span>
            </div>

            {showCategories && categoryGroup.categories.map(category => (
                <CategoryRow category={category} key={category.id} budget={budget} month={month} />
            ))}
        </>
    )
}

const Toolbar = () => {
    return (
        <div className="w-full">
            <NavigateMonths />
        </div>
    )
}

const NavigateMonths = () => {
    const { month: monthId } = useParams() as { month: string }
    const budget = useBudgetStore(s => s.budget)

    if (!budget || !monthId) return null

    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
    const router = useRouter()
    const year = parseInt(monthId.slice(0, 4))
    const month = parseInt(monthId.slice(4, 7))

    const handleCreateNextMonth = async () => {
        try {
            const res = await rolloverToNextMonth(budget.id)
            console.log(res);
            budget.maxMonth = getNextMonthId(budget.maxMonth)
            router.push(`/plan/${getNextMonthId(monthId)}`)
        } catch (error) {
            console.log(error);
            toast.error('Failed to create next month')
        }
    }

    return (
        <div className="flex px-2 py-1 w-fit flex-col border border-neutral-800 rounded-lg">
            <div className="flex items-center justify-center">
                <span className="w-12 text-neutral-500 text-center">{year}</span>
            </div>
            <div className="flex items-center justify-center">
                {budget.minMonth === monthId ?
                    <button
                        className="p-1 text-neutral-500 transition-colors"
                    >
                        <ArrowLeft size={16} />
                    </button>
                    :
                    <button
                        className="p-1 text-neutral-500 hover:text-neutral-100 transition-colors"
                        onClick={() => router.push(`/plan/${getPreviousMonthId(monthId)}`)}
                    >
                        <ArrowLeft size={16} />
                    </button>
                }
                <span className="w-12 text-center">{monthNames[month - 1]}</span>
                {budget.maxMonth === monthId ?
                    <button
                        className="p-1 rounded-full hover:bg-neutral-100 hover:text-black transition-colors"
                        onClick={handleCreateNextMonth}
                    >
                        <Plus size={16} />
                    </button>
                    :
                    <button
                        className="p-1 text-neutral-500 hover:text-neutral-100 transition-colors"
                        onClick={() => router.push(`/plan/${getNextMonthId(monthId)}`)}
                    >
                        <ArrowRight size={16} />
                    </button>
                }
            </div>
        </div>
    )
}

const CategoryTable = ({ budgetView, budget }: { budgetView: BudgetView, budget: Budget }) => {
    return (
        <div className="bg-black rounded-lg w-full flex flex-col border border-neutral-800 overflow-clip">
            <CategoryTableHeader />
            {budgetView.categoryGroups.map(categoryGroup => (
                <CategoryGroupRow
                    key={categoryGroup.id}
                    categoryGroup={categoryGroup}
                    budget={budget}
                    month={budgetView.month}
                />
            ))}
        </div>
    )
}

const PlanView = ({ month }: { month: string }) => {
    const budget = useBudgetStore(s => s.budget)
    const entries = useBudgetStore(s => s.monthlyCategoryEntries[month])
    const setPartial = useBudgetStore(s => s.setPartial)

    useEffect(() => {
        if (!entries) {
            getCategoryEntries(budget.id, month).then(data => {
                setPartial({
                    monthlyCategoryEntries: {
                        [month]: data,
                    }
                })
            })
        }
    }, [month, budget, setPartial, entries])

    const budgetView = useBudgetView(month)
    if (!budgetView || !budget) return <h1>loading</h1>


    return (
        <div className='w-full h-full flex flex-col'>
            <Topbar budget={budget} />
            <div className="size-full flex flex-col p-2.5 border-t border-neutral-800 gap-2.5">
                <Toolbar />
                {/* TODO: LEARN hOW TO FUCKING CREATE BEAUTIFUL TABLES USING <TABLE> OR SOMESHIT */}
                {/* warning: don't f with anyyy stylings. it's fragile af. <div> spiral*/}
                <CategoryTable budgetView={budgetView} budget={budget} />
            </div>
        </div>
    )
}

export default PlanView