import { FastifyReply, FastifyRequest } from "fastify";
import { closeAccount, createAccount, getAccount, getAccounts, openAccount } from "../../services/account-service";
import { getUserId } from "../../utils/auth";

export const createAccountHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = await getUserId(request)
    if (!userId) {
        return reply.status(401).send({ error: "not authenticated" })
    }

    const { budgetId } = request.params as { budgetId: string }

    const { name, type, balance } = request.body as { name: string, type: string, balance: number }
    if (name === undefined || type === undefined || balance === undefined) {
        return reply.status(400).send({ error: "name, type, balance are all required" })
    }

    try {
        const account = await createAccount(userId, budgetId, { name, type, balance })
        return reply.status(201).send(account)
    } catch (error) {
        console.error(error)
        return reply.status(500).send({ error: "failed to create account" })
    }
}

export const getAccountsHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = await getUserId(request)
    if (!userId) {
        return reply.status(401).send({ error: "not authenticated" })
    }

    const { budgetId } = request.params as { budgetId: string }

    try {
        const accounts = await getAccounts(userId, budgetId)
        const accountsById = Object.fromEntries(accounts.map(account => [account.id, account]))
        return reply.status(200).send(accountsById)
    } catch (error) {
        console.error(error)
        return reply.status(500).send({ error: "failed to get accounts" })
    }
}

export const getAccountHandler= async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = await getUserId(request)
    if (!userId) {
        return reply.status(401).send({ error: "not authenticated" })
    }

    const { budgetId, accountId } = request.params as { budgetId: string, accountId: string }

    try {
        const account = await getAccount(userId, budgetId, accountId)

        if (!account) {
            return reply.status(404).send({ error: "account not found" })
        }

        return reply.status(200).send(account)
    } catch (error) {
        console.error(error)
        return reply.status(500).send({ error: "failed to get account" })
    }
}

export const closeAccountHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = await getUserId(request)
    if (!userId) {
        return reply.status(401).send({ error: "not authenticated" })
    }

    const { budgetId, accountId } = request.params as { budgetId: string, accountId: string }

    try {
        const account = await closeAccount(userId, budgetId, accountId)
        return reply.status(200).send(account)
    } catch (error) {
        console.error(error)
        return reply.status(500).send({ error: "failed to close account" })
    }
}

export const openAccountHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = await getUserId(request)
    if (!userId) {
        return reply.status(401).send({ error: "not authenticated" })
    }

    const { budgetId, accountId } = request.params as { budgetId: string, accountId: string }

    try {
        const account = await openAccount(userId, budgetId, accountId)
        return reply.status(200).send(account)
    } catch (error) {
        console.error(error)
        return reply.status(500).send({ error: "failed to close account" })
    }
}