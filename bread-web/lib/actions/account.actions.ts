'use server'

import { getcookielikewtfbro } from "@/utils/get-user"
import { Account } from "bread-core"

export const getAccounts = async (budgetId: string) => {
    const token = await getcookielikewtfbro()
    const res = await fetch(`http://localhost:3001/budgets/${budgetId}/accounts`, {
        headers: {
            'authorization': `Bearer ${token}`
        },
    })

    if (!res.ok) {
        throw new Error('Failed to fetch accounts')
    }

    return await res.json() as Account[]
}