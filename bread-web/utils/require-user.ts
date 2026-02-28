import { getUser } from "@/lib/actions/user.actions"
import { User } from "bread-core/src"
import { redirect } from "next/navigation"

export const requireUser = async () => {
    const user = await getUser()
    if (!user) {
        redirect('/login')
    }

    if (!user.currentBudgetId) {
        redirect('/new-budget')
    }

    return user as User & { currentBudgetId: string }
}