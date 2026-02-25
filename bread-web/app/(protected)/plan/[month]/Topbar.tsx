'use client'

import { useBudgetStore } from "@/store/budget-store"

const Topbar = ({ month }: {month: string}) => {
    const toBeAssigned = useBudgetStore(s => s.monthlyBudgets[month]?.toBeAssigned)
    if (!toBeAssigned && toBeAssigned !== 0) {
        return null
    }
    return (
        <div className="h-24 w-full flex items-center justify-center">
            <span className="text-2xl">{toBeAssigned} available to assign</span>
        </div>
    )
}

export default Topbar