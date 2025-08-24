import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/analytics - Get analytics data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '30d' // 7d, 30d, 90d, 1y
    const city = searchParams.get('city')

    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }

    const whereClause = city ? { user: { city } } : {}
    const userWhereClause = city ? { city } : {}

    // Get overall statistics
    const [
      totalUsers,
      totalFighters,
      totalDonors,
      totalEmergencyRequests,
      totalDonations,
      recentDonations,
      bloodGroupDistribution,
      cityDistribution,
      donationTrends,
      emergencyRequests
    ] = await Promise.all([
      // Total users
      prisma.user.count({ where: userWhereClause }),
      
      // Total fighters
      prisma.user.count({ 
        where: { 
          role: 'FIGHTER',
          ...userWhereClause
        }
      }),
      
      // Total donors (Bridge + Emergency)
      prisma.user.count({ 
        where: { 
          OR: [
            { role: 'BRIDGE_DONOR' },
            { role: 'EMERGENCY_DONOR' }
          ],
          ...userWhereClause
        }
      }),
      
      // Total emergency requests
      prisma.emergencyRequest.count({
        where: {
          createdAt: { gte: startDate },
          ...(city && { location: { contains: city, mode: 'insensitive' } })
        }
      }),
      
      // Total donations in time range
      prisma.donationTracker.count({
        where: {
          donationDate: { gte: startDate },
          ...whereClause
        }
      }),
      
      // Recent donations
      prisma.donationTracker.findMany({
        where: {
          donationDate: { gte: startDate },
          ...whereClause
        },
        include: {
          user: {
            select: {
              name: true,
              bloodGroup: true,
              city: true
            }
          }
        },
        orderBy: { donationDate: 'desc' },
        take: 10
      }),
      
      // Blood group distribution
      prisma.user.groupBy({
        by: ['bloodGroup'],
        where: userWhereClause,
        _count: {
          bloodGroup: true
        }
      }),
      
      // City distribution
      prisma.user.groupBy({
        by: ['city'],
        where: userWhereClause,
        _count: {
          city: true
        },
        orderBy: {
          _count: {
            city: 'desc'
          }
        },
        take: 10
      }),
      
      // Donation trends (by day)
      prisma.donationTracker.groupBy({
        by: ['donationDate'],
        where: {
          donationDate: { gte: startDate },
          ...whereClause
        },
        _count: {
          id: true
        },
        orderBy: {
          donationDate: 'asc'
        }
      }),
      
      // Emergency requests by urgency
      prisma.emergencyRequest.groupBy({
        by: ['urgencyLevel', 'status'],
        where: {
          createdAt: { gte: startDate },
          ...(city && { location: { contains: city, mode: 'insensitive' } })
        },
        _count: {
          id: true
        }
      })
    ])

    // Calculate success rates
    const completedDonations = await prisma.donationTracker.count({
      where: {
        donationStatus: 'COMPLETE',
        donationDate: { gte: startDate },
        ...whereClause
      }
    })

    const fulfilledRequests = await prisma.emergencyRequest.count({
      where: {
        status: 'FULFILLED',
        createdAt: { gte: startDate },
        ...(city && { location: { contains: city, mode: 'insensitive' } })
      }
    })

    const analytics = {
      overview: {
        totalUsers,
        totalFighters,
        totalDonors,
        totalEmergencyRequests,
        totalDonations,
        donationSuccessRate: totalDonations > 0 ? ((completedDonations / totalDonations) * 100).toFixed(1) : 0,
        requestFulfillmentRate: totalEmergencyRequests > 0 ? ((fulfilledRequests / totalEmergencyRequests) * 100).toFixed(1) : 0
      },
      recentActivity: {
        recentDonations,
        donationTrends: donationTrends.map(trend => ({
          date: trend.donationDate,
          count: trend._count.id
        }))
      },
      distributions: {
        bloodGroups: bloodGroupDistribution.map(bg => ({
          bloodGroup: bg.bloodGroup,
          count: bg._count.bloodGroup
        })),
        cities: cityDistribution.map(city => ({
          city: city.city,
          count: city._count.city
        }))
      },
      emergencyMetrics: {
        byUrgencyAndStatus: emergencyRequests.map(req => ({
          urgencyLevel: req.urgencyLevel,
          status: req.status,
          count: req._count.id
        }))
      }
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
