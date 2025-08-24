import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/analytics/dashboard - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    console.log('Analytics dashboard API called');
    
    // Get comprehensive dashboard statistics
    const [
      totalUsers,
      totalDonors,
      emergencyDonors,
      bridgeFighters,
      fighters,
      totalDonations,
      totalEmergencyRequests,
      activeBridges
    ] = await Promise.all([
      // Total users
      prisma.user.count(),
      
      // Total donors (users who have made donations)
      prisma.user.count({
        where: {
          role: 'donor'
        }
      }),
      
      // Emergency donors (active donors available for emergency)
      prisma.user.count({
        where: {
          role: 'donor'
        }
      }),
      
      // Bridge fighters
      prisma.bridgeFighterInfo.count(),
      
      // Total fighters
      prisma.user.count({
        where: {
          role: 'fighter'
        }
      }),
      
      // Total donations
      prisma.donationTracker.count(),
      
      // Total emergency requests
      prisma.emergencyRequest.count(),
      
      // Active bridges (count unique bridge IDs)
      prisma.bridgeFighterInfo.groupBy({
        by: ['bridgeId'],
        _count: {
          bridgeId: true
        }
      })
    ])

    const stats = {
      totalUsers,
      totalDonors,
      emergencyDonors,
      bridgeFighters,
      fighters,
      totalDonations,
      totalEmergencyRequests: totalEmergencyRequests,
      emergencyRequests: totalEmergencyRequests, // For backward compatibility
      activeBridges: activeBridges.length
    }

    console.log('Analytics stats calculated:', stats);

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error)
    return NextResponse.json(
      {
        totalUsers: 0,
        totalDonors: 0,
        emergencyDonors: 0,
        bridgeFighters: 0,
        fighters: 0,
        totalDonations: 0,
        totalEmergencyRequests: 0,
        emergencyRequests: 0,
        activeBridges: 0
      },
      { status: 500 }
    )
  }
}
