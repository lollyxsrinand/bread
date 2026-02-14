import { getUser } from '@/lib/actions/user.actions'
import { getBudgetMonth } from '@/lib/actions/budget.actions'
import { Topbar } from './Topbar'
import { PlanSummary } from './PlanSummary'
import { PlanView } from './PlanView'

const Plan = async ({ params }: { params: Promise<{ month: string }> }) => {
    const { month } = await params
    const user = await getUser() 
    const budgetMonth = await getBudgetMonth(user.currentBudgetId, month)
    console.log(budgetMonth)
    return (
        <div className="h-full w-full flex flex-col">
            <Topbar />
            <div className="h-full w-full flex flex-1">
                <PlanView categoryGroups={budgetMonth} month={month} />
                <PlanSummary />
            </div>
        </div>
    )
}

export default Plan