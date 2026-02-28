import { getAccounts } from "@/lib/actions/account.actions";
import { BudgetHydrator } from "@/store/budget-hydrator";
import Sidebar from "../components/Sidebar";
import { requireUser } from "@/utils/require-user";

export default async function Layout({ children, }: Readonly<{ children: React.ReactNode; }>) {
  const { currentBudgetId } = await requireUser()

  const accounts = await getAccounts(currentBudgetId)

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
