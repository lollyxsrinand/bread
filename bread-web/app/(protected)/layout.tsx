import { requireUser } from "@/utils/require-user";
import Sidebar from "../components/Sidebar";
import { getBudget } from "@/lib/actions/budget.actions";
import { getAccounts } from "@/lib/actions/account.actions";
import { getTransactions } from "@/lib/actions/transaction.actions";
import { getCategories, getCategoryGroups } from "@/lib/actions/category.actions";
import { BudgetHydrator } from "@/store/budget-hydrator";
import SidebarNaya from "../components/SidebarNaya";

export default async function Layout({ children }: Readonly<{ children: React.ReactNode; }>) {
  const user = await requireUser()
  const budget = await getBudget(user.currentBudgetId)

  const [accounts, transactions, categories, categoryGroups] =
    await Promise.all([
      getAccounts(budget.id),
      getTransactions(budget.id),
      getCategories(budget.id),
      getCategoryGroups(budget.id)
    ])

  return (
    <div className="flex h-screen w-full">
      <BudgetHydrator
        data={{
          budget,
          accounts,
          transactions,
          categories,
          categoryGroups
        }}
      />

      <SidebarNaya />

      <div className="h-full flex-1">
        {children}
      </div>
    </div>
  )
}