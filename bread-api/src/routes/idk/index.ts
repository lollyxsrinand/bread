import { FastifyInstance } from "fastify";
import { authTestHandler, meHandler } from "./handlers";
import { createCategory } from "../../services/category-service";

async function idkRoutes(fastify: FastifyInstance) {
    fastify.get('/me', meHandler)
    fastify.get('/authtest', authTestHandler)
}

export default idkRoutes