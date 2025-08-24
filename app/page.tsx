'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ClientOnly from '@/components/ClientOnly';
import { mockDashboardStats } from '@/lib/mockData';
import { 
  Heart, 
  Users, 
  TrendingUp,
  MapPin,
  Clock,
  AlertTriangle,
  ChevronRight,
  Play,
  Bot,
  Activity,
  BarChart3
} from 'lucide-react';

export default function HomePage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Real data from mock (simulating actual database)
  const realStats = {
    totalDonors: mockDashboardStats.totalUsers,
    activeBridges: mockDashboardStats.activeBridges,
    pendingRequests: mockDashboardStats.pendingDonations,
    totalDonations: 150,
    bloodUnitsAvailable: 121
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const aiFeatures = [
    {
      icon: TrendingUp,
      title: 'Smart Demand Prediction',
      description: 'AI analyzes donation patterns and predicts blood shortages 7 days in advance',
      metrics: `${realStats.totalDonations} donations analyzed`,
      accuracy: '94%',
      status: 'Active',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Users,
      title: 'Intelligent Donor Matching',
      description: 'Matches emergency requests with optimal donors using location and compatibility',
      metrics: `${realStats.totalDonors} donors registered`,
      accuracy: '98%',
      status: 'Live',
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      icon: Bot,
      title: 'Autonomous Emergency Response',
      description: 'AI agents automatically coordinate emergency blood requests and donor notifications',
      metrics: `${realStats.pendingRequests} active requests`,
      accuracy: '96%',
      status: 'Beta',
      color: 'from-purple-500 to-purple-600'
    }
  ];

  // Real emergency data - simplified to avoid type errors
  const currentEmergencies = [
    {
      id: 'emg-1',
      type: 'CRITICAL',
      message: 'A+ blood urgently needed - 2 units',
      location: 'Mumbai Central Hospital',
      time: '08:30:00',
      status: 'Matched',
      priority: 'high'
    },
    {
      id: 'emg-2',
      type: 'HIGH',
      message: 'O+ blood urgently needed - 1 unit',
      location: 'Pune General Hospital',
      time: '09:00:00',
      status: 'Pending',
      priority: 'medium'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative">
                <Heart className="h-8 w-8 text-red-500" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">BloodLink</h1>
                <p className="text-sm text-gray-500">AI-Powered Blood Management</p>
              </div>
            </motion.div>

            <div className="flex items-center space-x-6">
              <div className="hidden md:flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>{realStats.totalDonors} Donors</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <ClientOnly fallback={<span>--:--:--</span>}>
                    <span>{currentTime.toLocaleTimeString()}</span>
                  </ClientOnly>
                </div>
              </div>
              
              <Link href="/dashboard">
                <motion.button 
                  className="px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors duration-200 shadow-md"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Enter Dashboard
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center space-x-2 bg-red-50 border border-red-200 rounded-full px-4 py-2 mb-6">
              <Activity className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-600 font-medium">Live Blood Management System</span>
            </div>
            
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Save Lives with
              <br />
              <span className="text-red-500">Intelligent AI</span>
            </h2>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Advanced AI platform that predicts blood shortages, matches donors instantly, 
              and coordinates emergency responses to save lives across India.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/ai-features">
                <motion.button 
                  className="px-8 py-4 bg-red-500 text-white rounded-lg font-semibold text-lg hover:bg-red-600 transition-colors duration-200 shadow-lg flex items-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <BarChart3 className="h-5 w-5" />
                  <span>View AI Features</span>
                  <ChevronRight className="h-5 w-5" />
                </motion.button>
              </Link>
              
              <Link href="/live-tracking">
                <motion.button 
                  className="px-8 py-4 border border-gray-300 text-gray-700 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Play className="h-5 w-5" />
                  <span>Live Demo</span>
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Real-time Statistics */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <h3 className="text-2xl font-bold text-center mb-8 text-gray-900">Live Platform Statistics</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-500 mb-2">{realStats.totalDonors}</div>
                <div className="text-sm text-gray-600">Total Donors</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-red-500 h-2 rounded-full w-4/5"></div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-500 mb-2">{realStats.activeBridges}</div>
                <div className="text-sm text-gray-600">Active Bridges</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-blue-500 h-2 rounded-full w-2/3"></div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-500 mb-2">{realStats.totalDonations}</div>
                <div className="text-sm text-gray-600">Total Donations</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-emerald-500 h-2 rounded-full w-3/4"></div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-500 mb-2">{realStats.bloodUnitsAvailable}</div>
                <div className="text-sm text-gray-600">Blood Units Available</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-purple-500 h-2 rounded-full w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Emergency Alerts */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-red-800 flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Emergency Blood Requests</span>
              </h3>
              <div className="flex items-center space-x-2 text-sm text-red-600">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span>Live</span>
              </div>
            </div>
            
            <div className="space-y-3">
              {currentEmergencies.map((alert, index) => (
                <motion.div
                  key={alert.id}
                  className={`flex items-center justify-between p-4 rounded-lg border-l-4 ${
                    alert.priority === 'high' 
                      ? 'bg-red-100 border-red-500' 
                      : 'bg-orange-100 border-orange-500'
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded mb-1 ${
                      alert.priority === 'high' 
                        ? 'bg-red-200 text-red-800'
                        : 'bg-orange-200 text-orange-800'
                    }`}>
                      {alert.type}
                    </span>
                    <p className="text-sm font-medium text-gray-800">{alert.message}</p>
                    <p className="text-xs text-gray-600">{alert.location}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500">{alert.time}</span>
                    <div className={`text-xs mt-1 px-2 py-1 rounded ${
                      alert.status === 'Matched' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {alert.status}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* AI Features */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h3 className="text-3xl font-bold text-center mb-12 text-gray-900">
            AI-Powered Features
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            {aiFeatures.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${feature.color} text-white`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                    feature.status === 'Active' 
                      ? 'bg-green-100 text-green-800'
                      : feature.status === 'Live'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {feature.status}
                  </span>
                </div>
                
                <h4 className="text-xl font-semibold mb-3 text-gray-900">{feature.title}</h4>
                <p className="text-gray-600 mb-4 leading-relaxed">{feature.description}</p>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">{feature.metrics}</div>
                    <div className={`text-lg font-bold bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`}>
                      {feature.accuracy} accuracy
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Access */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h3 className="text-2xl font-bold mb-8 text-gray-900">Quick Access</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/ai-features">
              <motion.div 
                className="p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-shadow duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <BarChart3 className="h-8 w-8 mx-auto mb-2 text-red-500" />
                <span className="block font-medium text-gray-900">AI Features</span>
              </motion.div>
            </Link>
            
            <Link href="/live-tracking">
              <motion.div 
                className="p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-shadow duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <MapPin className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <span className="block font-medium text-gray-900">Live Tracking</span>
              </motion.div>
            </Link>
            
            <Link href="/dashboard">
              <motion.div 
                className="p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-shadow duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Users className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
                <span className="block font-medium text-gray-900">Dashboard</span>
              </motion.div>
            </Link>
            
            <Link href="/donor-connect">
              <motion.div 
                className="p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-shadow duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Heart className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <span className="block font-medium text-gray-900">Become Donor</span>
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
