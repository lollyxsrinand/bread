import { FastifyReply, FastifyRequest } from "fastify";
import { createTransaction, deleteTransaction, getTransactions } from "../../services/transaction-service";
import { getUserId } from "../../utils/auth";
import { CreateTransactionInput, Transaction, validateCreateTransactionInput } from "bread-core/src";

export const createTransactionHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = await getUserId(request)

    if (!userId) {
        return reply.status(401).send({ error: "not authenticated" })
    }

    const { budgetId } = request.params as { budgetId: string }

    if (!budgetId) {
        return reply.status(400).send({ error: "budget id is required" })
    }

    const transactionInput = validateCreateTransactionInput(request.body)

    try {
        const transactionResult = await createTransaction(userId, budgetId, transactionInput)
        return reply.status(201).send(transactionResult)
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
        const transactionsById = Object.fromEntries(transactions.map(transaction => [transaction.id, transaction]))
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
        const resp = await deleteTransaction(userId, budgetId, transactionId)
        return reply.status(200).send(resp)
    } catch (error) {
        console.error(error)
        return reply.status(500).send({ error: "failed to delete transaction" })
    }

}