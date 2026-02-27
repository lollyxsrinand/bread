export interface CategoryView {
    id: string
    name: string 
    isSystem: boolean 
    budgeted: number
    activity: number 
    available: number
}

export interface CategoryGroupView {
    id: string
    name: string 
    categories: CategoryView[]
}

export interface MonthlyBudgetView {
    month: string
    toBeAssigned: number
    categoryGroups: CategoryGroupView[]
}

