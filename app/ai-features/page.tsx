'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Users, 
  Clock, 
  AlertTriangle,
  MapPin,
  Phone,
  Loader2,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

interface PredictionData {
  predicted_demand: number
  confidence_level: number
  critical_shortage_risk: boolean
  recommended_actions: string[]
  optimal_collection_times: string[]
}

interface DonorMatch {
  id: string
  name: string
  bloodType: string
  distance: number
  matchScore: number
  estimatedArrival: string
  phone: string
  reliabilityScore: number
}

interface MatchingData {
  totalMatches: number
  topDonors: DonorMatch[]
  estimatedFulfillment: number
  averageResponseTime: string
  recommendations?: {
    immediateActions?: string[]
    contactSequence?: string[]
    backupStrategies?: string[]
  }
  aiAnalysis?: any
  riskAssessment?: any
}

export default function AIFeaturesDashboard() {
  const [prediction, setPrediction] = useState<PredictionData | null>(null)
  const [matching, setMatching] = useState<MatchingData | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'prediction' | 'matching'>('prediction')

  const generatePrediction = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ai/blood-prediction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'Mumbai, India',
          bloodType: 'O+',
          historicalData: {
            last_month_donations: 150,
            seasonal_trend: 'increasing',
            average_daily_demand: 12
          },
          weatherData: {
            temperature: 28,
            humidity: 75,
            season: 'monsoon'
          },
          eventData: {
            upcoming_festivals: ['Ganesh Chaturthi'],
            local_events: ['Blood Drive Campaign']
          }
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setPrediction(data.prediction)
      }
    } catch (error) {
      console.error('Prediction error:', error)
    } finally {
      setLoading(false)
    }
  }

  const findMatches = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ai/smart-matching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          urgencyLevel: 'high',
          bloodType: 'O+',
          location: 'Bandra, Mumbai',
          hospitalCoords: { lat: 19.0760, lng: 72.8777 },
          requiredUnits: 3
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setMatching(data.recommendations)
      }
    } catch (error) {
      console.error('Matching error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Brain className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">AI-Powered BloodLink</h1>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
            </Link>
          </div>
          <p className="text-gray-600">
            Access intelligent blood donation predictions and smart donor matching powered by Azure AI.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg mb-8 w-fit">
          <Button
            variant={activeTab === 'prediction' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('prediction')}
            className="rounded-md"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Demand Prediction
          </Button>
          <Button
            variant={activeTab === 'matching' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('matching')}
            className="rounded-md"
          >
            <Target className="h-4 w-4 mr-2" />
            Smart Matching
          </Button>
        </div>

        {/* Prediction Tab */}
        {activeTab === 'prediction' && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Blood Demand Prediction</h2>
                <Button 
                  onClick={generatePrediction} 
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Brain className="h-4 w-4 mr-2" />
                  )}
                  Generate AI Prediction
                </Button>
              </div>

              {prediction && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-600">Predicted Demand</span>
                        <Badge variant={prediction.critical_shortage_risk ? 'destructive' : 'default'}>
                          {prediction.critical_shortage_risk ? 'Critical' : 'Normal'}
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold text-blue-900">
                        {prediction.predicted_demand} units
                      </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <span className="text-sm font-medium text-green-600">Confidence Level</span>
                      <div className="mt-2">
                        <Progress value={prediction.confidence_level} className="w-full" />
                        <span className="text-sm text-green-700 mt-1 block">
                          {prediction.confidence_level}% accuracy
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        Optimal Collection Times
                      </h3>
                      <div className="space-y-2">
                        {prediction.optimal_collection_times.map((time, index) => (
                          <Badge key={index} variant="outline">{time}</Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Recommended Actions
                      </h3>
                      <ul className="space-y-1">
                        {prediction.recommended_actions.map((action, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Matching Tab */}
        {activeTab === 'matching' && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Smart Donor Matching</h2>
                <Button 
                  onClick={findMatches} 
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Target className="h-4 w-4 mr-2" />
                  )}
                  Find Best Matches
                </Button>
              </div>

              {matching && (
                <div className="space-y-6">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <Users className="h-5 w-5 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-green-600">Total Matches</span>
                      </div>
                      <div className="text-2xl font-bold text-green-900 mt-1">
                        {matching.totalMatches}
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <span className="text-sm font-medium text-blue-600">Fulfillment Rate</span>
                      <div className="mt-2">
                        <Progress value={matching.estimatedFulfillment} className="w-full" />
                        <span className="text-sm text-blue-700 mt-1 block">
                          {matching.estimatedFulfillment.toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-orange-600 mr-2" />
                        <span className="text-sm font-medium text-orange-600">Avg Response</span>
                      </div>
                      <div className="text-lg font-bold text-orange-900 mt-1">
                        {matching.averageResponseTime}
                      </div>
                    </div>
                  </div>

                  {/* Top Donors */}
                  <div>
                    <h3 className="font-semibold mb-4">Top Matched Donors</h3>
                    <div className="space-y-3">
                      {matching.topDonors.slice(0, 5).map((donor) => (
                        <Card key={donor.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <span className="font-bold text-red-600">{donor.bloodType}</span>
                              </div>
                              <div>
                                <h4 className="font-medium">{donor.name}</h4>
                                <div className="flex items-center text-sm text-gray-500 space-x-4">
                                  <span className="flex items-center">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {donor.distance.toFixed(1)} km
                                  </span>
                                  <span className="flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {donor.estimatedArrival}
                                  </span>
                                  <span className="flex items-center">
                                    <Phone className="h-3 w-3 mr-1" />
                                    {donor.phone}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant="default" className="mb-1">
                                {donor.matchScore.toFixed(0)}% match
                              </Badge>
                              <div className="text-xs text-gray-500">
                                Reliability: {donor.reliabilityScore}/10
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Critical Actions */}
                  {matching.recommendations?.immediateActions && matching.recommendations.immediateActions.length > 0 && (
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-red-800 mb-2 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Immediate Actions Required
                      </h3>
                      <ul className="space-y-1">
                        {matching.recommendations.immediateActions.map((action: string, index: number) => (
                          <li key={index} className="text-sm text-red-700">
                            • {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <Card className="p-6 mt-8">
          <h3 className="font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/live-tracking'}
              className="justify-start"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Live Donor Tracking
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/dashboard'}
              className="justify-start"
            >
              <Users className="h-4 w-4 mr-2" />
              Hospital Dashboard
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/donor-connect'}
              className="justify-start"
            >
              <Phone className="h-4 w-4 mr-2" />
              Donor Connect
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
