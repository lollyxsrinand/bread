import Fastify from 'fastify'
import cors from '@fastify/cors'
import authRoutes from './routes/auth'
import transactionRoutes from './routes/transactions';
import accountRoutes from './routes/accounts';
import categoryRoutes from './routes/categories';

const app = Fastify({logger : false})

const registerCors = async () => {
  await app.register(cors, {
    origin: true,
  });
}

registerCors()
app.register(authRoutes)
app.register(transactionRoutes)
app.register(accountRoutes)
app.register(categoryRoutes)

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
