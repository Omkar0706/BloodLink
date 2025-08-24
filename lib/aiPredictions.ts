import { useState, useEffect } from 'react';

// Mock AI/ML Prediction Engine
export interface BloodDemandPrediction {
  bloodType: string;
  city: string;
  currentStock: number;
  predictedDemand: number;
  daysUntilShortage: number;
  confidence: number;
  factors: {
    weather: string;
    events: string[];
    seasonality: number;
    historicalTrend: number;
  };
  recommendations: string[];
}

// Simulate AI predictions with realistic data
export const generateBloodDemandPredictions = (city: string): BloodDemandPrediction[] => {
  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const now = new Date();
  
  return bloodTypes.map(bloodType => {
    // Simulate complex AI calculations
    const baseStock = Math.floor(Math.random() * 100) + 20;
    const seasonalFactor = Math.sin((now.getMonth() + 1) * Math.PI / 6) * 0.3 + 1;
    const eventFactor = Math.random() * 0.5 + 0.75; // Upcoming events affect demand
    const weatherFactor = Math.random() * 0.3 + 0.85; // Weather affects accidents
    
    const predictedDemand = Math.floor(baseStock * seasonalFactor * eventFactor * weatherFactor);
    const shortage = Math.max(0, predictedDemand - baseStock);
    const daysUntilShortage = shortage > 0 ? Math.floor(Math.random() * 14) + 1 : -1;
    
    const confidence = Math.floor(Math.random() * 20) + 80; // 80-100% confidence
    
    // Generate contextual factors
    const events = getUpcomingEvents(city);
    const weather = getWeatherPrediction();
    const historicalTrend = Math.random() * 0.4 + 0.8; // 0.8-1.2 multiplier
    
    // Generate AI recommendations
    const recommendations = generateRecommendations(bloodType, shortage, daysUntilShortage);
    
    return {
      bloodType,
      city,
      currentStock: baseStock,
      predictedDemand,
      daysUntilShortage,
      confidence,
      factors: {
        weather,
        events: events.slice(0, 2), // Top 2 events
        seasonality: Math.floor(seasonalFactor * 100),
        historicalTrend: Math.floor(historicalTrend * 100)
      },
      recommendations
    };
  });
};

const getUpcomingEvents = (city: string): string[] => {
  const events = {
    'Mumbai': [
      'Ganesh Chaturthi Festival (Sept 2-12)',
      'Marathon Event (Jan 15)',
      'Cricket Match at Wankhede (Aug 28)',
      'Navratri Festival (Oct 3-12)',
      'New Year Celebrations (Dec 31)'
    ],
    'Delhi': [
      'Diwali Festival (Nov 1-5)',
      'Republic Day Parade (Jan 26)',
      'Holi Festival (Mar 8)',
      'Dussehra Festival (Oct 15)',
      'Independence Day (Aug 15)'
    ],
    'Bangalore': [
      'Karaga Festival (Apr 15)',
      'Tech Conference (Sept 20-22)',
      'Mysore Dasara (Oct 15-24)',
      'Bangalore Marathon (Nov 12)',
      'Music Festival (Dec 15-17)'
    ]
  };
  
  return events[city as keyof typeof events] || events['Mumbai'];
};

const getWeatherPrediction = (): string => {
  const conditions = [
    'Heavy Monsoon Expected (Higher accident risk)',
    'Clear Weather Forecast',
    'Mild Rain Expected', 
    'Hot Summer (Dehydration cases)',
    'Winter Season (Flu outbreak risk)',
    'Storm Warning (Emergency preparedness)'
  ];
  
  return conditions[Math.floor(Math.random() * conditions.length)];
};

const generateRecommendations = (bloodType: string, shortage: number, days: number): string[] => {
  const recommendations = [];
  
  if (shortage > 0) {
    recommendations.push(`🚨 Alert ${Math.ceil(shortage * 1.5)} ${bloodType} donors immediately`);
    
    if (days <= 3) {
      recommendations.push(`⚡ CRITICAL: Activate emergency donor network`);
      recommendations.push(`📱 Send push notifications to all nearby ${bloodType} donors`);
    } else if (days <= 7) {
      recommendations.push(`📧 Schedule donation campaigns for next week`);
      recommendations.push(`🏥 Coordinate with nearby hospitals for stock transfer`);
    } else {
      recommendations.push(`📅 Schedule regular donation drives`);
      recommendations.push(`🎯 Target donors who last donated >8 weeks ago`);
    }
    
    // Blood type specific recommendations
    if (bloodType === 'O-') {
      recommendations.push(`🩸 PRIORITY: O- is universal donor - critical shortage`);
    } else if (bloodType === 'AB+') {
      recommendations.push(`ℹ️ AB+ can receive any blood type if needed`);
    }
  } else {
    recommendations.push(`✅ Stock levels healthy for ${bloodType}`);
    recommendations.push(`📊 Monitor trends for any changes`);
  }
  
  return recommendations;
};

// React Hook for AI Predictions
export const useBloodDemandPredictions = (city: string) => {
  const [predictions, setPredictions] = useState<BloodDemandPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  useEffect(() => {
    const fetchPredictions = () => {
      setLoading(true);
      
      // Simulate AI processing time
      setTimeout(() => {
        const newPredictions = generateBloodDemandPredictions(city);
        setPredictions(newPredictions);
        setLastUpdated(new Date());
        setLoading(false);
      }, 1500); // 1.5 second "AI processing" delay
    };
    
    fetchPredictions();
    
    // Refresh predictions every 5 minutes in demo
    const interval = setInterval(fetchPredictions, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [city]);
  
  return {
    predictions,
    loading,
    lastUpdated,
    refresh: () => {
      const newPredictions = generateBloodDemandPredictions(city);
      setPredictions(newPredictions);
      setLastUpdated(new Date());
    }
  };
};

// AI Confidence Score Calculator
export const calculateOverallRisk = (predictions: BloodDemandPrediction[]) => {
  const criticalShortages = predictions.filter(p => p.daysUntilShortage > 0 && p.daysUntilShortage <= 7).length;
  const totalShortages = predictions.filter(p => p.daysUntilShortage > 0).length;
  
  if (criticalShortages > 0) return 'HIGH';
  if (totalShortages > 2) return 'MEDIUM';
  return 'LOW';
};

export const getAIInsights = (predictions: BloodDemandPrediction[]) => {
  const insights = [];
  
  const criticalTypes = predictions.filter(p => p.daysUntilShortage > 0 && p.daysUntilShortage <= 3);
  if (criticalTypes.length > 0) {
    insights.push(`🚨 URGENT: ${criticalTypes.length} blood types facing critical shortage within 3 days`);
  }
  
  const oNegative = predictions.find(p => p.bloodType === 'O-');
  if (oNegative && oNegative.daysUntilShortage > 0) {
    insights.push(`🩸 Universal donor O- shortage predicted - highest priority`);
  }
  
  const averageConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;
  insights.push(`🤖 AI Prediction Confidence: ${Math.floor(averageConfidence)}% (High Accuracy)`);
  
  return insights;
};
