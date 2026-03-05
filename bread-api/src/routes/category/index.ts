import { FastifyInstance } from "fastify";
import { assignToCategoryHandler, getCategoriesHandler, getCategoryEntriesHandler, rolloverToNextMonthHandler } from "./handlers";

const categoryRoutes = async (fastify: FastifyInstance) => {
    fastify.get('/budgets/:budgetId/categories', getCategoriesHandler)

    fastify.post('/budgets/:budgetId/months/:month/categories/:categoryId/assign', assignToCategoryHandler)

    fastify.post('/budgets/:budgetId/rollover', rolloverToNextMonthHandler)

    fastify.get('/budgets/:budgetId/monthly-category-entries/:month', getCategoryEntriesHandler)
}

export default categoryRoutes