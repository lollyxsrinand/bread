import { FastifyInstance } from "fastify";
import {getBudgetsHandler, getBudgetMonthHandler} from "./handlers";
// import {} from "./handlers";

async function budgetRoutes(fastify: FastifyInstance, options: any) {
    fastify.get('/getBudgetMonth/:userId/:budgetId', getBudgetMonthHandler)
    fastify.get('/getBudgets/:userId', getBudgetsHandler)
    // fastify.post('/login', loginHandler)
    // fastify.post('/signup', signupHandler)
    // fastify.get('/logout', logoutHandler)
}

export default budgetRoutes