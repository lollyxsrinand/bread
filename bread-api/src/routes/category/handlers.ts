import { FastifyReply, FastifyRequest } from "fastify"
import { getUserId } from "../../utils/auth"
import { assignToCategoryMonth, getCategories, getCategoryGroups } from "../../services/category-service"
import { getMonthlyBudget } from "../../services/budget-service"

export const getCategoriesHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = await getUserId(request)

    if (!userId)
        return reply.status(401).send({ error: "Not authenticated" })

    const { budgetId } = request.params as { budgetId: string }

    if (!budgetId)
        return reply.status(400).send({ error: "budget id is required" })

    try {
        const [categories, groups] = await Promise.all([
            getCategories(userId, budgetId),
            getCategoryGroups(userId, budgetId)
        ])

        const merged: any = {}
        for (const groupId in groups) {
            merged[groupId] = {
                ...groups[groupId],
                categories: {}
            }
        }

        for (const categoryId in categories) {
            const category = categories[categoryId]
            const groupId = category.categoryGroupId

            if (merged[groupId]) {
                merged[groupId].categories[categoryId] = category
            }
        }

        return reply.status(200).send(merged)
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

    if (!budgetId)
        return reply.status(400).send({ error: "budget id is required" })

    if (!month)
        return reply.status(400).send({ error: "month is required" })

    if (!categoryId)
        return reply.status(400).send({ error: "category id is required" })

    if (amount === undefined)
        return reply.status(400).send({ error: "amount is required" })

    try {
        await assignToCategoryMonth(userId, budgetId, month, categoryId, amount)
        const monthlyBudgetView = await getMonthlyBudget(userId, budgetId, month)
        return reply.status(200).send({ success: true, monthlyBudget: monthlyBudgetView })
    } catch (error) {
        console.error(error)
        return reply.status(500).send({ error: `internal error: ${error}` })
    }
}