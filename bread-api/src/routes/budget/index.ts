import { FastifyInstance } from "fastify";
import { getBudgetsHandler, getBudgetHandler, getBudgetViewHandler } from "./handlers";

const budgetRoutes = async (fastify: FastifyInstance) => {
    // get single budget
    fastify.get('/budgets/:budgetId', getBudgetHandler)

    // list budgets
    fastify.get('/budgets', getBudgetsHandler)

    // list monthly budget view
    fastify.get('/budgets/:budgetId/months/:month', getBudgetViewHandler)
}

export default budgetRoutes