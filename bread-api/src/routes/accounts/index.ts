import { FastifyInstance } from "fastify";
import { closeAccountHandler, createAccountHandler, getAccountHandler, getAccountsHandler, openAccountHandler } from "./handlers";

const accountRoutes = async (fastify: FastifyInstance) => {
    // create account
    fastify.post('/budgets/:budgetId/accounts', createAccountHandler) 

    // list accounts
    fastify.get('/budgets/:budgetId/accounts', getAccountsHandler) 

    // get single account
    fastify.get('/budgets/:budgetId/accounts/:accountId', getAccountHandler) 

    // close account
    fastify.patch('/budgets/:budgetId/accounts/:accountId/close', closeAccountHandler)

    // open account
    fastify.patch('/budgets/:budgetId/accounts/:accountId/open', openAccountHandler)
}

export default accountRoutes 