import { FastifyInstance } from "fastify";
import { createAccountHandler, getAccountHandler, getAccountsHandler } from "./handlers";
import { getUserId } from "src/utils/auth";

const accountRoutes = async (fastify: FastifyInstance) => {
    // create account
    fastify.post('/budgets/:budgetId/accounts', createAccountHandler) 

    // list accounts
    fastify.get('/budgets/:budgetId/accounts', getAccountsHandler) 

    // get single account
    fastify.get('/budgets/:budgetId/accounts/:accountId', getAccountHandler) 

}

export default accountRoutes 