'use client'

import { useToggle } from "@/app/hooks/useToggle"
import { ArrowLeftCircle, ArrowRightCircle, LucideChevronDown, LucideChevronRight, LucidePlusCircle } from "lucide-react"
import { useRouter } from "next/navigation"

const CategoryRow = ({ category }: { category: any }) => {
    return (
        <div className="w-full flex justify-between px-2.5">
            <div className="flex items-center">
                <LucideChevronDown size={18} className="cursor-pointer m-2 opacity-0" />
                <span className="select-none">{category.name}</span>
            </div>

            <div className="flex gap-2.5 items-center">
                <span className="w-24 text-right tabular-nums">{category.budgeted}</span>
                <span className="w-24 text-right tabular-nums">{category.activity}</span>
                <span className="w-24 text-right tabular-nums">{category.available}</span>
            </div>
        </div>
    )
}
const CategoryGroupRow = ({ categoryGroup }: { categoryGroup: any }) => {
    const { value: open, toggle } = useToggle(true)
    return (
        <div>
            <div className="w-full flex justify-between px-2.5">
                <div className="flex items-center">
                    <button onClick={toggle}>
                        {open
                            ? <LucideChevronDown size={18} className="cursor-pointer m-2" />
                            : <LucideChevronRight size={18} className="cursor-pointer m-2" />}
                    </button>
                    <span className="font-bold select-none">{categoryGroup.name}</span>
                </div>
            </div>
            {open && categoryGroup.categories.map((category: any, idx: number) => (
                <CategoryRow key={idx} category={category} />
            ))}
        </div>
    )
}

export const PlanView = ({ categoryGroups, month }: { categoryGroups: any, month: string }) => {
    const router = useRouter()
    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
    const monthNum = parseInt(month.slice(4, 6), 10) - 1
    const incrementMonth = () => {
        const nextMonth = new Date(parseInt(month.slice(0, 4), 10), monthNum, 1)
        nextMonth.setMonth(nextMonth.getMonth() + 1)
        router.replace(`/plan/${nextMonth.getFullYear()}${(nextMonth.getMonth() + 1).toString().padStart(2, '0')}`) 
    }
    const decrementMonth = () => {
        const previousMonth = new Date(parseInt(month.slice(0, 4), 10), monthNum, 1)
        previousMonth.setMonth(previousMonth .getMonth() - 1)
        router.replace(`/plan/${previousMonth.getFullYear()}${(previousMonth .getMonth() + 1).toString().padStart(2, '0')}`) 
    }

    return (
        <div className="h-full flex-1 flex flex-col items-center  p-2.5">
            <div className="w-full p-2.5">
                <div className="inline-flex items-center">
                    <ArrowLeftCircle onClick={decrementMonth} size={18} className="cursor-pointer m-2" />
                    <span className="font-bold select-none w-12 text-center">{monthNames[monthNum]}</span>
                    <ArrowRightCircle onClick={incrementMonth} size={18} className="cursor-pointer m-2" />
                </div>
            </div>

            <div className="w-full flex flex-col">
                <div className="w-full flex justify-between p-2.5">
                    <div className="flex items-center">
                        <LucidePlusCircle size={18} className="cursor-pointer m-2" />
                        <span className="font-bold select-none">categories</span>
                    </div>
                    <div className="flex gap-2.5 items-center">
                        <span className="w-24 text-right font-bold select-none">assigned</span>
                        <span className="w-24 text-right font-bold select-none">activity</span>
                        <span className="w-24 text-right font-bold select-none">available</span>
                    </div>
                </div>

                {categoryGroups.map((categoryGroup: any, idx: number) => (
                    <CategoryGroupRow key={idx} categoryGroup={categoryGroup} />
                ))}
            </div>

        </div>
    )
}


