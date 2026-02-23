import { getUser } from '@/lib/actions/user.actions'
import { Topbar } from './Topbar'
import { PlanSummary } from './PlanSummary'
import { PlanView } from './PlanView'
import { redirect } from 'next/navigation'

const Plan = async ({ params }: { params: Promise<{ month: string }> }) => {
  const user = await getUser()
  if (!user || !user.currentBudgetId) {
    redirect('/login')
  }

  const { month } = await params

  return (
    <div className="h-full w-full flex flex-col">
      <Topbar />
      <div className="h-full w-full flex flex-1">
        <PlanView month={month} />
        <PlanSummary />
      </div>
    </div>
  )
}

export default Plan