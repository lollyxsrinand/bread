import { FastifyReply, FastifyRequest } from "fastify";
import admin from 'firebase-admin';
import { db } from '../../firebase/server';
import { getUserId } from "../../utils/auth";

// export async function signupHandler(request: FastifyRequest, reply: FastifyReply) {
//     const authHeader = request.headers.authorization;
//     if (!authHeader || !authHeader.startsWith('Bearer ')) 
//       return reply.status(401).send({ message: 'header "bearer" required' });
  
//     const userId = authHeader.split(' ')[1];
//     if (!userId) 
//       return reply.status(400).send({ message: 'userId not found in bearer' });
  
//     const userSnapshot = await admin.firestore().collection('/users').doc(userId).get();
//     if(userSnapshot.exists) {
//       return reply.status(200).send({ message: 'user already exists', userId });
//     }
  
//     try {
//       const now = new Date()
//       const currentMonthId = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  
//       const batch = db.batch(); // batch() we use to perform multiple writes as a single atomic operation anta
//       const { email, username } = request.body as { email: string, username?: string };
  
//       const userRef = db.collection('users').doc(userId)
//       batch.set(userRef, {
//         email: email,
//         username: username,
//         createdAt: admin.firestore.FieldValue.serverTimestamp(),
//         lastLogin: admin.firestore.FieldValue.serverTimestamp(),
//         currency: 'INR', 
//       }, {merge: true}); // merge we use to avoid overwriting existing user data if called multiple times anta
  
//       const categoriesRef = userRef.collection('categories')
//       const starterCategories = [
//         { name: 'Rent/Mortgage', categoryGroup: 'Bills', sortOrder: 10, groupSortOrder: 10 },
//         { name: 'Phone', categoryGroup: 'Bills', sortOrder: 20, groupSortOrder: 10 },
//         { name: 'Internet', categoryGroup: 'Bills', sortOrder: 30, groupSortOrder: 10 },
//         { name: 'Utilities', categoryGroup: 'Bills', sortOrder: 40, groupSortOrder: 10 },
  
//         { name: 'Groceries', categoryGroup: 'Needs', sortOrder: 10, groupSortOrder: 20 },
//         { name: 'Transportation', categoryGroup: 'Needs', sortOrder: 20, groupSortOrder: 20 },
//         { name: 'Medical Expenses', categoryGroup: 'Needs', sortOrder: 30, groupSortOrder: 20 },
//         { name: 'Emergency Fund', categoryGroup: 'Needs', sortOrder: 40, groupSortOrder: 20 },
  
//         { name: 'Dining out', categoryGroup: 'Wants', sortOrder: 10, groupSortOrder: 30 },
//         { name: 'Entertainment', categoryGroup: 'Wants', sortOrder: 20, groupSortOrder: 30 },
//         { name: 'Vacation', categoryGroup: 'Wants', sortOrder: 30, groupSortOrder: 30 },
//         { name: 'Rainy Day', categoryGroup: 'Wants', sortOrder: 40, groupSortOrder: 30 },
//       ]
  
//       const categoryMap: { [key: string]: string } = {};
//       for (const cat of starterCategories) {
//         const categoryDocRef = categoriesRef.doc()
//         batch.set(categoryDocRef, {
//           ...cat,
//           createdAt: admin.firestore.FieldValue.serverTimestamp(),
//           updatedAt: admin.firestore.FieldValue.serverTimestamp(),
//         })
//         categoryMap[cat.name] = categoryDocRef.id;
//       }
  
//       const budgetMonthRef = userRef.collection('budgetMonths').doc(currentMonthId)
//       batch.set(budgetMonthRef, {
//         month: currentMonthId,
//         totalBudgeted: 0,
//         totalActivity: 0,
//         totalAvailable: 0,
//         incomeReceived: 0,
//         budgetedNextMonth: 0,
//       })
  
//       const budgetEntriesRef = budgetMonthRef.collection('budgetEntries');
//       for (const catName in categoryMap) {
//         const categoryId = categoryMap[catName]
//         const budgetEntryRef = budgetEntriesRef.doc(categoryId);
//         batch.set(budgetEntryRef, {
//           categoryId: categoryId,
//           budgetedAmount: 0,
//           activityAmount: 0,
//           availableAmount: 0,
//           notes: '',
//         })
//       }
  
//       const TransactionMonthRef = userRef.collection('transactions').doc(currentMonthId);
//       batch.set(TransactionMonthRef, {
//         month: currentMonthId,
//         inflow: 0,
//         outflow: 0,
//       })
  
//       await batch.commit();
//       return reply.status(200).send({ message: "user created sushesshfully", userId: userId})
  
  
//     } catch (error) {
//       console.error('Error creating user:', error);
//       return reply.status(500).send({ message: 'Failed to create user.', error: error instanceof Error ? error.message : 'Unknown error' });
//     }
// }


export async function signupHandler(request: FastifyRequest, reply: FastifyReply) {
  const userId = getUserId(request, reply);
  if (!userId) return;

  try {
      const now = new Date()
      const currMonth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
      const { email, username } = request.body as { email: string, username?: string };

      const userRef = db.collection('users').doc(userId);
      const categoriesRef = userRef.collection('categories');
      const batch = db.batch();
      batch.set(userRef, {
          email: email,
          username: username,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          lastLogin: admin.firestore.FieldValue.serverTimestamp(),
          currency: 'INR',
      }, { merge: true });
      const starterCategories = [
          { name: 'Rent/Mortgage', categoryGroup: 'Bills', sortOrder: 10, groupSortOrder: 10 },
          { name: 'Phone', categoryGroup: 'Bills', sortOrder: 20, groupSortOrder: 10 },
          { name: 'Internet', categoryGroup: 'Bills', sortOrder: 30, groupSortOrder: 10 },
          { name: 'Utilities', categoryGroup: 'Bills', sortOrder: 40, groupSortOrder: 10 },
          { name: 'Groceries', categoryGroup: 'Needs', sortOrder: 10, groupSortOrder: 20 },
          { name: 'Transportation', categoryGroup: 'Needs', sortOrder: 20, groupSortOrder: 20 },
          { name: 'Medical Expenses', categoryGroup: 'Needs', sortOrder: 30, groupSortOrder: 20 },
          { name: 'Emergency Fund', categoryGroup: 'Needs', sortOrder: 40, groupSortOrder: 20 },
          { name: 'Dining out', categoryGroup: 'Wants', sortOrder: 10, groupSortOrder: 30 },
          { name: 'Entertainment', categoryGroup: 'Wants', sortOrder: 20, groupSortOrder: 30 },
          { name: 'Vacation', categoryGroup: 'Wants', sortOrder: 30, groupSortOrder: 30 },
          { name: 'Rainy Day', categoryGroup: 'Wants', sortOrder: 40, groupSortOrder: 30 },
      ];
      


  } catch (error) {

  }
}