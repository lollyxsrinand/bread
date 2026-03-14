import { getAccounts } from "@/lib/actions/account.actions";
import { BudgetHydrator } from "@/store/budget-hydrator";
import Sidebar from "../components/Sidebar";
import { requireUser } from "@/utils/require-user";
import { getTransactions } from "@/lib/actions/transaction.actions";

export default async function Layout({ children, }: Readonly<{ children: React.ReactNode; }>) {
  const user = await requireUser()
  const accounts = await getAccounts(user.currentBudgetId)

  return (
    <div className="flex h-screen w-full">
      <BudgetHydrator accounts={accounts} />
      <Sidebar />
      <div className="h-full flex-1">
        {children}
      </div>
    </div>
  )
}
