'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  RefreshCw, 
  Calendar,
  MapPin,
  Activity,
  Zap,
  Target,
  Shield
} from 'lucide-react';
import { useBloodDemandPredictions, calculateOverallRisk, getAIInsights } from '@/lib/aiPredictions';
import { getBloodGroupColor } from '@/utils/helpers';

export default function AIPredictionDashboard() {
  const [selectedCity, setSelectedCity] = useState('Mumbai');
  const { predictions, loading, lastUpdated, refresh } = useBloodDemandPredictions(selectedCity);
  
  const overallRisk = calculateOverallRisk(predictions);
  const aiInsights = getAIInsights(predictions);
  
  const cities = ['Mumbai', 'Delhi', 'Bangalore'];
  
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'HIGH': return 'text-red-600 bg-red-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-green-600 bg-green-100';
    }
  };
  
  const getShortageColor = (days: number) => {
    if (days <= 0) return 'text-green-600 bg-green-100';
    if (days <= 3) return 'text-red-600 bg-red-100';
    if (days <= 7) return 'text-orange-600 bg-orange-100';
    return 'text-yellow-600 bg-yellow-100';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-purple-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">AI Blood Demand Predictor</span>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              <button
                onClick={refresh}
                disabled={loading}
                className="btn-primary flex items-center text-sm px-3 py-2"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh AI
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* AI Status Bar */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">🤖 AI Prediction Engine</h2>
              <p className="text-purple-100">Advanced machine learning algorithms predicting blood demand patterns</p>
            </div>
            <div className="text-right">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(overallRisk)}`}>
                <Shield className="h-4 w-4 mr-1" />
                {overallRisk} RISK
              </div>
              <p className="text-purple-100 text-sm mt-2">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {aiInsights.map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
            >
              <div className="flex items-start">
                <Zap className="h-5 w-5 text-purple-600 mr-3 mt-0.5" />
                <p className="text-sm text-gray-700">{insight}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {loading ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">🤖 AI analyzing patterns and generating predictions...</p>
          </div>
        ) : (
          <>
            {/* Predictions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {predictions.map((prediction, index) => (
                <motion.div
                  key={prediction.bloodType}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getBloodGroupColor(prediction.bloodType)}`}>
                      {prediction.bloodType}
                    </span>
                    <span className="text-sm text-gray-500">{prediction.confidence}% confidence</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Current Stock:</span>
                      <span className="font-medium">{prediction.currentStock} units</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Predicted Demand:</span>
                      <span className="font-medium">{prediction.predictedDemand} units</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shortage in:</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getShortageColor(prediction.daysUntilShortage)}`}>
                        {prediction.daysUntilShortage > 0 ? `${prediction.daysUntilShortage} days` : 'No shortage'}
                      </span>
                    </div>

                    {/* Progress bar showing demand vs stock */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          prediction.predictedDemand > prediction.currentStock 
                            ? 'bg-red-600' 
                            : 'bg-green-600'
                        }`}
                        style={{ 
                          width: `${Math.min(100, (prediction.predictedDemand / prediction.currentStock) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Detailed Predictions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Critical Shortages */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                  Critical Shortages Predicted
                </h3>
                
                <div className="space-y-4">
                  {predictions
                    .filter(p => p.daysUntilShortage > 0 && p.daysUntilShortage <= 7)
                    .map(prediction => (
                      <div key={prediction.bloodType} className="border border-red-200 rounded-lg p-4 bg-red-50">
                        <div className="flex items-center justify-between mb-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getBloodGroupColor(prediction.bloodType)}`}>
                            {prediction.bloodType}
                          </span>
                          <span className="text-sm font-medium text-red-600">
                            {prediction.daysUntilShortage} days remaining
                          </span>
                        </div>
                        
                        <div className="mb-3">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">AI Recommendations:</h4>
                          <div className="space-y-1">
                            {prediction.recommendations.slice(0, 2).map((rec, i) => (
                              <p key={i} className="text-xs text-gray-700">• {rec}</p>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                          <div>
                            <span className="font-medium">Weather Impact:</span>
                            <p>{prediction.factors.weather}</p>
                          </div>
                          <div>
                            <span className="font-medium">Events:</span>
                            <p>{prediction.factors.events[0] || 'No major events'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  
                  {predictions.filter(p => p.daysUntilShortage > 0 && p.daysUntilShortage <= 7).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <p>✅ No critical shortages predicted for the next 7 days</p>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Factors Analysis */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Activity className="h-5 w-5 text-purple-600 mr-2" />
                  AI Analysis Factors
                </h3>
                
                <div className="space-y-6">
                  {/* Weather Impact */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">🌤️ Weather Impact</h4>
                    <p className="text-sm text-gray-600">{predictions[0]?.factors.weather}</p>
                  </div>

                  {/* Upcoming Events */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">📅 Upcoming Events</h4>
                    <div className="space-y-1">
                      {predictions[0]?.factors.events.map((event, i) => (
                        <p key={i} className="text-sm text-gray-600">• {event}</p>
                      ))}
                    </div>
                  </div>

                  {/* Seasonal Trends */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">📈 Seasonal Analysis</h4>
                    <p className="text-sm text-gray-600">
                      Current seasonal factor: {predictions[0]?.factors.seasonality}% of normal demand
                    </p>
                  </div>

                  {/* Historical Trends */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">📊 Historical Patterns</h4>
                    <p className="text-sm text-gray-600">
                      Trend analysis: {predictions[0]?.factors.historicalTrend}% compared to last year
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
