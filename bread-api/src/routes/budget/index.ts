import { FastifyInstance } from "fastify";
import { getBudgetsHandler, getBudgetHandler, getMonthlyBudgetViewHandler } from "./handlers";

async function budgetRoutes(fastify: FastifyInstance) {
    // get single budget
    fastify.get('/budgets/:budgetId', getBudgetHandler)

    // list budgets
    fastify.get('/budgets', getBudgetsHandler)

    // list monthly budget view
    fastify.get('/budgets/:budgetId/monthly-views/:month', getMonthlyBudgetViewHandler)
}

export default budgetRoutes