import { FastifyRequest } from "fastify";
import { verify } from "jsonwebtoken";

export async function getUserId(request: FastifyRequest) {
  const token = request.headers.authorization?.split(' ')[1]

  if (!token) 
    return null

  try {
    const decoded = verify(token, process.env.JWT_SECRET as string) as { uid: string };
    return decoded.uid
  } catch (error) {
    console.error('error verifying jwt token: ', error);
    return null
  }
}