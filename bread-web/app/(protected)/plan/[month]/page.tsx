import { getUser } from '@/lib/actions/user.actions'
import PlanSummary from './PlanSummary'
import Topbar from './Topbar'
import PlanView from './PlanView'
import { redirect } from 'next/navigation'

const Plan = async ({ params }: { params: Promise<{ month: string }> }) => {
  const user = await getUser()
  if (!user || !user.currentBudgetId) {
    redirect('/login')
  }

  const { month } = await params

  return (
    <div className='h-full w-full flex'>
      <div className='w-full h-full flex flex-col'>
        <Topbar month={month} />
        <PlanView month={month} />
      </div>
      <div className='w-64'>
        <PlanSummary />
      </div>
    </div>
  )
}

export default Plan