import { getUser } from '@/lib/actions/user.actions'
import { Topbar } from './Topbar'
import { PlanSummary } from './PlanSummary'
import { PlanView } from './PlanView'
import { redirect } from 'next/navigation'
import { getBudget, getBudgetMonth } from '@/lib/actions/budget.actions'

const Plan = async ({ params }: { params: Promise<{ month: string }> }) => {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  if(!user.currentBudgetId) {
    return <h1>hi mom, i think u dont have any budgets i promise to come back. fix this. so when u delete all ur budgets. u will still be able to make a new budget.</h1>
  }

  const { month } = await params

  // promise.all fetches parallely omg
  const [budget, budgetMonth] = await Promise.all([
    getBudget(user.currentBudgetId),
    getBudgetMonth(user.currentBudgetId, month)
  ])

  return (
    <div className="h-full w-full flex flex-col">
      <Topbar />
      <div className="h-full w-full flex flex-1">
        <PlanView categoryGroups={budgetMonth} month={month} minMonth={budget.minMonth} maxMonth={budget.maxMonth} />
        <PlanSummary />
      </div>
    </div>
  )
}

export default Plan