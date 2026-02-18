import { FastifyReply, FastifyRequest } from "fastify";
import { createTransaction, deleteTransaction, getTransactions } from "../../services/transaction-service";
import { getUserId } from "../../utils/auth";

export const createTransactionHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = await getUserId(request)

    if (!userId) {
        return reply.status(401).send({ error: "not authenticated" })
    }

    const { budgetId } = request.params as { budgetId: string }

    if (!budgetId) {
        return reply.status(400).send({ error: "budget id is required" })
    }
    const { accountId, toAccountId = null, categoryId = null, amount, date } = request.body as { accountId: string, toAccountId?: string, categoryId?: string, amount: number, date: string }
    try {
        const txnId = await createTransaction(userId, budgetId, accountId, toAccountId, categoryId, amount, new Date(date))
        return reply.status(201).send({ id: txnId })
    } catch (error) {
        console.error(error)
        return reply.status(500).send({ error: "failed to create transaction" })
    }
}

export const getTransactionsHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = await getUserId(request)

    if (!userId) {
        return reply.status(401).send({ error: "not authenticated" })
    }

    const { budgetId } = request.params as { budgetId: string }

    if (!budgetId) {
        return reply.status(400).send({ error: "budget id is required" })
    }

    try {
        const transactions = await getTransactions(userId, budgetId)
        return reply.status(200).send(transactions)
    } catch (error) {
        console.error(error)
        reply.status(500).send({ error: 'failed to get budgets' })
    }
}

export const deleteTransactionHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = await getUserId(request)

    if (!userId) {
        return reply.status(401).send({ error: "not authenticated" })
    }

    const { budgetId, transactionId } = request.params as { budgetId: string, transactionId: string }

    if (!budgetId) {
        return reply.status(400).send({ error: "budget id is required" })
    }

    if (!transactionId) {
        return reply.status(400).send({ error: "transaction id is required" })
    }

    try {
        await deleteTransaction(userId, budgetId, transactionId)
        return reply.status(200).send({ message: "transaction deleted successfully" })
    } catch (error) {
        console.error(error)
        return reply.status(500).send({ error: "failed to delete transaction" })
    }

}