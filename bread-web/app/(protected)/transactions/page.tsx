import { getAccounts } from '@/lib/actions/account.actions'
import { TransactionsView } from './TransactionsView'
import { getTransactions } from '@/lib/actions/transaction.actions'
import { getUser } from '@/lib/actions/user.actions'

const Transactions = async () => {
  const user = await getUser()
  
  if(!user) {
    return <div>yo pls</div>
  }

  if (!user.currentBudgetId) {
    return <div>YO PLSSSS</div>
  }

  const [transactions, accounts] = await Promise.all([
    getTransactions(user.currentBudgetId),
    getAccounts(user.currentBudgetId),
  ])


  return (
    <>
    <TransactionsView transactions={transactions} accounts={accounts} />
    </>
  )
}

export default Transactions