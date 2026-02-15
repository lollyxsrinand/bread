import { getUser } from '@/lib/actions/user.actions'
import { getBudgetMonth, getBudgets } from '@/lib/actions/budget.actions'
import { Topbar } from './Topbar'
import { PlanSummary } from './PlanSummary'
import { PlanView } from './PlanView'
import { redirect } from 'next/navigation'
const budgetMonth = [{
    id: 'QyvmilxAv6NdOemFxCMq',
    name: 'savings',
    createdAt: { _seconds: 1770833608, _nanoseconds: 946000000 },
    categories: [
      {
        id: '0XxXmGjRmY3K1fcxrwuX',
        name: 'investments',
        categoryGroupId: 'QyvmilxAv6NdOemFxCMq',
        createdAt: [],
        available: 0,
        budgeted: 0,
        activity: 0
      },
      {
        id: '5eE6kbppX3dnCew2Grge',
        name: 'emergency fund',
        categoryGroupId: 'QyvmilxAv6NdOemFxCMq',
        createdAt: [],
        available: 0,
        budgeted: 0,
        activity: 0
      }
    ]
  }, {
    id: 'ZRsjuFd3ulfBEwvtXCKD',
    name: 'wants',
    createdAt: { _seconds: 1770833607, _nanoseconds: 428000000 },
    categories: [
      {
        id: 'nnbuCSjRxK3mPi1m47xQ',
        name: 'food',
        categoryGroupId: 'ZRsjuFd3ulfBEwvtXCKD',
        createdAt: [],
        available: 0,
        budgeted: 0,
        activity: 0
      },
      {
        id: 'qHiniFZjb7AOZwnEUcji',
        name: 'clothes',
        categoryGroupId: 'ZRsjuFd3ulfBEwvtXCKD',
        createdAt: [],
        available: 0,
        budgeted: 0,
        activity: 0
      },
      {
        id: 'u8Hon3DFVdJD2vZzHaoU',
        name: 'subscription',
        categoryGroupId: 'ZRsjuFd3ulfBEwvtXCKD',
        createdAt: [],
        available: 0,
        budgeted: 0,
        activity: 0
      }
    ]
  }, {
    id: 'k57Cpy3RALISNezZnrvX',
    name: 'needs',
    createdAt: { _seconds: 1770833608, _nanoseconds: 252000000 },
    categories: [
      {
        id: 'Yeepu2uTTmsVUBSdGYFw',
        name: 'groceries',
        categoryGroupId: 'k57Cpy3RALISNezZnrvX',
        createdAt: [],
        available: 0,
        budgeted: 0,
        activity: 0
      },
      {
        id: 'uO8RFhVWttON4dKRQMbK',
        name: 'rent',
        categoryGroupId: 'k57Cpy3RALISNezZnrvX',
        createdAt: [],
        available: 0,
        budgeted: 0,
        activity: 0
      },
      {
        id: 'wmpzbuqDk5VjhJBQkzQ8',
        name: 'utilities',
        categoryGroupId: 'k57Cpy3RALISNezZnrvX',
        createdAt: [],
        available: 0,
        budgeted: 0,
        activity: 0
      }
    ]
  }]
const Plan = async ({ params }: { params: Promise<{ month: string }> }) => {
    const { month } = await params
    const user = await getUser() 
    if(!user) 
        redirect('/login')
    console.log(user)
    // const budgets = await getBudgets()
    // console.log(budgets)
    // const budgetMonth = await getBudgetMonth(user.currentBudgetId, month)
    // console.log(...budgetMonth)
    // const budgetMonth = [{},{}]
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