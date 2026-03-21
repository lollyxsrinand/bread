import { TransactionsView } from './TransactionsView'
import { getUser } from '@/lib/actions/user.actions'
import { redirect } from 'next/navigation'

const Transactions = async () => {
  const user = await getUser()

  if (!user || !user.currentBudgetId) {
    redirect('/login')
  }
  return (
      <TransactionsView />
  )
}

export default Transactions