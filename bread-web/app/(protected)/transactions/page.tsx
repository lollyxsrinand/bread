import { getAccounts } from '@/lib/actions/account.actions'
import { TransactionsView } from './TransactionsView'
import { getTransactions } from '@/lib/actions/transaction.actions'
import { getUser } from '@/lib/actions/user.actions'
import { getGroupedCategories } from '@/lib/actions/category.actions'
import { redirect } from 'next/navigation'
import { Account, Transaction } from 'bread-core/src'

const Transactions = async () => {
  const user = await getUser()

  if (!user || !user.currentBudgetId) {
    redirect('/login')
  }

  const [transactions]: [ Transaction[]] = await Promise.all([
    getTransactions(user.currentBudgetId),
  ])


  return (
      <TransactionsView transactions={transactions} />
  )
}

export default Transactions