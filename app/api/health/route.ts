import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database/prisma'

export async function GET(request: NextRequest) {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: 'disconnected'
  }

  try {
    if (prisma) {
      await prisma.$queryRaw`SELECT 1`
      health.database = 'connected'
    }
  } catch (error) {
    health.database = 'error'
  }

  return NextResponse.json(health)
}
