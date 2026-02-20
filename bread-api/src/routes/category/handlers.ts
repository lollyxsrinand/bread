import { FastifyReply, FastifyRequest } from "fastify"
import { getUserId } from "../../utils/auth"
import { getCategories, getCategoryGroups } from "../../services/category-service"

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