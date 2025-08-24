import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

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
      location, 
      bloodType, 
      historicalData, 
      weatherData, 
      eventData 
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

    // Prepare context for AI prediction with detailed prompt
    const systemPrompt = `You are an advanced AI assistant specializing in blood donation analytics for the BloodLink healthcare platform. 

Your expertise includes:
- Blood bank inventory management
- Seasonal donation patterns
- Weather impact on donor behavior
- Emergency response protocols
- Blood type compatibility matrices
- Regional healthcare data analysis

Analyze the provided data comprehensively and generate accurate, actionable predictions.

CRITICAL: Respond ONLY with a valid JSON object containing exactly these fields:
{
  "predicted_demand": <number of blood units needed in next 7 days>,
  "confidence_level": <percentage 0-100 indicating prediction accuracy>,
  "critical_shortage_risk": <boolean true/false>,
  "recommended_actions": [<array of 3-5 specific action strings>],
  "optimal_collection_times": [<array of 3-4 time slot strings>],
  "demand_breakdown": {
    "emergency": <number>,
    "scheduled_surgeries": <number>, 
    "routine_needs": <number>
  },
  "risk_factors": [<array of risk factor strings>],
  "seasonal_adjustment": <percentage multiplier>
}

Do not include any text outside the JSON object.`

    const userPrompt = `Analyze this blood donation scenario:

LOCATION: ${location}
TARGET BLOOD TYPE: ${bloodType}

HISTORICAL DATA:
- Last month donations: ${historicalData.last_month_donations || 'Not provided'}
- Seasonal trend: ${historicalData.seasonal_trend || 'Not provided'}
- Average daily demand: ${historicalData.average_daily_demand || 'Not provided'}

WEATHER CONDITIONS:
- Temperature: ${weatherData.temperature || 'Not provided'}°C
- Humidity: ${weatherData.humidity || 'Not provided'}%
- Season: ${weatherData.season || 'Not provided'}

LOCAL EVENTS:
- Upcoming festivals: ${JSON.stringify(eventData.upcoming_festivals || [])}
- Local events: ${JSON.stringify(eventData.local_events || [])}

Provide a 7-day blood demand prediction with specific, actionable recommendations based on this data.`

    console.log('Sending request to Azure OpenAI...', {
      endpoint: process.env.AZURE_OPENAI_ENDPOINT,
      model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME
    })

    const completion = await openai.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-35-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3, // Lower temperature for more consistent predictions
      max_tokens: 1500,
      top_p: 0.95,
    })

    const response = completion.choices[0]?.message?.content
    console.log('Azure OpenAI Response:', response)

    if (!response) {
      throw new Error('No response from Azure OpenAI')
    }

    let prediction
    try {
      // Clean the response to ensure it's valid JSON
      const cleanedResponse = response.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '')
      prediction = JSON.parse(cleanedResponse)
      
      // Validate required fields
      const requiredFields = ['predicted_demand', 'confidence_level', 'critical_shortage_risk', 'recommended_actions', 'optimal_collection_times']
      for (const field of requiredFields) {
        if (prediction[field] === undefined) {
          throw new Error(`Missing required field: ${field}`)
        }
      }
      
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError, 'Response:', response)
      throw new Error('Invalid JSON response from Azure OpenAI')
    }

    return NextResponse.json({ 
      success: true, 
      prediction,
      generated_at: new Date().toISOString(),
      source: 'azure_openai',
      model_used: process.env.AZURE_OPENAI_DEPLOYMENT_NAME
    })

  } catch (error: any) {
    console.error('AI Prediction Error:', error)
    
    // Return detailed error for debugging
    if (error?.message?.includes('Azure OpenAI not configured')) {
      return NextResponse.json(
        { 
          error: error.message,
          setup_required: true,
          next_steps: [
            '1. Set up Azure OpenAI resource in Azure Portal',
            '2. Deploy gpt-35-turbo model',
            '3. Add AZURE_OPENAI_API_KEY to .env.local',
            '4. Add AZURE_OPENAI_ENDPOINT to .env.local'
          ]
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to generate AI prediction',
        details: error?.message || 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
