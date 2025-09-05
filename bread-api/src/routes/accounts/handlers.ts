import { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../../firebase/server";
import admin from 'firebase-admin'
import { getUserId } from "../../utils/auth";
import { assert } from "console";
import { get } from "http";

export async function createAccountHandler(request: FastifyRequest, reply: FastifyReply) {
  const userId = getUserId(request, reply);
  if (!userId) return; 

  try {
    const batch = db.batch()
    const { name, type, currency, balance } = request.body as { name: string, type: string, currency: string, balance: number };

    const userRef = db.collection('users').doc(userId);
    const accountRef = userRef.collection('accounts').doc();
    batch.set(accountRef, {
      name: name,
      type: type,
      currency: currency,
      balance: balance,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await batch.commit()
    return reply.status(200).send({ message: 'account added successfully' });
  } catch (error) {
    console.error('Error adding account: ', error);
    return reply.status(500).send({ message: 'internal server error' });
  }

}

export async function getAccountsHandler(request: FastifyRequest, reply: FastifyReply) {
  const userId = getUserId(request, reply);
  if (!userId) return; 

  try {
    const accountsSnapshot = await db
      .collection("users")
      .doc(userId)
      .collection("accounts")
      .get();

    const accounts = accountsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return reply.status(200).send(accounts);
  } catch (error) {
    console.error("Error fetching accounts: ", error);
    return reply.status(500).send({ message: "internal server error" });
  }
}

export async function getAccountHandler(request: FastifyRequest, reply: FastifyReply) {
  const userId = getUserId(request, reply);
  if (!userId) return; 

  const { id } = request.params as { id: string };

  try {
    const accountSnapshot = await db
      .collection("users")
      .doc(userId)
      .collection("accounts")
      .doc(id)
      .get();

    if (!accountSnapshot.exists) {
      return reply.status(404).send({ message: "Account not found" });
    }

    return reply.status(200).send(accountSnapshot.data());
  } catch (error) {
    console.error("Error fetching accounts: ", error);
    return reply.status(500).send({ message: "internal server error" });
  }
}

export async function updateAccountHandler(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer '))
    return reply.status(401).send({ message: 'header "bearer" required' });

  const userId = authHeader.split(' ')[1];

  if (!userId)
    return reply.status(400).send({ message: 'userId not found in bearer' });

  const { id } = request.params as { id: string };
  const { name, balance, type, currency } = request.body as Partial<{
    name: string;
    balance: number;
    type: string;
    currency: string;
  }>;


  const accountRef = db.collection('users')
    .doc(userId)
    .collection('accounts')
    .doc(id);

  await accountRef.update({
    ...(name && { name }),
    ...(balance !== undefined && { balance }),
    ...(type && { type }),
    ...(currency && { currency }),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  return reply.send({ success: true });
}

export async function deleteAccountHandler(request: FastifyRequest, reply: FastifyReply) {
  const userId = getUserId(request, reply);
  if (!userId) return; 

  const { id } = request.params as { id: string };

  try {
    const accountRef = db
      .collection("users")
      .doc(userId)
      .collection("accounts")
      .doc(id);

    const accountSnapshot = await accountRef.get();
    if (!accountSnapshot.exists) {
      return reply.status(404).send({ message: "Account not found" });
    }

    await accountRef.delete();
    return reply.status(200).send({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting account: ", error);
    return reply.status(500).send({ message: "internal server error" });
  }
}