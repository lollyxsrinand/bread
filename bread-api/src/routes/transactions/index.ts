import { FastifyInstance } from "fastify";
import { createTransactionHandler, deleteTransactionHandler, getTransactionsHandler } from "./handlers";

const transactionRoutes = async (fastify: FastifyInstance) => {
    fastify.post('/budgets/:budgetId/transactions', createTransactionHandler)

    fastify.get('/budgets/:budgetId/transactions', getTransactionsHandler)

    fastify.delete('/budgets/:budgetId/transactions/:transactionId', deleteTransactionHandler)
}

export default transactionRoutes