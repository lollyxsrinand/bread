import PlanSummary from './PlanSummary'
import Topbar from './Topbar'
import PlanView from './PlanView'
import { BudgetHydrator } from '@/store/budget-hydrator'
import { getMonthlyBudgetView } from '@/lib/actions/budget.actions'
import { requireUser } from '@/utils/require-user'

const Plan = async ({ params }: { params: Promise<{ month: string }> }) => {
  const user = await requireUser()
  const { month } = await params

  const monthlyBudget = await getMonthlyBudgetView(user.currentBudgetId, month)
  return (
    <>
      <BudgetHydrator monthlyBudget={monthlyBudget} />
      <div className='h-full w-full flex'>
        <div className='w-full h-full flex flex-col'>
          <Topbar month={month} />
          <PlanView month={month} />
        </div>
        <div className='w-64'>
          <PlanSummary />
        </div>
      </div>
    </>
  )
}

export default Plan