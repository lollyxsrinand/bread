import { FastifyReply, FastifyRequest } from "fastify";
import { createAccount, getAccount, getAccounts } from "../../services/account-service";
import { getUserId } from "../../utils/auth";

export async function createAccountHandler(request: FastifyRequest, reply: FastifyReply) {
    const uid = await getUserId(request)

    if (!uid) {
        return reply.status(401).send({ error: "Not authenticated" })
    }

    const { budgetId } = request.params as { budgetId: string }

    if (!budgetId) {
        return reply.status(400).send({ error: "budget id is required" })
    }

    const { name, type, balance } = request.body as { name: string, type: string, balance: number }

    if (!name || !type || balance === undefined) {
        return reply.status(400).send({ error: "name, type, balance are all required" })
    }

    try {
        const account = await createAccount(uid, budgetId, { name, type, balance })
        return reply.status(201).send({ id: account.id })
    } catch (error) {
        console.error(error)
        return reply.status(500).send({ error: "Failed to create account" })
    }
}

export async function getAccountsHandler(request: FastifyRequest, reply: FastifyReply) {
    const uid = await getUserId(request)

    if (!uid) {
        return reply.status(401).send({ error: "not authenticated" })
    }

    const { budgetId } = request.params as { budgetId: string }

    if (!budgetId) {
        return reply.status(400).send({ error: "budget id is required" })
    }

    try {
        const accounts = await getAccounts(uid, budgetId)
        return reply.status(200).send(accounts)
    } catch (error) {
        console.error(error)
        return reply.status(500).send({ error: "failed to get accounts" })
    }
}

export async function getAccountHandler(request: FastifyRequest, reply: FastifyReply) {
    const userId = await getUserId(request)

    if (!userId) {
        return reply.status(401).send({ error: "not authenticated" })
    }

    const { budgetId, accountId } = request.params as { budgetId: string, accountId: string }

    if (!budgetId) {
        return reply.status(400).send({ error: "budget id is required" })
    }

    if (!accountId) {
        return reply.status(400).send({ error: "account id is required" })
    }

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

export async function updateAccountHandler(request: FastifyRequest, reply: FastifyReply) {
}

export async function deleteAccountHandler(request: FastifyRequest, reply: FastifyReply) {
}