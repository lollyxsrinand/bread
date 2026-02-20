import { FastifyReply, FastifyRequest } from "fastify";
import { getBudget, getBudgetMonth, getBudgets } from "../../services/budget-service";
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

    if (!budgetId)
        return reply.status(400).send({ error: "budget id is required" })

    try {
        const budget = await getBudget(uid, budgetId)

        if (!budget)
            return reply.status(404).send({ error: "budget not found" })

        return reply.status(200).send(budget)
    } catch (err) {
        console.error(err)
        reply.status(500).send({ error: 'failed to get budget' })
    }
}

export async function getBudgetMonthHandler(request: FastifyRequest, reply: FastifyReply) {
    const uid = await getUserId(request)

    if (!uid)
        return reply.status(401).send({ error: "Not authenticated" })

    const { budgetId, month } = request.params as { budgetId: string, month: string }

    if (!budgetId)
        return reply.status(400).send({ error: "budget id is required" })


    if (!month)
        return reply.status(400).send({ error: "month is required" })


    if (!/^\d{4}\d{2}$/.test(month))
        return reply.status(400).send({ error: "month must be in YYYYMM format" })


    try {
        const budgetMonth = await getBudgetMonth(uid, budgetId, month)
        return reply.status(200).send(budgetMonth)
    } catch (error) {
        return reply.status(500).send({ error: `internal error: ${error}` })
    }
}

