'use client'

import { useToggle } from "@/app/hooks/useToggle"
import { assignToCategory } from "@/lib/actions/category.actions"
import { useBudgetStore } from "@/store/budget-store"
import { ArrowLeftCircle, ArrowRightCircle, LucideChevronDown, LucideChevronRight, LucidePlusCircle } from "lucide-react"

const CategoryRow = ({ category }: { category: any }) => {
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const budgeted = formData.get('budgeted')
        const amount = parseInt(budgeted as string)

        const res = await assignToCategory('V1P1gGXgk5EixClmmI1d',category.id, '202602', amount)
        console.log(res);
    }
    return (
        <div className="w-full flex justify-between px-2.5">
            <div className="flex items-center">
                <LucideChevronDown size={18} className="cursor-pointer m-2 opacity-0" />
                <span className="select-none">{category.name}</span>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2.5 items-center">
                <input name="budgeted" className="w-24 text-right placeholder:text-white" type="text" placeholder={category.budgeted} />
                <span className="w-24 text-right tabular-nums" >{category.activity}</span>
                <span className="w-24 text-right tabular-nums" >{category.available}</span>
            </form>
        </div>
    )
}

const CategoryGroupRow = ({ categoryGroup }: { categoryGroup: any }) => {
    const { value: open, toggle } = useToggle(true)
    return (
        <div>
            <div className="w-full flex justify-between px-2.5">
                <div className="flex items-center">
                    <button onClick={toggle} className="p-2">
                        {open
                            ? <LucideChevronDown size={18} />
                            : <LucideChevronRight size={18} />}
                    </button>
                    <span className="font-bold select-none">{categoryGroup.name}</span>
                </div>
                <div className="flex gap-2.5 items-center">
                    <span className="w-24 text-right tabular-nums">0</span>
                    <span className="w-24 text-right tabular-nums">0</span>
                    <span className="w-24 text-right tabular-nums">0</span>
                </div>
            </div>
            <div>
                {open && categoryGroup.categories.map((category: any, idx: number) => (
                    <CategoryRow key={idx} category={category} />
                ))}
            </div>
        </div>
    )
}

export const PlanView = ({ month }: { month: string }) => {
    const monthlyBudget = useBudgetStore(s => s.monthlyBudgets[month])
    if (!monthlyBudget) {
        return null
    }
    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
    const monthNum = parseInt(month.slice(4, 6), 10) - 1

    // TODO: navigation between months
    const incrementMonth = () => {
        // const nextMonth = new Date(parseInt(month.slice(0, 4), 10), monthNum, 1)
        // if (parseInt(maxMonth) === parseInt(month)) {
        //     console.log('we create next month?');
        // }
        // nextMonth.setMonth(nextMonth.getMonth() + 1)
        // router.replace(`/plan/${nextMonth.getFullYear()}${(nextMonth.getMonth() + 1).toString().padStart(2, '0')}`) 
    }
    const decrementMonth = () => {
        // const previousMonth = new Date(parseInt(month.slice(0, 4), 10), monthNum, 1)
        // if (parseInt(minMonth) === parseInt(month)) {
        //     console.log("we cant go back any further :(");
        // }
        // previousMonth.setMonth(previousMonth .getMonth() - 1)
        // router.replace(`/plan/${previousMonth.getFullYear()}${(previousMonth .getMonth() + 1).toString().padStart(2, '0')}`) 
    }

    return (
        <div className="h-full flex-1 flex flex-col items-center  p-2.5">
            <div className="w-full p-2.5 flex items-center">
                <div className="inline-flex items-center">
                    <button onClick={decrementMonth} className="p-2">
                        <ArrowLeftCircle size={18} />
                    </button>
                    <span className="font-bold select-none w-12 text-center">{monthNames[monthNum]}</span>
                    <button onClick={incrementMonth} className="p-2">
                        <ArrowRightCircle size={18} />
                    </button>
                </div>
            </div>

            <div className="w-full flex flex-col">
                <div className="w-full flex justify-between p-2.5">
                    <div className="flex items-center">
                        <button className="p-2">
                            <LucidePlusCircle size={18} />

                        </button>
                        <span className="font-bold select-none">categories</span>
                    </div>
                    <div className="flex gap-2.5 items-center">
                        <span className="w-24 text-right font-bold select-none">assigned</span>
                        <span className="w-24 text-right font-bold select-none">activity</span>
                        <span className="w-24 text-right font-bold select-none">available</span>
                    </div>
                </div>

                {monthlyBudget.categoryGroups.map((categoryGroup: any, idx: number) => (
                    <CategoryGroupRow key={idx} categoryGroup={categoryGroup} />
                ))}
            </div>

        </div>
    )
}


