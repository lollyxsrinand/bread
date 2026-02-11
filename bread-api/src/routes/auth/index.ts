import { FastifyInstance } from "fastify";
import { loginHandler, logoutHandler} from "./handlers";

async function authRoutes(fastify: FastifyInstance, options: any) {
    fastify.post('/login', loginHandler)
    fastify.get('/logout', logoutHandler)
}

export default authRoutes