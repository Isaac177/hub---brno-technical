import { PrismaClient } from '@prisma/client'

declare global {
  var __prisma: PrismaClient | undefined
}

const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  })
}

export const prisma = globalThis.__prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}

const connectWithRetry = async (retries = 3, delay = 1000): Promise<void> => {
  for (let i = 0; i < retries; i++) {
    try {
      await prisma.$connect()
      console.log('✅ Database connected successfully')
      return
    } catch (error: any) {
      console.error(`❌ Database connection attempt ${i + 1} failed:`, {
        error: error.message,
        code: error.code,
        meta: error.meta
      })

      if (i === retries - 1) {
        console.error('❌ All database connection attempts failed')
        throw error
      }

      console.log(`⏳ Retrying connection in ${delay}ms...`)
      await new Promise(resolve => setTimeout(resolve, delay))
      delay *= 2
    }
  }
}

prisma.$use(async (params, next) => {
  const start = Date.now()

  try {
    const result = await next(params)
    const duration = Date.now() - start

    return result
  } catch (error: any) {
    const duration = Date.now() - start

    console.error(`💥 Query ${params.model}.${params.action} failed after ${duration}ms:`, {
      error: error.message,
      code: error.code,
      meta: error.meta
    })

    if (error.code === 'P2024' || error.code === 'P2021' || error.message.includes('TLS')) {
      console.log('🔄 Connection error detected, attempting to reconnect...')

      try {
        await prisma.$disconnect()
        await connectWithRetry(2, 1000)

        return await next(params)
      } catch (retryError) {
        console.error('💥 Retry failed:', retryError)
        throw error
      }
    }

    throw error
  }
})

connectWithRetry()
  .catch((error) => {
    console.error('💥 Failed to establish initial database connection:', error)
  })

const gracefulShutdown = async () => {
  console.log('🛑 Shutting down database connection...')
  try {
    await prisma.$disconnect()
    console.log('✅ Database connection closed')
  } catch (error) {
    console.error('❌ Error closing database connection:', error)
  }
}

process.on('SIGINT', gracefulShutdown)
process.on('SIGTERM', gracefulShutdown)
process.on('beforeExit', gracefulShutdown)
