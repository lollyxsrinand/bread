import { FastifyInstance } from "fastify";
import { getCategoriesHandler } from "./handlers";

const categoryRoutes = async (fastify: FastifyInstance) => {
    fastify.get('/budgets/:budgetId/categories', getCategoriesHandler)
}

export default categoryRoutes