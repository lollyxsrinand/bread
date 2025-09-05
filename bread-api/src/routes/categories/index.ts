import { FastifyInstance } from "fastify";
// import { signupHandler } from "./signup";
import { createCategoryGroupHandler, createCategoryHandler, getCategoriesWithBudgetHandler } from "./categories";

async function categoryRoutes(fastify: FastifyInstance, options: any) {
    fastify.get('/categories/:month', getCategoriesWithBudgetHandler)
    fastify.post('/categories', createCategoryHandler)
    fastify.post('/categoryGroup', createCategoryGroupHandler)
}

export default categoryRoutes