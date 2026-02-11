import { FastifyInstance } from "fastify";
import {getBudgetsHandler, getBudgetMonthHandler} from "./handlers";

async function budgetRoutes(fastify: FastifyInstance, options: any) {
    fastify.get('/budgetMonth/:budgetId/:month', getBudgetMonthHandler)
    fastify.get('/budgets', getBudgetsHandler)
}

export default budgetRoutes