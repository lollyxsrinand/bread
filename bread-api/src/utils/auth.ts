import { FastifyRequest } from "fastify";
import { verify } from "jsonwebtoken";

export const getUserId = async (request: FastifyRequest) => {
  const token = request.headers.authorization?.split(' ')[1]

  if (!token) 
    return null

  try {
    const decoded = verify(token, process.env.JWT_SECRET as string) as { userId: string };
    return decoded.userId
  } catch (error) {
    console.error('error verifying jwt token: ', error);
    return null
  }
}