import * as admin from "firebase-admin";

let app;

if (!admin.apps.length) {
  app = admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!)),
  });
} else {
  app = admin.app();
}

export { admin };
