import { getAccounts } from "@/lib/actions/account.actions";
import Sidebar from "../components/Sidebar";
import { getUser } from "@/lib/actions/user.actions";
import { BudgetHydrator } from "@/store/budget-hydrator";
import { getMonthlyBudget } from "@/lib/actions/budget.actions";
import { redirect } from "next/navigation";
import { Account, MonthlyBudgetView } from "bread-core";

export default async function Layout({ children, }: Readonly<{ children: React.ReactNode; }>) {
  const user = await getUser()
  if (!user || !user.currentBudgetId) {
    redirect('/login')
  }

  const [accounts, monthlyBudget ]: [Account[], MonthlyBudgetView] = await Promise.all([
    getAccounts(user.currentBudgetId),
    getMonthlyBudget(user.currentBudgetId, '202602')
  ])

  return (
    <div className="flex h-screen w-full">
      <BudgetHydrator accounts={accounts} monthlyBudget={monthlyBudget} />
        <Sidebar />
        <div className="h-full flex-1">
            {children}
        </div>
    </div>
  )
}
