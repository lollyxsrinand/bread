import { FastifyInstance } from "fastify";
import {getBudgetsHandler, getBudgetMonthHandler, getBudgetHandler} from "./handlers";

async function budgetRoutes(fastify: FastifyInstance, options: any) {
    fastify.get('/budgetMonth/:budgetId/:month', getBudgetMonthHandler)
    fastify.get('/budgets', getBudgetsHandler)
    fastify.get('/budget/:budgetId', getBudgetHandler)
}

export default budgetRoutes