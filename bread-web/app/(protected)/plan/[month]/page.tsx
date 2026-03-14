import PlanSummary from './PlanSummary'
import Topbar from './Topbar'
import PlanView from './PlanView'
import { BudgetHydrator } from '@/store/budget-hydrator'
import { getBudget, getBudgetView} from '@/lib/actions/budget.actions'
import { requireUser } from '@/utils/require-user'
import { redirect } from 'next/navigation'
import { getCategories, getCategoryEntries, getCategoryGroups, getMonthSummary } from '@/lib/actions/category.actions'
import { generateBudgetView } from 'bread-core/src'

const Plan = async ({ params }: { params: Promise<{ month: string }> }) => {
  const user = await requireUser()
  const { month } = await params

  const budget = await getBudget(user.currentBudgetId)
  if (month > budget.maxMonth || month < budget.minMonth) {
    redirect(`/plan/${budget.maxMonth}`)
  }
  
  const categories = await getCategories(budget.id)
  const categoryGroups = await getCategoryGroups(budget.id)
  const categoryEntries = await getCategoryEntries(budget.id, month)
  const monthSummary = await getMonthSummary(budget.id, month)

  const budgetView = generateBudgetView(categories, categoryGroups, categoryEntries, monthSummary, month, budget)

  // does this cache?
  // const budgetView = await getBudgetView(user.currentBudgetId, month)
  return (
    <>
      <BudgetHydrator budget={budget} budgetView={budgetView} />
      <div className='h-full w-full flex'>
          <PlanView month={month} />
        <div className='w-64'>
          <PlanSummary />
        </div>
      </div>
    </>
  )
}

export default Plan