import { FastifyInstance } from "fastify";
import { authTestHandler, meHandler } from "./handlers";

async function idkRoutes(fastify: FastifyInstance) {
    fastify.get('/me', meHandler)
    fastify.get('/authtest', authTestHandler)
}

export default idkRoutes