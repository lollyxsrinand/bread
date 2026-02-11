import Fastify from 'fastify'
import cors from '@fastify/cors'
import cookie from '@fastify/cookie';

import authRoutes from './routes/auth'
import accountRoutes from './routes/accounts';
import budgetRoutes from './routes/budget';
import { getUserId } from './utils/auth';
import idkRoutes from './routes/idk';

const app = Fastify({ logger: false })


const registerCors = async () => {
  await app.register(cors, {
    origin: ['http://localhost:3000', 'https://bread-webapp.vercel.app', 'http://localhost:3001'],
    credentials: true,
  });
}
registerCors()

app.register(cookie, { hook: 'onRequest' })

app.register(authRoutes)
app.register(accountRoutes)
app.register(budgetRoutes)
app.register(idkRoutes)


app.get('/ping', async (request, reply) => {
  return { message: 'pong 🏓' }
})


const start = async () => {
  try {
    await app.listen({ port: parseInt(process.env.PORT || '3001'), host: '0.0.0.0' })
    console.log('👧 app running on http://localhost:3001')
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

start()
