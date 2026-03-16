import {
    Account,
    Budget,
    Category,
    CategoryEntry,
    CategoryGroup,
    MonthSummary,
    Transaction
  } from "bread-core/src"
  
  export interface HydrateBudgetState {
    accounts?: Account[]
    transactions?: Transaction[]
    budget?: Budget
    categories?: Record<string, Category>
    categoryGroups?: Record<string, CategoryGroup>
    categoryEntries?: Record<string, Record<string, CategoryEntry>>
    monthSummaries?: Record<string, MonthSummary>
  }