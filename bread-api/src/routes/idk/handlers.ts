import { FastifyReply, FastifyRequest } from "fastify"
import { getUserId } from "../../utils/auth"
import { getUser } from "../../services/user-service"

export const authTestHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = await getUserId(request)
    if (!userId)
        return reply.status(401).send({ error: "Not authenticated" })
    return reply.send({ message: `Authenticated as user '${userId}'` })
}

export const meHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = await getUserId(request) // gets user id from the jwt token
    if (!userId)
        return reply.status(401).send({ error: "Not authenticated" })

    const user = await getUser(userId)

    if (!user)
        return reply.status(404).send({ error: "User not found" })
    return reply.send(user)
}