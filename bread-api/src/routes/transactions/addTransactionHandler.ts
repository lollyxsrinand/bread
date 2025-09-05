import { FastifyReply, FastifyRequest } from "fastify";

export async function addTransactionHandler(request: FastifyRequest, reply: FastifyReply) {
    // Placeholder for the actual implementation of adding a transaction
      return reply.status(200).send({ message: 'i think we added transaction, pls check and fuck off'});
}