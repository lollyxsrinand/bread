import { Budget } from "./base"

export interface CategoryView {
    id: string,
    name: string,
    isSystem: boolean,
    assigned: number,
    activity: number,
    available: number
}

export interface CategoryGroupView {
    id: string,
    name: string,
    assigned: number,
    activity: number,
    available: number,
    categories: CategoryView[]
}

export interface BudgetView {
    month: string, 
    readytoassign: number,
    categoryGroups: CategoryGroupView[]
}