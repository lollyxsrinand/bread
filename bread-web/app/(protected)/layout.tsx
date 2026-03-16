import { requireUser } from "@/utils/require-user";
import Sidebar from "../components/Sidebar";
import { getBudget } from "@/lib/actions/budget.actions";
import { getAccounts } from "@/lib/actions/account.actions";
import { getTransactions } from "@/lib/actions/transaction.actions";
import { getCategories, getCategoryGroups } from "@/lib/actions/category.actions";
import { BudgetHydrator } from "@/store/budget-hydrator";

export default async function Layout({ children, }: Readonly<{ children: React.ReactNode; }>) {
  const user = await requireUser()
  const budget = await getBudget(user.currentBudgetId)

  /**
   * i need to fetch, user, budget, accounts, transactions, categories, categoryGroups, categoryEntriesWithMonthSummary
   * for now i fetch everything that has nothing to do with month
   */
  const [accounts, transactions, categories, categoryGroups] = await Promise.all([
    getAccounts(budget.id),
    getTransactions(budget.id),
    getCategories(budget.id),
    getCategoryGroups(budget.id)
  ])

  return (
    <div className="flex h-screen w-full">
      <BudgetHydrator
        accounts={accounts}
        transactions={transactions}
        categories={categories}
        categoryGroups={categoryGroups}
      />
      <Sidebar />
      <div className="h-full flex-1">
        {children}
      </div>
    </div>
  )
}
