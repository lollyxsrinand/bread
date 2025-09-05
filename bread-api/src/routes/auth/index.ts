import { FastifyInstance } from "fastify";
import { signupHandler } from "./signup";

async function authRoutes(fastify: FastifyInstance, options: any) {
    fastify.post('/signup', signupHandler)
}

export default authRoutes