import { FastifyReply, FastifyRequest } from "fastify";
import { getBudget, getBudgets, getBudgetView } from "../../services/budget-service";
import { getUserId } from "../../utils/auth";

export const getBudgetsHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const uid = await getUserId(request)
    if (!uid)
        return reply.status(401).send({ error: "Not authenticated" })

    try {
        const budgets = await getBudgets(uid)
        return reply.status(200).send(budgets)
    } catch (err) {
        console.error(err)
        reply.status(500).send({ error: 'failed to get budgets' })
    }
}

export const getBudgetHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const uid = await getUserId(request)
    if (!uid)
        return reply.status(401).send({ error: "Not authenticated" })

    const { budgetId } = request.params as { budgetId: string }
    try {
        const budget = await getBudget(uid, budgetId)
        if (!budget)
            return reply.status(404).send({ error: "budget not found" })

        return reply.status(200).send(budget)
    } catch (error) {
        console.error(error)
        reply.status(500).send({ error: 'failed to get budget' })
    }
}

export const getBudgetViewHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = await getUserId(request)
    if (!userId) {
        return reply.status(401).send({ error: "not authenticated"})
    }

    const { budgetId, month } = request.params as { budgetId: string, month: string }
    try {
        const monthlyBudgetView = await getBudgetView(userId, budgetId, month)
        return reply.status(200).send(monthlyBudgetView)
    } catch (error) {
        console.error(error)
        reply.status(500).send({ error: 'failed to get monthly budget view' })
    }
}