import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/donations - Get donation records
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {}
    if (userId) where.userId = userId
    if (status) where.donationStatus = status
    if (type) where.donationType = type

    const [donations, total] = await Promise.all([
      prisma.donationTracker.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              bloodGroup: true,
              city: true,
              mobile: true
            }
          },
          bridgeFighterInfo: {
            select: {
              bridgeName: true,
              frequencyInDays: true
            }
          }
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { donationDate: 'desc' }
      }),
      prisma.donationTracker.count({ where })
    ])

    return NextResponse.json({
      data: donations,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('Error fetching donations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch donations' },
      { status: 500 }
    )
  }
}

// POST /api/donations - Record new donation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Calculate next eligible date based on donation type
    let nextEligibleDate = new Date(body.donationDate)
    switch (body.donationType) {
      case 'BLOOD_BRIDGE_DONATION':
        nextEligibleDate.setDate(nextEligibleDate.getDate() + 90) // 3 months
        break
      case 'VOLUNTARY_DONATION':
        nextEligibleDate.setDate(nextEligibleDate.getDate() + 90) // 3 months
        break
      case 'PLATELET_DONATION':
        nextEligibleDate.setDate(nextEligibleDate.getDate() + 7) // 1 week
        break
      default:
        nextEligibleDate.setDate(nextEligibleDate.getDate() + 90)
    }

    const donation = await prisma.donationTracker.create({
      data: {
        userId: body.userId,
        donationDate: new Date(body.donationDate),
        nextEligibleDate,
        donationType: body.donationType,
        bridgeId: body.bridgeId,
        donationStatus: body.donationStatus || 'PENDING',
        units: body.units || 1,
        location: body.location,
        notes: body.notes
      },
      include: {
        user: {
          select: {
            name: true,
            bloodGroup: true,
            city: true
          }
        }
      }
    })

    // Create notification for successful donation
    if (donation.donationStatus === 'COMPLETE') {
      await prisma.notification.create({
        data: {
          userId: donation.userId,
          title: '✅ Donation Recorded Successfully',
          message: `Thank you for your ${donation.donationType} on ${donation.donationDate.toDateString()}. Next eligible date: ${donation.nextEligibleDate.toDateString()}`,
          type: 'GENERAL',
          priority: 'NORMAL'
        }
      })
    }

    return NextResponse.json(donation, { status: 201 })
  } catch (error) {
    console.error('Error recording donation:', error)
    return NextResponse.json(
      { error: 'Failed to record donation' },
      { status: 500 }
    )
  }
}
