import { FastifyReply, FastifyRequest } from "fastify";
import admin from 'firebase-admin'
import { sign, verify } from "jsonwebtoken";

import { setupUser } from "../../services/user-service";
import { db } from "../../firebase/server";

export async function loginHandler(request: FastifyRequest, reply: FastifyReply) {
    const { idToken } = request.body as { idToken: string };

    let decodedIdToken;

    try {
        decodedIdToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
        console.error('Error verifying ID token: ', error);
        return reply.status(401).send({ message: 'unauthorized' });
    }

    const uid = decodedIdToken.uid
    const userRef = db.collection('users').doc(uid)
    const userSnap = await userRef.get()

    if (!userSnap.exists) {
        await setupUser(uid, decodedIdToken.email ?? '') // creates user, default budget and default categories
    }

    const jwtToken = sign({ uid: uid },
        process.env.JWT_SECRET as string,
        { expiresIn: "7d", algorithm: "HS256" }
    )

    return reply.status(200).send({ jwtToken: jwtToken });
}


// or simply delete token bleh??>?D
export async function logoutHandler(request: FastifyRequest, reply: FastifyReply) {
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
