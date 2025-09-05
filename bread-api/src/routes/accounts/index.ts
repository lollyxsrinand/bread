import { FastifyInstance } from "fastify";
import { createAccountHandler, deleteAccountHandler, getAccountHandler, getAccountsHandler, updateAccountHandler } from "./handlers";

async function accountRoutes(fastify: FastifyInstance) {
    // list accounts
    fastify.get('/accounts', getAccountsHandler) 

    // get single account
    fastify.get('/accounts/:id', getAccountHandler) 
    
    // create account
    fastify.post('/accounts', createAccountHandler) 

    // update account
    fastify.patch('/accounts/:id', updateAccountHandler) 

    // delete account
    fastify.delete('/accounts/:id', deleteAccountHandler)
}

export default accountRoutes 