import { getAccounts } from "@/lib/actions/account.actions";
import Sidebar from "../components/Sidebar";
import { getUser } from "@/lib/actions/user.actions";
import { BudgetHydrator } from "@/store/budget-hydrator";

export default async function Layout({ children, }: Readonly<{ children: React.ReactNode; }>) {
  const user = await getUser()
  if (!user) {
    return <h1>hi mom, i think u are not logged in yakunfooooooo</h1>
  }

  if(!user.currentBudgetId) {
    return <h1>hi mom, i think u dont have any budgets i promise to come back. fix this. so when u delete all ur budgets. u will still be able to make a new budget.</h1>
  }

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
