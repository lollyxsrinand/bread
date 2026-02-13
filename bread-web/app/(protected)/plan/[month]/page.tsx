import { getUser } from '@/lib/actions/user.actions'
import { getcookielikewtfbro } from '@/utils/get-user'
import Idk from './Idk'
import { redirect } from 'next/navigation'
import { getBudgetMonth, getBudgets } from '@/lib/actions/budget.actions'

const Plan = async ({ params }: { params: Promise<{ month: string }> }) => {
    const { month } = await params
    const user = await getUser() 
    console.log(user.currentBudgetId);
    const budgetMonth = await getBudgetMonth(user.currentBudgetId, month)
    console.log(budgetMonth)

    return (
        <Idk />
    )
}

export default Plan