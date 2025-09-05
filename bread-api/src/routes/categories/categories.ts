import { FastifyReply, FastifyRequest } from "fastify";
import { db } from '../../firebase/server'
import admin from 'firebase-admin'
// import { CategoryWithBudget, Category } from "bread-core/src";
import { getUserId } from "../../utils/auth";

export async function createCategoryHandler(request: FastifyRequest, reply: FastifyReply) {
  const userId = getUserId(request, reply);
  if (!userId) return;

  try {
    const categoryRef = db.collection('users').doc(userId).collection('categories').doc()
    const { name, categoryGroup, sortOrder, groupSortOrder, isHidden } = request.body as { name: string, categoryGroup: string, sortOrder: number, groupSortOrder: number, isHidden: boolean };
    const categoryGroupSnapshot = await db.collection('users').doc(userId).collection('categoryGroups').doc(categoryGroup).get();
    if (!categoryGroupSnapshot.exists) {
      return reply.status(400).send({ message: `Category with name '${categoryGroup}' does not exist. create one instead` });
    }
    await categoryRef.set({
      name,
      categoryGroup,
      sortOrder,
      groupSortOrder,
      isHidden: isHidden,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })
  } catch (error) {
    console.error('Error creating category: ', error);
    return reply.status(500).send({ message: 'we could not create da category lolwa' });
  }
  reply.send("ok")
}
export async function createCategoryGroupHandler(request: FastifyRequest, reply: FastifyReply) {
  const userId = getUserId(request, reply);
  if (!userId) return;

  try {
    const { name, sortOrder } = request.body as { name: string, sortOrder: number };
    const categoryGroupRef = db.collection('users').doc(userId).collection('categoryGroups').doc(name)

    await categoryGroupRef.set({
      name,
      sortOrder,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })
  } catch (error) {
    console.error('Error creating category group: ', error);
    return reply.status(500).send({ message: 'we could not create da category group lolwa' });
  }
  reply.send("ok")
}
export async function getCategoriesWithBudgetHandler(request: FastifyRequest, reply: FastifyReply) {
  const userId = getUserId(request, reply);
  if (!userId) return;

  try {
    const { month } = request.params as { month: string };
    const categoriesSnapshot = await db
      .collection('users')
      .doc(userId)
      .collection('categories')
      .get();

    const budgetEntrysSnapshot = await db
      .collection('users')
      .doc(userId)
      .collection('budgetMonths')
      .doc(month)
      .collection('budgetEntries')
      .get();

    const budgetEntryMap: any = {};
    budgetEntrysSnapshot.docs.forEach(doc => {
      budgetEntryMap[doc.id] = { id: doc.id, ...doc.data() }
    })

    const categoryNames = categoriesSnapshot.docs.map(doc => doc.data().name);
    console.log('Category Names:', categoryNames);

    const categories = categoriesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      ...budgetEntryMap[doc.id] || { budgetedAmount: 0, activityAmount: 0, availableAmount: 0 }
    }))

    console.log(categories);
    // budgetEntrysSnapshot.docs.forEach(doc => {
    //   console.log(doc.data());
    //   // budgetEntryMap[doc.id] = { id: doc.id, ...doc.data() }
    // })

    return reply.status(200).send(categories)

    // const categories = categoriesSnapshot.docs.map(doc => ({
    //   id: doc.id,
    //   ...doc.data()
    // }))



  } catch (error) {
    console.error('Error fetching categories with budget: ', error);
    return reply.status(500).send({ message: 'internal server error' });
  }
}
