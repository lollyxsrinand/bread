import Fastify from 'fastify'
import { db } from './firebase/server'
import cors from '@fastify/cors'

const app = Fastify({logger : false})

const register = async () => {
  await app.register(cors, {
    origin: true,
  });
}

register()

app.get('/', async (request, reply) => {
  return { msg: 'what ya want' }
})

app.post('/signup', async(request, reply) => {
  console.log('trying to create a new user with some default data')
  const user = request.headers.authorization?.split(" ")[1] as string;

  try {
    await db.collection('users').doc(user).set({ budget: {} })
  } catch (error) {
    console.error(error)
    return reply.status(500).send({ error: 'Failed to create user' })
  }
  console.log('created user, everyone in the hamptons is happy now ')
  return reply.status(200).send({ message: 'User created successfully' })

})

const start = async () => {

  try {
    await app.listen({ port: parseInt(process.env.PORT || '3001'), host: '0.0.0.0' })
    console.log('🚀 app running on http://localhost:3001')
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

start()
