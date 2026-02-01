import { db } from "../firebase/server";

// create user if the user doesn't exist
export const createUser = async (userId: string, email: string) => {
  const userRef = db.collection('users').doc(userId);

  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    await userRef.set({
      email: email || null,
      createdAt: Date.now(),
    });
  }
}