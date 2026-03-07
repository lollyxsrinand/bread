import PlanSummary from './PlanSummary'
import Topbar from './Topbar'
import PlanView from './PlanView'
import { BudgetHydrator } from '@/store/budget-hydrator'
import { getBudget, getBudgetView} from '@/lib/actions/budget.actions'
import { requireUser } from '@/utils/require-user'
import { redirect } from 'next/navigation'

const Plan = async ({ params }: { params: Promise<{ month: string }> }) => {
  const user = await requireUser()
  const { month } = await params

  const budget = await getBudget(user.currentBudgetId)
  if (month > budget.maxMonth || month < budget.minMonth) {
    redirect(`/plan/${budget.maxMonth}`)
  }

  // does this cache?
  const budgetView = await getBudgetView(user.currentBudgetId, month)
  return (
    <>
      <BudgetHydrator budget={budget} budgetView={budgetView} />
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