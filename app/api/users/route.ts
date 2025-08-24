import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database/prisma'

// GET /api/users - Get all users with filters
export async function GET(request: NextRequest) {
  try {
    // Check if database is available
    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not initialized. Please run: npm run db:generate' },
        { status: 503 }
      )
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const bloodGroup = searchParams.get('bloodGroup')
    const city = searchParams.get('city')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const where: any = {}
    if (role) where.role = role
    if (bloodGroup) where.bloodGroup = bloodGroup
    if (city) where.city = { contains: city, mode: 'insensitive' }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          bridgeFighterInfo: true,
          bridgeMappings: true,
          donations: {
            orderBy: { donationDate: 'desc' },
            take: 3
          }
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ])

    return NextResponse.json({
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// POST /api/users - Create new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const user = await prisma.user.create({
      data: {
        userId: body.userId,
        name: body.name,
        gender: body.gender,
        mobile: body.mobile,
        dateOfBirth: new Date(body.dateOfBirth),
        bloodGroup: body.bloodGroup,
        city: body.city,
        pincode: body.pincode,
        role: body.role
      },
      include: {
        bridgeFighterInfo: true,
        bridgeMappings: true
      }
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
