import { FastifyReply, FastifyRequest } from "fastify";
import admin from 'firebase-admin'
import { sign } from "jsonwebtoken";

import { setupUser } from "../../services/user-service";
import { db } from "../../firebase/server";

export async function loginHandler(request: FastifyRequest, reply: FastifyReply) {
    const { idToken } = request.body as { idToken: string };
    const expiresIn = 2 * 60 * 60; // 1 day

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

    if(!userSnap.exists) {
        await setupUser(uid, decodedIdToken.email || '') // creates user, default budget and default categories
    }

    const jwtToken = sign({ uid: decodedIdToken.uid, email: decodedIdToken.email },
        process.env.JWT_SECRET as string,
        { expiresIn: "2h", algorithm: "HS256" }
    )

    // commenting cuz cross site ew
    // reply.setCookie("token", jwtToken, {
    //     httpOnly: true,
    //     secure: true,
    //     sameSite: "none",
    //     path: '/',
    //     maxAge: expiresIn,
    // })

    return reply.status(200).send({ jwtToken: jwtToken });
}

// meaningless stuff
// export async function signupHandler(request: FastifyRequest, reply: FastifyReply) {
//     const { idToken } = request.body as { idToken: string };

//     let user;

//     try {
//         user = await admin.auth().verifyIdToken(idToken); // returns a decoded token -> user
//     } catch (error) {
//         console.error('Error verifying ID token: ', error);
//         return reply.status(401).send({ message: `unauthorized: ${error}` });
//     }

//     try {
//         await setupUser(user.uid, user.email || '') // creates user, default budget and default categories
//     } catch (error) {
//         console.error('Error creating user document: ', error);
//         return reply.status(500).send({ message: `Internal Server Error: ${error}` });
//     }
//     return loginHandler(request, reply);
// }

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
