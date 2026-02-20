import { FastifyInstance } from "fastify";
import { assignToCategoryHandler, getCategoriesHandler } from "./handlers";

const categoryRoutes = async (fastify: FastifyInstance) => {
    fastify.get('/budgets/:budgetId/categories', getCategoriesHandler)

    fastify.post('/budgets/:budgetId/months/:month/categories/:categoryId/assign', assignToCategoryHandler)
}

export default categoryRoutes