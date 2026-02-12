
export const getBudgets = async (token: string) => {
    const res = await fetch(`http://localhost:3001/budgets`, {
        headers: {
            'authorization': `Bearer ${token}`
        },
    })

    const budgets = await res.json()

    return budgets
}

export const getBudgetMonth = async (token: string, budgetId: string, month: string) => {
    const res = await fetch(`http://localhost:3001/budgetMonth/${budgetId}/${month}`, {
        headers: {
            'authorization': `Bearer ${token}`
        },
    })

    const budgetMonth = await res.json()

    return budgetMonth
}