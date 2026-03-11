import { FastifyInstance } from "fastify";
import { loginHandler, logoutHandler} from "./handlers";

const authRoutes = async (fastify: FastifyInstance, options: any) => {
    fastify.post('/login', loginHandler)
    fastify.get('/logout', logoutHandler)
}

export default authRoutes