import { FastifyReply, FastifyRequest } from "fastify"
import { getUserId } from "../../utils/auth"
import { assignToCategory, getCategories, getAllCategoryEntriesForMonth, getCategoryGroups, rolloverToNextMonth, getMonthSummary } from "../../services/category-service"
import { request } from "http"
// import { getMonthlyBudgetView } from "../../services/budget-service"

export const getCategoriesHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = await getUserId(request)
    if (!userId)
        return reply.status(401).send({ error: "Not authenticated" })

    const { budgetId } = request.params as { budgetId: string }
    try {
        const categories = await getCategories(userId, budgetId)
        return reply.status(200).send(categories /* merged */)
    } catch (err) {
        console.error(err)
        reply.status(500).send({ error: 'failed to get categories' })
    }
}

export const assignToCategoryHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = await getUserId(request)

    if (!userId)
        return reply.status(401).send({ error: "Not authenticated" })

    const { budgetId, month, categoryId } = request.params as { budgetId: string, month: string, categoryId: string }
    const { amount } = request.body as { amount: number }

    if (amount === undefined)
        return reply.status(400).send({ error: "amount is required" })

    try {
        const something = await assignToCategory(userId, budgetId, month, categoryId, amount)
        // const monthlyBudgetView = await getMonthlyBudgetView(userId, budgetId, month)
        return reply.status(200).send(something)
    } catch (error) {
        console.error(error)
        return reply.status(500).send({ error: `internal error: ${error}` })
    }
}

export const rolloverToNextMonthHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = await getUserId(request)
    if (!userId)
        return reply.status(401).send({ error: "Not authenticated" })

    const { budgetId } = request.params as { budgetId: string }

    try {
        await rolloverToNextMonth(userId, budgetId)
        return reply.status(200).send({ message: "YEEEHAWWWW"})
    } catch (error) {
        console.error(error)
        return reply.status(500).send({ error: `internal error: ${error}` })
    }
}

export const getCategoryEntriesHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = await getUserId(request)
    if (!userId) {
        return reply.status(401).send({ error: "Not authenticated" })
    }

    const { budgetId, month } = request.params as { budgetId: string, month: string }

    try {
        const categoryEntries = await getAllCategoryEntriesForMonth(userId, budgetId, month)
        return reply.status(200).send(categoryEntries)
    } catch (error) {
        console.error(error)
        return reply.status(500).send({ error: `internal error: ${error}` })
    }
}

export const getCategoryGroupsHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = await getUserId(request)
    if (!userId) {
        return reply.status(401).send({ error: "not authenticated" })
    }

    const { budgetId } = request.params as { budgetId: string }

    try {
        const categoryGroups = await getCategoryGroups(userId, budgetId)
        return reply.status(200).send(categoryGroups)
    } catch (error) {
        console.error(error)
        return reply.status(500).send({ error: `internal error: ${error}`})
    }
}

export const getMonthSummaryHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = await getUserId(request)
    if (!userId) {
        return reply.status(401).send({ error: "not authenticated" })
    }

    const { budgetId, month } = request.params as { budgetId: string, month: string }

    try {
        const monthSummary = await getMonthSummary(userId, budgetId, month)
        return reply.status(200).send(monthSummary)
    } catch (error) {
        console.error(error)
        return reply.status(500).send({ error: `internal error: ${error}`})
    }
}
