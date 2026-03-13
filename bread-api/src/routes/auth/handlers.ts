import { FastifyReply, FastifyRequest } from "fastify";
import admin from 'firebase-admin';
import { sign } from "jsonwebtoken";
import { setupUser } from "../../services/user-service";
import { db } from "../../firebase/server";

export const loginHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const { idToken } = request.body as { idToken: string };

    let decodedIdToken;
    try {
        decodedIdToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
        console.error('Error verifying ID token: ', error);
        return reply.status(401).send({ message: 'unauthorized' });
    }

    const userId = decodedIdToken.uid
    const userRef = db.collection('users').doc(userId)
    const userSnap = await userRef.get()

    if (!userSnap.exists) {
        try {
            await setupUser(userId, decodedIdToken.email ?? '') // creates user, default budget and default categories
        } catch (error) {
            reply.status(500).send({ error: `internal error: ${error}`})
        }
    }

    const jwtToken = sign({ userId: userId },
        process.env.JWT_SECRET as string,
        { expiresIn: "7d", algorithm: "HS256" }
    )

    return reply.status(200).send({ jwtToken: jwtToken });
}


// or simply delete token bleh??>?D
export const logoutHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const sessionCookie = request.cookies.session;
    if (sessionCookie) {
        const user = await admin.auth().verifySessionCookie(sessionCookie);
        console.log(user);
        await admin.auth().revokeRefreshTokens(user.sub);
    }
    reply.clearCookie("token", {
        path: "/",
    });
    return reply.status(200).send({ message: "logout successful" });
};
