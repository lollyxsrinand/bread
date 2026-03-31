import { FastifyInstance } from "fastify";
import { assignToCategoryHandler, createCategoryHandler, getCategoriesHandler, getCategoryEntriesHandler, getCategoryGroupsHandler, getMonthSummaryHandler, renameCategoryGroupHandler, renameCategoryHandler, rolloverToNextMonthHandler } from "./handlers";

const categoryRoutes = async (fastify: FastifyInstance) => {
      fastify.get('/budgets/:budgetId/categories', getCategoriesHandler)

      fastify.get('/budgets/:budgetId/categoryGroups', getCategoryGroupsHandler)

      fastify.get('/budgets/:budgetId/category-entries/:month', getCategoryEntriesHandler)

      fastify.get('/budgets/:budgetId/summary/:month', getMonthSummaryHandler)
      
      fastify.post('/budgets/:budgetId/months/:month/categories/:categoryId/assign', assignToCategoryHandler)

      fastify.post('/budgets/:budgetId/rollover', rolloverToNextMonthHandler)

      fastify.post('/budgets/:budgetId/categories', createCategoryHandler)

      // rename category
      fastify.patch('/budgets/:budgetId/categories/:categoryId/rename', renameCategoryHandler)

      // rename category group
      fastify.patch('/budgets/:budgetId/categoryGroups/:categoryGroupId/rename', renameCategoryGroupHandler)
}

export default categoryRoutes