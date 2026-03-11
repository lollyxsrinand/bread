import { FastifyInstance } from "fastify";
import { authTestHandler, meHandler } from "./handlers";

const idkRoutes = async (fastify: FastifyInstance) => {
    fastify.get('/me', meHandler)
    fastify.get('/authtest', authTestHandler)
}

export default idkRoutes