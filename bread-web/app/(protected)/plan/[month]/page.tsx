import PlanSummary from "./PlanSummary"
import PlanView from "./PlanView"
import { BudgetHydrator } from "@/store/budget-hydrator"
import { requireUser } from "@/utils/require-user"
import { redirect } from "next/navigation"
import { getCategoryEntries, getMonthSummary } from "@/lib/actions/category.actions"
import { getBudget } from "@/lib/actions/budget.actions"

const Plan = async ({ params }: { params: Promise<{ month: string }> }) => {
  const { month } = await params

  const user = await requireUser()

  const budget = await getBudget(user.currentBudgetId)

  if (month > budget.maxMonth || month < budget.minMonth) {
    redirect(`/plan/${budget.maxMonth}`)
  }

  const [categoryEntries, monthSummary] = await Promise.all([
    getCategoryEntries(budget.id, month),
    getMonthSummary(budget.id, month)
  ])

  return (
    <>
      <BudgetHydrator
        data={{
          monthlyCategoryEntries: { [month]: categoryEntries },
          monthlySummary: { [month]: monthSummary }
        }}
      />

      <div className="h-full w-full flex">
        <PlanView month={month} />

        <div className="w-64">
          <PlanSummary />
        </div>
      </div>
    </>
  )
}

export default Plan