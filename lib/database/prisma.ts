import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

let prismaInstance: PrismaClient | null = null

try {
  prismaInstance = globalForPrisma.prisma ?? new PrismaClient()
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaInstance
} catch (error) {
  console.error('Prisma initialization failed:', error)
  console.log('Please run: npm run db:generate')
}

export const prisma = prismaInstance

// Database connection helper
export async function connectToDatabase() {
  try {
    await prisma.$connect()
    console.log('✅ Connected to database')
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    throw error
  }
}

// Database disconnect helper
export async function disconnectFromDatabase() {
  try {
    await prisma.$disconnect()
    console.log('✅ Disconnected from database')
  } catch (error) {
    console.error('❌ Database disconnection failed:', error)
  }
}

// Health check function
export async function checkDatabaseHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return { status: 'healthy', timestamp: new Date().toISOString() }
  } catch (error) {
    console.error('Database health check failed:', error)
    return { status: 'unhealthy', error: error, timestamp: new Date().toISOString() }
  }
}
