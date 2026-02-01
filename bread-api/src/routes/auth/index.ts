import { FastifyInstance } from "fastify";
import { loginHandler, logoutHandler, signupHandler } from "./handlers";

async function authRoutes(fastify: FastifyInstance, options: any) {
    fastify.post('/login', loginHandler)
    fastify.post('/signup', signupHandler)
    fastify.get('/logout', logoutHandler)
}

export default authRoutes