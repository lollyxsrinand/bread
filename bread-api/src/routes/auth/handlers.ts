import { FastifyReply, FastifyRequest } from "fastify";
import admin from 'firebase-admin'
import { sign } from "jsonwebtoken";

import { createUser } from "../../services/user-service";

export async function loginHandler(request: FastifyRequest, reply: FastifyReply) {
    // console.log('trying to login');
    const { idToken } = request.body as { idToken: string };
    const expiresIn = 2 * 60 * 60; // 1 day

    let decoded;

    try {
        decoded = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
        console.error('Error verifying ID token: ', error);
        return reply.status(401).send({ message: 'unauthorized' });
    }

    const jwtToken = sign({ uid: decoded.uid, email: decoded.email },
        process.env.JWT_SECRET as string,
        { expiresIn: "2h", algorithm: "HS256" }
    )
    // console.log(jwtToken);

    reply.setCookie("token", jwtToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: '/',
        maxAge: expiresIn
    })

    return reply.status(200).send({ message: "login successful" });
}

export async function signupHandler(request: FastifyRequest, reply: FastifyReply) {
    const { idToken } = request.body as { idToken: string };

    let decoded;

    try {
        decoded = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
        console.error('Error verifying ID token: ', error);
        return reply.status(401).send({ message: `unauthorized: ${error}` });
    }

    try {
        await createUser(decoded.uid, decoded.email || '')
        // await createBudget(decoded.uid, (new Date()).getFullYear() as unknown as string);
    } catch (error) {
        console.error('Error creating user document: ', error);
        return reply.status(500).send({ message: `Internal Server Error: ${error}` });
    }
    return loginHandler(request, reply);
}

export async function logoutHandler(request: FastifyRequest, reply: FastifyReply) {
    const sessionCookie = request.cookies.session;
    if (sessionCookie) {
        const decoded = await admin.auth().verifySessionCookie(sessionCookie);
        console.log(decoded);
        await admin.auth().revokeRefreshTokens(decoded.sub);
    }
    reply.clearCookie("session", {
        path: "/",
    });
    return reply.status(200).send({ message: "logout successful" });
};
