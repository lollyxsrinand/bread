import { FastifyReply, FastifyRequest } from "fastify";
import { getBudgetMonth, getBudgets } from "../../services/budget-service";

export const getBudgetsHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const { userId } = request.params as { userId: string }

    console.log(userId);
    try {
        const budgets = await getBudgets(userId)
        return reply.status(200).send(budgets)
    } catch (err) {
        console.error(err)
        reply.status(500).send({ error: 'failed to get budgets' })
    }
}
export async function getBudgetMonthHandler(request: FastifyRequest, reply: FastifyReply) {
    const { userId, budgetId } = request.params as {
        userId: string
        budgetId: string
    }
    const { month } = request.query as { month: string }

    if (!userId)
        return reply.status(400).send({ error: "user id is required" })


    if (!budgetId)
        return reply.status(400).send({ error: "budget id is required" })


    if (!month)
        return reply.status(400).send({ error: "month is required" })


    if (!/^\d{4}\d{2}$/.test(month))
        return reply.status(400).send({ error: "month must be in YYYYMM format" })


    try {
        const budgetMonth = await getBudgetMonth(userId, budgetId, month)
        return reply.status(200).send(budgetMonth)
    } catch (error) {
        return reply.status(500).send({ error: `internal error: ${error}` })
    }

}