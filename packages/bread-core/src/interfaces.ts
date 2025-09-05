// // test type
// export interface Category {
//     id: string;
//     name: string;
//     type: 'spending' | 'savings' | 'debt' | 'system';
//     masterCategory: string;
//     sortOrder: number;
// }

// bread-core/types.ts
export interface Category {
  id: string
  name: string
  group: string
}

export interface BudgetEntry {
  budgeted: number
  activity: number
  available: number
}

export interface CategoryWithBudget extends Category, BudgetEntry {}