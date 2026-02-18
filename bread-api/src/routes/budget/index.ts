import { FastifyInstance } from "fastify";
import {getBudgetsHandler, getBudgetMonthHandler, getBudgetHandler, assignToCategoryHandler} from "./handlers";

async function budgetRoutes(fastify: FastifyInstance) {
    // get budget month
    fastify.get('/budgets/:budgetId/months/:month', getBudgetMonthHandler)

    // get single budget
    fastify.get('/budgets/:budgetId', getBudgetHandler)

    // list budgets
    fastify.get('/budgets', getBudgetsHandler)

    // assign to category
    fastify.post('/budgets/:budgetId/months/:month/categories/:categoryId/assign', assignToCategoryHandler)
}

export default budgetRoutes