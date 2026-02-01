import { FastifyReply, FastifyRequest } from "fastify";
import { verify } from "jsonwebtoken";

export async function getUserId(request: FastifyRequest, reply: FastifyReply) {
  const token = request.cookies.token

  if (!token) return reply.code(401).send({ error: "Not authenticated" }); 

  try {
    const { uid } = verify(token, process.env.JWT_SECRET as string) as { uid: string }
    return uid
  } catch (error) {
    return reply.code(401).send({ error: "Not authenticated" });
  }
}

// old
// export async function checkAuth(req: FastifyRequest, reply: FastifyReply) {
//   console.log('running?');
//   const token = req.cookies.token
  
//   if(!token) {
//     return reply.status(401).send({ message: 'Not authenticated' })
//   }

//   try {
//     verify(token, process.env.JWT_SECRET as string) as { uid: string }
//   } catch(error) {
//     console.log(error);
//     return reply.status(401).send({ message: 'Invalid token' })
//   }
// }