import { FastifyInstance } from "fastify";
import { assignToCategoryHandler, getCategoriesHandler, getCategoryEntriesHandler, getCategoryGroupsHandler, getMonthSummaryHandler, rolloverToNextMonthHandler } from "./handlers";

const categoryRoutes = async (fastify: FastifyInstance) => {
      fastify.get('/budgets/:budgetId/categories', getCategoriesHandler)

      fastify.get('/budgets/:budgetId/categoryGroups', getCategoryGroupsHandler)

      fastify.get('/budgets/:budgetId/category-entries/:month', getCategoryEntriesHandler)

      fastify.get('/budgets/:budgetId/summary/:month', getMonthSummaryHandler)
      
      fastify.post('/budgets/:budgetId/months/:month/categories/:categoryId/assign', assignToCategoryHandler)

      fastify.post('/budgets/:budgetId/rollover', rolloverToNextMonthHandler)
}

export default categoryRoutes