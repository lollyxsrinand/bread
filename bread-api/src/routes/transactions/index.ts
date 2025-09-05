import { FastifyInstance } from "fastify";
import { addTransactionHandler } from "./addTransactionHandler";

async function transactionRoutes(fastify: FastifyInstance, options: any) {
    fastify.post('/add-transaction', addTransactionHandler)
}

export default transactionRoutes 