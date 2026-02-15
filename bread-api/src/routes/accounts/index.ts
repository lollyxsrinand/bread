import { FastifyInstance } from "fastify";
import { createAccountHandler, deleteAccountHandler, getAccountHandler, getAccountsHandler, updateAccountHandler } from "./handlers";

async function accountRoutes(fastify: FastifyInstance) {
    // create account
    fastify.post('/budgets/:budgetId/accounts', createAccountHandler) 

    // list accounts
    fastify.get('/budgets/:budgetId/accounts', getAccountsHandler) 

    // get single account
    fastify.get('/budgets/:budgetId/accounts/:accountId', getAccountHandler) 

    // update account
    fastify.patch('/budgets/:budgetId/accounts/:accountId', updateAccountHandler) 

    // delete account
    fastify.delete('/budgets/:budgetId/accounts/:accountId', deleteAccountHandler)
}

export default accountRoutes 