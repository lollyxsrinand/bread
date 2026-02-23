import { FastifyInstance } from "fastify";
import { getBudgetsHandler, getBudgetMonthHandler, getBudgetHandler } from "./handlers";

async function budgetRoutes(fastify: FastifyInstance) {
    // monthly budget view
    fastify.get('/budgets/:budgetId/months/:month', getBudgetMonthHandler)

    // get single budget
    fastify.get('/budgets/:budgetId', getBudgetHandler)

    // list budgets
    fastify.get('/budgets', getBudgetsHandler)
}

export default budgetRoutes