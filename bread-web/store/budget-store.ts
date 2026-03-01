import { assignToCategory as _assignToCategory } from '@/lib/actions/category.actions'
import { Account, Budget, CategoryGroupView, MonthlyBudgetView } from 'bread-core/src'
import { toast } from 'react-toastify'
import { create } from 'zustand'

interface BudgetState {
    accounts: Account[]
    setAccounts: (accounts: Account[]) => void
    updateAccountBalance: (accountId: string, delta: number) => void

    budget: Budget
    setBudget: (budget: Budget) => void

    monthlyBudgets: Record<string, MonthlyBudgetView>
    setMonthlyBudget: (month: string, budget: MonthlyBudgetView) => void
    assignToCategory: (budgetId: string, month: string, categoryId: string, amount: number) => void
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
    accounts: [],
    setAccounts: (accounts: Account[]) => set({ accounts }),

    budget: {} as Budget,
    setBudget: (budget: Budget) => set({ budget }),

    monthlyBudgets: {},
    setMonthlyBudget: (month: string, budget: MonthlyBudgetView) =>
        set((state) => ({
            monthlyBudgets: {
                ...state.monthlyBudgets,
                [month]: budget,
            },
        })),

    updateAccountBalance: (accountId: string, delta: number) => set((state) => ({
        accounts: state.accounts.map((account) =>
            account.id === accountId
                ? { ...account, balance: account.balance + delta }
                : account
        )
    })),

    // requires some refactoring 
    assignToCategory: async (budgetId: string, month: string, categoryId: string, amount: number) => {
        const monthlyBudget = get().monthlyBudgets[month]
        if (!monthlyBudget) {
            console.log(`monthly budget for month ${month} not found`)
            return
        }

        const previousState = monthlyBudget
        const targetCategory = monthlyBudget.categoryGroups.flatMap((group) => group.categories).find(c => c.id === categoryId)
        if (!targetCategory) {
            console.log(`category with id ${categoryId} not found in month ${month}`)
            return 
        }
        const delta = amount - targetCategory.budgeted
        if (delta === 0) {
            return
        }
        set((state) => {

            const toBeAssigned = monthlyBudget.toBeAssigned - delta

            const updatedCategoryGroups = monthlyBudget.categoryGroups.map((group) => {
                const updatedCategories = group.categories.map((category) => {
                    if (category.id === categoryId) {
                        return {
                            ...category,
                            available: category.available + delta,
                            budgeted: category.budgeted + delta
                        }
                    }
                    if (category.id === 'readytoassign') {
                        return {
                            ...category,
                            available: toBeAssigned
                        }
                    }
                    return category
                })
                return {
                    ...group,
                    categories: updatedCategories
                }
            })
            return {
                monthlyBudgets: {
                    ...state.monthlyBudgets,
                    [month]: {
                        ...monthlyBudget,
                        toBeAssigned: toBeAssigned,
                        categoryGroups: updatedCategoryGroups
                    }
                }
            }
        })
        try {
            const data = await _assignToCategory(budgetId, categoryId, month, amount)
            const newMonthlyBudget = data.monthlyBudget
            toast.success(`assigned ${amount} to category successfully!`)
            set((state) => {
                return {
                    monthlyBudgets: {
                        ...state.monthlyBudgets,
                        [month]: {
                            ...newMonthlyBudget
                        }
                    }
                }
            })
        } catch (error) {
            console.log(error);
            toast.error('failed to assign to category. Please try again.')
            set((state) => {
                return {
                    monthlyBudgets: {
                        ...state.monthlyBudgets,
                        [month]: {
                            ...previousState
                        }
                    }
                }
            })
        }
    },
}))