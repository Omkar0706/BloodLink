import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}`,
  defaultQuery: { 'api-version': '2024-02-15-preview' },
  defaultHeaders: {
    'api-key': process.env.AZURE_OPENAI_API_KEY,
  },
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      urgencyLevel, 
      bloodType, 
      location, 
      hospitalCoords,
      requiredUnits 
    } = body

    // Validate Azure OpenAI configuration
    if (!process.env.AZURE_OPENAI_API_KEY || !process.env.AZURE_OPENAI_ENDPOINT) {
      return NextResponse.json(
        { 
          error: 'Azure OpenAI not configured. Please set AZURE_OPENAI_API_KEY and AZURE_OPENAI_ENDPOINT in .env.local',
          setup_guide: 'Follow the Azure AI Setup Guide in AZURE_AI_SETUP.md'
        },
        { status: 500 }
      )
    }

    // Get donor database (in real app, this would come from actual database)
    const availableDonors = await getDonorDatabase(hospitalCoords)

    // Use Azure OpenAI for intelligent donor ranking
    const systemPrompt = `You are an AI specialist in emergency blood donation logistics for the BloodLink platform.

Your expertise includes:
- Blood type compatibility matrices (ABO and Rh systems)
- Emergency response protocols
- Geographic optimization algorithms
- Donor reliability assessment
- Medical urgency classification

Analyze the provided donor data and emergency request to create an intelligent matching system.

CRITICAL: Respond ONLY with a valid JSON object:
{
  "analysis": {
    "urgency_assessment": "<critical/high/medium/low>",
    "compatibility_matrix": {<blood type compatibility analysis>},
    "geographic_optimization": "<strategy description>"
  },
  "ranked_donors": [
    {
      "donor_id": "<id>",
      "match_score": <0-100>,
      "priority_rank": <1-10>,
      "compatibility_reason": "<explanation>",
      "logistics_score": <0-100>,
      "availability_score": <0-100>
    }
  ],
  "recommendations": {
    "immediate_actions": [<array of actions>],
    "contact_sequence": [<array of donor IDs in contact order>],
    "estimated_response_time": "<time estimate>",
    "backup_strategies": [<array of backup plans>]
  },
  "risk_assessment": {
    "fulfillment_probability": <0-100>,
    "critical_factors": [<array of risk factors>],
    "mitigation_strategies": [<array of strategies>]
  }
}

Do not include any text outside the JSON object.`

    const donorDataForAI = availableDonors.map(donor => ({
      id: donor.id,
      bloodType: donor.bloodType,
      distance_km: calculateDistance(hospitalCoords, donor.coordinates),
      days_since_last_donation: donor.daysSinceLastDonation,
      reliability_score: donor.reliabilityScore,
      last_active: donor.lastActive
    }))

    const userPrompt = `Emergency Blood Request Analysis:

REQUEST DETAILS:
- Urgency Level: ${urgencyLevel}
- Required Blood Type: ${bloodType}
- Required Units: ${requiredUnits}
- Hospital Location: ${location}
- Hospital Coordinates: ${JSON.stringify(hospitalCoords)}

AVAILABLE DONOR POOL:
${JSON.stringify(donorDataForAI, null, 2)}

MEDICAL CONTEXT:
- Blood type compatibility rules must be strictly followed
- Distance optimization is critical for emergency response
- Donor availability (time since last donation) affects eligibility
- Reliability score indicates historical donation completion rate

Provide intelligent donor matching with detailed analysis and recommendations.`

    console.log('Sending donor matching request to Azure OpenAI...')

    const completion = await openai.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-35-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2, // Very low temperature for consistent medical decisions
      max_tokens: 2000,
      top_p: 0.9,
    })

    const response = completion.choices[0]?.message?.content
    console.log('Azure OpenAI Matching Response:', response)

    if (!response) {
      throw new Error('No response from Azure OpenAI')
    }

    let aiAnalysis
    try {
      const cleanedResponse = response.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '')
      aiAnalysis = JSON.parse(cleanedResponse)
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError, 'Response:', response)
      throw new Error('Invalid JSON response from Azure OpenAI')
    }

    // Combine AI analysis with actual donor data
    const enhancedDonors = availableDonors.map(donor => {
      const aiDonorData = aiAnalysis.ranked_donors?.find((d: any) => d.donor_id === donor.id) || {}
      return {
        ...donor,
        distance: calculateDistance(hospitalCoords, donor.coordinates),
        estimatedArrival: calculateETA(hospitalCoords, donor.coordinates),
        matchScore: aiDonorData.match_score || 0,
        priorityRank: aiDonorData.priority_rank || 999,
        compatibilityReason: aiDonorData.compatibility_reason || 'Standard compatibility',
        logisticsScore: aiDonorData.logistics_score || 0,
        availabilityScore: aiDonorData.availability_score || 0
      }
    }).sort((a, b) => (b.matchScore - a.matchScore) || (a.priorityRank - b.priorityRank))

    const recommendations = {
      totalMatches: enhancedDonors.length,
      topDonors: enhancedDonors.slice(0, Math.min(10, requiredUnits * 3)),
      urgencyLevel,
      requestedBloodType: bloodType,
      estimatedFulfillment: aiAnalysis.risk_assessment?.fulfillment_probability || 0,
      averageResponseTime: aiAnalysis.recommendations?.estimated_response_time || 'Unknown',
      aiAnalysis: aiAnalysis.analysis || {},
      immediateActions: aiAnalysis.recommendations?.immediate_actions || [],
      contactSequence: aiAnalysis.recommendations?.contact_sequence || [],
      backupStrategies: aiAnalysis.recommendations?.backup_strategies || [],
      riskAssessment: aiAnalysis.risk_assessment || {}
    }

    return NextResponse.json({ 
      success: true, 
      recommendations,
      generated_at: new Date().toISOString(),
      source: 'azure_openai',
      model_used: process.env.AZURE_OPENAI_DEPLOYMENT_NAME
    })

  } catch (error: any) {
    console.error('Donor Matching Error:', error)
    
    if (error?.message?.includes('Azure OpenAI not configured')) {
      return NextResponse.json(
        { 
          error: error.message,
          setup_required: true
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to generate smart donor matching',
        details: error?.message || 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// Enhanced donor database with more realistic data
async function getDonorDatabase(hospitalCoords: any) {
  // In a real application, this would query your actual donor database
  // For now, return enhanced sample data around the hospital location
  const baseCoords = hospitalCoords
  const donors = [
    {
      id: 'donor_001',
      name: 'Rajesh Kumar',
      bloodType: 'O+',
      coordinates: { 
        lat: baseCoords.lat + (Math.random() - 0.5) * 0.01, 
        lng: baseCoords.lng + (Math.random() - 0.5) * 0.01 
      },
      daysSinceLastDonation: 95,
      reliabilityScore: 9,
      phone: '+91-9876543210',
      lastActive: '2024-08-24T08:30:00Z',
      medicalEligible: true,
      emergencyContact: true
    },
    {
      id: 'donor_002',
      name: 'Priya Sharma',
      bloodType: 'O-',
      coordinates: { 
        lat: baseCoords.lat + (Math.random() - 0.5) * 0.02, 
        lng: baseCoords.lng + (Math.random() - 0.5) * 0.02 
      },
      daysSinceLastDonation: 120,
      reliabilityScore: 10,
      phone: '+91-9876543211',
      lastActive: '2024-08-24T07:15:00Z',
      medicalEligible: true,
      emergencyContact: true
    },
    {
      id: 'donor_003',
      name: 'Amit Patel',
      bloodType: 'A+',
      coordinates: { 
        lat: baseCoords.lat + (Math.random() - 0.5) * 0.015, 
        lng: baseCoords.lng + (Math.random() - 0.5) * 0.015 
      },
      daysSinceLastDonation: 80,
      reliabilityScore: 8,
      phone: '+91-9876543212',
      lastActive: '2024-08-24T09:00:00Z',
      medicalEligible: true,
      emergencyContact: false
    },
    {
      id: 'donor_004',
      name: 'Sneha Reddy',
      bloodType: 'B+',
      coordinates: { 
        lat: baseCoords.lat + (Math.random() - 0.5) * 0.025, 
        lng: baseCoords.lng + (Math.random() - 0.5) * 0.025 
      },
      daysSinceLastDonation: 110,
      reliabilityScore: 9,
      phone: '+91-9876543213',
      lastActive: '2024-08-24T06:45:00Z',
      medicalEligible: true,
      emergencyContact: true
    },
    {
      id: 'donor_005',
      name: 'Vikram Singh',
      bloodType: 'AB+',
      coordinates: { 
        lat: baseCoords.lat + (Math.random() - 0.5) * 0.02, 
        lng: baseCoords.lng + (Math.random() - 0.5) * 0.02 
      },
      daysSinceLastDonation: 70,
      reliabilityScore: 7,
      phone: '+91-9876543214',
      lastActive: '2024-08-24T10:20:00Z',
      medicalEligible: true,
      emergencyContact: false
    }
  ]

  return donors
}

// Blood compatibility matrix
function getBloodCompatibility(requiredType: string, donorType: string): number {
  const compatibility: { [key: string]: string[] } = {
    'O-': ['O-'],
    'O+': ['O-', 'O+'],
    'A-': ['O-', 'A-'],
    'A+': ['O-', 'O+', 'A-', 'A+'],
    'B-': ['O-', 'B-'],
    'B+': ['O-', 'O+', 'B-', 'B+'],
    'AB-': ['O-', 'A-', 'B-', 'AB-'],
    'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']
  }
  
  const compatibleTypes = compatibility[requiredType] || []
  if (compatibleTypes.includes(donorType)) {
    // Perfect match gets highest score
    if (requiredType === donorType) return 100
    // Universal donor O- gets high score
    if (donorType === 'O-') return 90
    // Other compatible types
    return 80
  }
  return 0 // Not compatible
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(coord1: any, coord2: any): number {
  const R = 6371 // Earth's radius in km
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180
  const dLng = (coord2.lng - coord1.lng) * Math.PI / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Calculate estimated time of arrival
function calculateETA(hospitalCoords: any, donorCoords: any): string {
  const distance = calculateDistance(hospitalCoords, donorCoords)
  const averageSpeed = 30 // km/h average speed in city traffic
  const timeInHours = distance / averageSpeed
  const timeInMinutes = Math.round(timeInHours * 60)
  
  if (timeInMinutes < 60) {
    return `${timeInMinutes} minutes`
  } else {
    const hours = Math.floor(timeInMinutes / 60)
    const minutes = timeInMinutes % 60
    return `${hours}h ${minutes}m`
  }
}
