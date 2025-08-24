import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/emergency - Get emergency requests
export async function GET(request: NextRequest) {
  try {
    console.log('Emergency API GET called');
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const bloodGroup = searchParams.get('bloodGroup')
    const urgency = searchParams.get('urgency')
    const city = searchParams.get('city')

    const where: any = {}
    if (status) where.status = status
    if (bloodGroup) where.bloodGroup = bloodGroup
    if (urgency) where.urgencyLevel = urgency
    if (city) where.location = { contains: city, mode: 'insensitive' }

    console.log('Query filters:', where);

    const emergencyRequests = await prisma.emergencyRequest.findMany({
      where,
      include: {
        requester: {
          select: {
            name: true,
            mobile: true,
            city: true
          }
        },
        responses: {
          include: {
            // We'll need to add donor info when we have proper user relations
          }
        }
      },
      orderBy: [
        { urgencyLevel: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    console.log('Found emergency requests:', emergencyRequests.length);
    return NextResponse.json(emergencyRequests)
  } catch (error) {
    console.error('Error fetching emergency requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch emergency requests', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST /api/emergency - Create emergency request
export async function POST(request: NextRequest) {
  try {
    console.log('Emergency API POST called');
    const body = await request.json()
    console.log('Request body:', body);
    
    const emergencyRequest = await prisma.emergencyRequest.create({
      data: {
        requesterId: body.requesterId,
        patientName: body.patientName,
        bloodGroup: body.bloodGroup,
        unitsRequired: body.unitsRequired,
        urgencyLevel: body.urgencyLevel,
        location: body.location,
        contactNumber: body.contactNumber,
        hospitalName: body.hospitalName,
        description: body.description,
        requiredBy: new Date(body.requiredBy)
      },
      include: {
        requester: {
          select: {
            name: true,
            mobile: true,
            city: true
          }
        }
      }
    })

    console.log('Emergency request created:', emergencyRequest.id);

    // Send notifications to potential donors
    await notifyPotentialDonors(emergencyRequest)

    return NextResponse.json(emergencyRequest, { status: 201 })
  } catch (error) {
    console.error('Error creating emergency request:', error)
    return NextResponse.json(
      { error: 'Failed to create emergency request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Helper function to notify potential donors
async function notifyPotentialDonors(request: any) {
  try {
    // Find compatible donors in the same city
    const compatibleDonors = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'EMERGENCY_DONOR' },
          { role: 'BRIDGE_DONOR' }
        ],
        bloodGroup: request.bloodGroup,
        city: request.location
      }
    })

    // Create notifications for compatible donors
    const notifications = compatibleDonors.map((donor: any) => ({
      userId: donor.userId,
      title: `🚨 Emergency Blood Request - ${request.bloodGroup}`,
      message: `Urgent: ${request.unitsRequired} units needed for ${request.patientName} at ${request.hospitalName || request.location}`,
      type: 'EMERGENCY_REQUEST' as const,
      priority: request.urgencyLevel === 'CRITICAL' ? 'CRITICAL' as const : 'HIGH' as const
    }))

    await prisma.notification.createMany({
      data: notifications
    })

    console.log(`Notified ${compatibleDonors.length} potential donors`)
  } catch (error) {
    console.error('Error notifying donors:', error)
  }
}
