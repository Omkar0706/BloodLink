'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plane, 
  MapPin, 
  Clock, 
  Battery, 
  Thermometer,
  CheckCircle,
  AlertCircle,
  Navigation,
  Zap,
  Heart,
  Package
} from 'lucide-react';

interface DroneDelivery {
  id: string;
  bloodType: string;
  fromHospital: string;
  toHospital: string;
  distance: number;
  estimatedTime: number;
  currentTime: number;
  status: 'preparing' | 'in-transit' | 'delivered' | 'emergency';
  temperature: number;
  batteryLevel: number;
  gpsCoords: { lat: number; lng: number };
  priority: 'low' | 'medium' | 'high' | 'critical';
  bloodUnits: number;
}

const mockDeliveries: DroneDelivery[] = [
  {
    id: 'DRN-001',
    bloodType: 'O-',
    fromHospital: 'KEM Hospital',
    toHospital: 'Lilavati Hospital',
    distance: 12.5,
    estimatedTime: 18,
    currentTime: 5,
    status: 'in-transit',
    temperature: 2.1,
    batteryLevel: 78,
    gpsCoords: { lat: 19.0760, lng: 72.8777 },
    priority: 'critical',
    bloodUnits: 4
  },
  {
    id: 'DRN-002',
    bloodType: 'A+',
    fromHospital: 'Apollo Hospital',
    toHospital: 'Fortis Hospital',
    distance: 8.3,
    estimatedTime: 12,
    currentTime: 12,
    status: 'delivered',
    temperature: 3.8,
    batteryLevel: 45,
    gpsCoords: { lat: 19.1136, lng: 72.8697 },
    priority: 'high',
    bloodUnits: 2
  },
  {
    id: 'DRN-003',
    bloodType: 'B+',
    fromHospital: 'Hinduja Hospital',
    toHospital: 'Breach Candy Hospital',
    distance: 6.7,
    estimatedTime: 10,
    currentTime: 0,
    status: 'preparing',
    temperature: 4.0,
    batteryLevel: 92,
    gpsCoords: { lat: 19.0176, lng: 72.8562 },
    priority: 'medium',
    bloodUnits: 3
  }
];

export default function DroneDeliveryDashboard() {
  const [deliveries, setDeliveries] = useState<DroneDelivery[]>(mockDeliveries);
  const [selectedDrone, setSelectedDrone] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setDeliveries(prev => prev.map(delivery => {
        if (delivery.status === 'in-transit' && delivery.currentTime < delivery.estimatedTime) {
          return {
            ...delivery,
            currentTime: delivery.currentTime + 1,
            batteryLevel: Math.max(0, delivery.batteryLevel - 1),
            temperature: 2 + Math.random() * 2, // Keep temperature between 2-4°C
            gpsCoords: {
              lat: delivery.gpsCoords.lat + (Math.random() - 0.5) * 0.001,
              lng: delivery.gpsCoords.lng + (Math.random() - 0.5) * 0.001
            }
          };
        }
        if (delivery.status === 'in-transit' && delivery.currentTime >= delivery.estimatedTime) {
          return { ...delivery, status: 'delivered' };
        }
        return delivery;
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'preparing': return 'text-blue-600 bg-blue-100';
      case 'in-transit': return 'text-green-600 bg-green-100';
      case 'delivered': return 'text-gray-600 bg-gray-100';
      case 'emergency': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getProgressPercentage = (delivery: DroneDelivery) => {
    return Math.min(100, (delivery.currentTime / delivery.estimatedTime) * 100);
  };

  const simulateNewDelivery = () => {
    const newDelivery: DroneDelivery = {
      id: `DRN-${String(Date.now()).slice(-3)}`,
      bloodType: ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'][Math.floor(Math.random() * 8)],
      fromHospital: 'Blood Bank Central',
      toHospital: 'Emergency Hospital',
      distance: 5 + Math.random() * 20,
      estimatedTime: 8 + Math.floor(Math.random() * 20),
      currentTime: 0,
      status: 'preparing',
      temperature: 2 + Math.random() * 2,
      batteryLevel: 85 + Math.random() * 15,
      gpsCoords: { lat: 19.0760 + (Math.random() - 0.5) * 0.1, lng: 72.8777 + (Math.random() - 0.5) * 0.1 },
      priority: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any,
      bloodUnits: 1 + Math.floor(Math.random() * 5)
    };

    setDeliveries(prev => [newDelivery, ...prev]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Plane className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Drone Delivery Network</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsTracking(!isTracking)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  isTracking 
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-gray-100 text-gray-700 border border-gray-300'
                }`}
              >
                <Navigation className="h-4 w-4 mr-2 inline" />
                {isTracking ? 'Live Tracking ON' : 'Live Tracking OFF'}
              </button>
              <button
                onClick={simulateNewDelivery}
                className="btn-primary flex items-center text-sm px-4 py-2"
              >
                <Package className="h-4 w-4 mr-2" />
                New Emergency Delivery
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Plane className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Drones</p>
                <p className="text-2xl font-bold text-gray-900">
                  {deliveries.filter(d => d.status === 'in-transit').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Today</p>
                <p className="text-2xl font-bold text-gray-900">
                  {deliveries.filter(d => d.status === 'delivered').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Delivery Time</p>
                <p className="text-2xl font-bold text-gray-900">14m</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Lives Saved</p>
                <p className="text-2xl font-bold text-gray-900">127</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Drone List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Active Deliveries</h3>
              </div>
              
              <div className="divide-y divide-gray-200">
                <AnimatePresence>
                  {deliveries.map((delivery) => (
                    <motion.div
                      key={delivery.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={`p-6 cursor-pointer hover:bg-gray-50 ${
                        selectedDrone === delivery.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                      onClick={() => setSelectedDrone(delivery.id)}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <Plane className={`h-5 w-5 mr-3 ${
                            delivery.status === 'in-transit' ? 'text-blue-600 animate-pulse' : 'text-gray-400'
                          }`} />
                          <div>
                            <p className="font-semibold text-gray-900">{delivery.id}</p>
                            <p className="text-sm text-gray-600">{delivery.bloodType} • {delivery.bloodUnits} units</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(delivery.priority)}`}>
                            {delivery.priority.toUpperCase()}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                            {delivery.status.replace('-', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">From:</span> {delivery.fromHospital}
                        </div>
                        <div>
                          <span className="font-medium">To:</span> {delivery.toHospital}
                        </div>
                        <div>
                          <span className="font-medium">Distance:</span> {delivery.distance.toFixed(1)} km
                        </div>
                        <div>
                          <span className="font-medium">ETA:</span> {delivery.estimatedTime - delivery.currentTime}m
                        </div>
                      </div>

                      {delivery.status === 'in-transit' && (
                        <div className="mb-4">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>{Math.round(getProgressPercentage(delivery))}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <motion.div 
                              className="bg-blue-600 h-2 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${getProgressPercentage(delivery)}%` }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center space-x-6 text-sm">
                        <div className="flex items-center">
                          <Battery className="h-4 w-4 text-green-600 mr-1" />
                          <span className={delivery.batteryLevel < 20 ? 'text-red-600' : 'text-gray-600'}>
                            {delivery.batteryLevel}%
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Thermometer className="h-4 w-4 text-blue-600 mr-1" />
                          <span className={delivery.temperature > 6 ? 'text-red-600' : 'text-gray-600'}>
                            {delivery.temperature.toFixed(1)}°C
                          </span>
                        </div>
                        {delivery.status === 'in-transit' && isTracking && (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 text-purple-600 mr-1" />
                            <span className="text-gray-600">
                              {delivery.gpsCoords.lat.toFixed(4)}, {delivery.gpsCoords.lng.toFixed(4)}
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Drone Details */}
          <div className="space-y-6">
            {selectedDrone && (
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Drone Details</h3>
                {(() => {
                  const drone = deliveries.find(d => d.id === selectedDrone);
                  if (!drone) return null;
                  
                  return (
                    <div className="space-y-4">
                      <div className="text-center">
                        <Plane className={`h-16 w-16 mx-auto mb-2 ${
                          drone.status === 'in-transit' ? 'text-blue-600 animate-bounce' : 'text-gray-400'
                        }`} />
                        <p className="font-semibold text-gray-900">{drone.id}</p>
                        <p className="text-sm text-gray-600">{drone.status.replace('-', ' ').toUpperCase()}</p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Blood Type:</span>
                          <span className="text-sm font-medium">{drone.bloodType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Units:</span>
                          <span className="text-sm font-medium">{drone.bloodUnits}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Priority:</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(drone.priority)}`}>
                            {drone.priority.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Distance:</span>
                          <span className="text-sm font-medium">{drone.distance.toFixed(1)} km</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Battery:</span>
                          <span className={`text-sm font-medium ${drone.batteryLevel < 20 ? 'text-red-600' : 'text-gray-900'}`}>
                            {drone.batteryLevel}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Temperature:</span>
                          <span className={`text-sm font-medium ${drone.temperature > 6 ? 'text-red-600' : 'text-gray-900'}`}>
                            {drone.temperature.toFixed(1)}°C
                          </span>
                        </div>
                      </div>

                      {drone.status === 'in-transit' && (
                        <div className="pt-4 border-t border-gray-200">
                          <div className="text-center">
                            <p className="text-sm text-gray-600 mb-2">Time Remaining</p>
                            <p className="text-2xl font-bold text-blue-600">
                              {drone.estimatedTime - drone.currentTime}m
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Delivery Network Stats */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🚁 Network Performance</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Success Rate:</span>
                  <span className="text-sm font-medium text-green-600">98.7%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg Speed:</span>
                  <span className="text-sm font-medium">45 km/h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Coverage Area:</span>
                  <span className="text-sm font-medium">Mumbai Metro</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Fleet Size:</span>
                  <span className="text-sm font-medium">12 Drones</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-center space-x-2 text-green-600">
                  <Zap className="h-4 w-4" />
                  <span className="text-sm font-medium">All systems operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
