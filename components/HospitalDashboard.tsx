'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  Phone, 
  Heart,
  User,
  Car,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Users,
  Droplets,
  Award,
  Eye,
  Filter,
  Search
} from 'lucide-react';
import { mockUsers, mockDonations } from '@/lib/mockData';
import { useUsers, useDonations } from '@/lib/hooks';
import { getBloodGroupColor, calculateDistance, formatDate } from '@/utils/helpers';
import GoogleMapsIntegration from './GoogleMapsIntegration';

interface DonorJourney {
  id: string;
  donorId: string;
  donorName: string;
  bloodGroup: string;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  currentLat: number;
  currentLng: number;
  progress: number;
  status: 'starting' | 'traveling' | 'arrived' | 'donating' | 'completed';
  startTime: Date;
  estimatedArrival: Date;
  actualArrival?: Date;
  contactNumber: string;
  distance: number;
  matchScore: number;
}

interface BloodStock {
  bloodGroup: string;
  available: number;
  reserved: number;
  critical: number;
  lastUpdated: Date;
}

interface FrequentDonor {
  id: string;
  name: string;
  bloodGroup: string;
  totalDonations: number;
  lastDonation: Date;
  distance: number;
  rating: number;
}

export default function HospitalDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [donorJourneys, setDonorJourneys] = useState<DonorJourney[]>([]);
  const [bloodStock, setBloodStock] = useState<BloodStock[]>([]);
  const [frequentDonors, setFrequentDonors] = useState<FrequentDonor[]>([]);
  const [selectedJourney, setSelectedJourney] = useState<DonorJourney | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 19.0170, lng: 72.8477 }); // Lilavati Hospital, Mumbai
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBloodGroup, setFilterBloodGroup] = useState('all');
  const animationRef = useRef<number>();

  // Initialize data
  useEffect(() => {
    initializeBloodStock();
    initializeFrequentDonors();
    simulateIncomingDonors();
  }, []);

  const initializeBloodStock = () => {
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const stock: BloodStock[] = bloodGroups.map(group => ({
      bloodGroup: group,
      available: Math.floor(Math.random() * 50) + 10,
      reserved: Math.floor(Math.random() * 20) + 5,
      critical: Math.floor(Math.random() * 10) + 1,
      lastUpdated: new Date()
    }));
    setBloodStock(stock);
  };

  const initializeFrequentDonors = () => {
    const donors: FrequentDonor[] = mockUsers
      .filter(user => user.isActive)
      .map(user => {
        const userDonations = mockDonations.filter(d => d.userId === user.id);
        return {
          id: user.id,
          name: user.name,
          bloodGroup: user.bloodGroup,
          totalDonations: userDonations.length,
          lastDonation: new Date(userDonations[userDonations.length - 1]?.donationDate || Date.now()),
          distance: calculateDistance(user.latitude || 0, user.longitude || 0, mapCenter.lat, mapCenter.lng),
          rating: Math.floor(Math.random() * 5) + 1
        };
      })
      .sort((a, b) => b.totalDonations - a.totalDonations)
      .slice(0, 10);
    
    setFrequentDonors(donors);
  };

  const simulateIncomingDonors = () => {
         // Create multiple donors coming from different directions around Lilavati Hospital
     const donorStartingPoints = [
       { lat: 19.0170 + 0.05, lng: 72.8477 + 0.05, name: 'Bandra West' }, // North
       { lat: 19.0170 - 0.05, lng: 72.8477 - 0.05, name: 'Worli' }, // South
       { lat: 19.0170 + 0.03, lng: 72.8477 - 0.03, name: 'Andheri' },  // East
       { lat: 19.0170 - 0.03, lng: 72.8477 + 0.03, name: 'Juhu' },  // West
       { lat: 19.0170 + 0.08, lng: 72.8477 + 0.02, name: 'Santacruz' },    // Northeast
       { lat: 19.0170 - 0.08, lng: 72.8477 - 0.02, name: 'Colaba' },    // Southwest
       { lat: 19.0170 + 0.06, lng: 72.8477 - 0.06, name: 'Goregaon' },    // Southeast
       { lat: 19.0170 - 0.06, lng: 72.8477 + 0.06, name: 'Versova' }     // Northwest
     ];

    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    
    const journeys: DonorJourney[] = donorStartingPoints.map((point, index) => {
      const bloodGroup = bloodGroups[index % bloodGroups.length];
      const donorName = `Donor ${index + 1}`;
      const distance = calculateDistance(point.lat, point.lng, mapCenter.lat, mapCenter.lng);
      
      const startTime = new Date();
      const estimatedArrival = new Date(startTime.getTime() + (distance * 2 * 60 * 1000));
      
      // Vary the progress to show different stages of journey
      const progress = Math.floor(Math.random() * 60) + 10; // 10-70% progress
      
      return {
        id: `journey-${index}`,
        donorId: `donor-${index}`,
        donorName,
        bloodGroup,
        startLat: point.lat,
        startLng: point.lng,
        endLat: mapCenter.lat,
        endLng: mapCenter.lng,
        currentLat: point.lat + (mapCenter.lat - point.lat) * (progress / 100),
        currentLng: point.lng + (mapCenter.lng - point.lng) * (progress / 100),
        progress,
        status: progress > 90 ? 'arrived' : 'traveling',
        startTime,
        estimatedArrival,
        contactNumber: `+91 98765${String(index + 1).padStart(5, '0')}`,
        distance,
        matchScore: Math.floor(Math.random() * 30) + 70
      };
    });

    setDonorJourneys(journeys);
  };

  // Animate donor movement
  useEffect(() => {
    const animateDonors = () => {
      setDonorJourneys(prev => prev.map(journey => {
        if (journey.status === 'completed') return journey;

        let newProgress = journey.progress;
        let newStatus = journey.status;

        // Update progress
        if (journey.status === 'traveling') {
          newProgress = Math.min(95, journey.progress + 0.5);
          if (newProgress >= 95) {
            newStatus = 'arrived';
            newProgress = 100;
          }
        } else if (journey.status === 'arrived') {
          newStatus = 'donating';
        } else if (journey.status === 'donating') {
          const donationTime = 15 * 60 * 1000;
          const timeSinceArrival = Date.now() - journey.actualArrival!.getTime();
          if (timeSinceArrival >= donationTime) {
            newStatus = 'completed';
          }
        }

        // Calculate current position
        const progressRatio = newProgress / 100;
        const newLat = journey.startLat + (journey.endLat - journey.startLat) * progressRatio;
        const newLng = journey.startLng + (journey.endLng - journey.startLng) * progressRatio;

        let actualArrival = journey.actualArrival;
        if (newStatus === 'arrived' && journey.status !== 'arrived') {
          actualArrival = new Date();
        }

        return {
          ...journey,
          currentLat: newLat,
          currentLng: newLng,
          progress: newProgress,
          status: newStatus,
          actualArrival
        };
      }));

      animationRef.current = requestAnimationFrame(animateDonors);
    };

    if (donorJourneys.length > 0) {
      animationRef.current = requestAnimationFrame(animateDonors);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [donorJourneys]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'starting': return 'text-blue-600';
      case 'traveling': return 'text-yellow-600';
      case 'arrived': return 'text-green-600';
      case 'donating': return 'text-purple-600';
      case 'completed': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'starting': return <User className="h-4 w-4" />;
      case 'traveling': return <Car className="h-4 w-4" />;
      case 'arrived': return <MapPin className="h-4 w-4" />;
      case 'donating': return <Heart className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'starting': return 'Preparing to leave';
      case 'traveling': return 'On the way';
      case 'arrived': return 'Arrived at hospital';
      case 'donating': return 'Donating blood';
      case 'completed': return 'Donation completed';
      default: return 'Unknown';
    }
  };

  const filteredDonors = frequentDonors.filter(donor => {
    const matchesSearch = donor.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBloodGroup = filterBloodGroup === 'all' || donor.bloodGroup === filterBloodGroup;
    return matchesSearch && matchesBloodGroup;
  });

  const activeJourneys = donorJourneys.filter(j => j.status !== 'completed');
  const completedJourneys = donorJourneys.filter(j => j.status === 'completed');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-red-600" />
                             <span className="ml-2 text-xl font-bold text-gray-900">Lilavati Hospital - Blood Management Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Donors</p>
                <p className="text-2xl font-bold text-gray-900">{activeJourneys.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card"
          >
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Droplets className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Blood Stock</p>
                <p className="text-2xl font-bold text-gray-900">
                  {bloodStock.reduce((sum, stock) => sum + stock.available, 0)}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card"
          >
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Arrival Time</p>
                <p className="text-2xl font-bold text-gray-900">15 min</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card"
          >
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Top Donor</p>
                <p className="text-2xl font-bold text-gray-900">
                  {frequentDonors[0]?.totalDonations || 0}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: TrendingUp },
                { id: 'map', label: 'Live Map', icon: MapPin },
                { id: 'donors', label: 'Active Donors', icon: Users },
                { id: 'stock', label: 'Blood Stock', icon: Droplets },
                { id: 'leaderboard', label: 'Leaderboard', icon: Award }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Blood Stock Overview */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Blood Stock Status</h3>
              <div className="space-y-4">
                {bloodStock.map((stock) => (
                  <div key={stock.bloodGroup} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getBloodGroupColor(stock.bloodGroup)}`}>
                        {stock.bloodGroup}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{stock.available} units</p>
                      <p className="text-xs text-gray-500">
                        {stock.critical > 0 && <span className="text-red-600">Critical: {stock.critical}</span>}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Incoming Donors */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Incoming Donors</h3>
              <div className="space-y-3">
                {activeJourneys.slice(0, 5).map((journey) => (
                  <div key={journey.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{journey.donorName}</p>
                      <p className="text-sm text-gray-600">{journey.bloodGroup} • {journey.distance.toFixed(1)} km</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {journey.estimatedArrival.toLocaleTimeString()}
                      </p>
                      <p className="text-xs text-gray-500">{journey.progress.toFixed(0)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'map' && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Live Donor Tracking Map</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{activeJourneys.length} active donors</span>
              </div>
            </div>
            
            {/* Real Google Maps Integration */}
            <GoogleMapsIntegration
              donorJourneys={activeJourneys.map(journey => ({
                id: journey.id,
                name: journey.donorName,
                bloodGroup: journey.bloodGroup,
                lat: journey.currentLat,
                lng: journey.currentLng,
                status: journey.status,
                eta: journey.estimatedArrival.toLocaleTimeString(),
                distance: journey.distance,
                progress: journey.progress
              }))}
              hospitalLocation={mapCenter}
              onDonorSelect={(donor) => {
                const selected = activeJourneys.find(j => j.id === donor.id);
                setSelectedJourney(selected || null);
              }}
              selectedDonor={selectedJourney ? {
                id: selectedJourney.id,
                name: selectedJourney.donorName,
                bloodGroup: selectedJourney.bloodGroup,
                lat: selectedJourney.currentLat,
                lng: selectedJourney.currentLng,
                status: selectedJourney.status,
                eta: selectedJourney.estimatedArrival.toLocaleTimeString(),
                distance: selectedJourney.distance,
                progress: selectedJourney.progress
              } : null}
            />

            {/* Journey Details */}
            {selectedJourney && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{selectedJourney.donorName}</h4>
                    <p className="text-sm text-gray-600">{selectedJourney.contactNumber}</p>
                  </div>
                  <div className="text-right">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedJourney.status)}`}>
                      {getStatusText(selectedJourney.status)}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      ETA: {selectedJourney.estimatedArrival.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'donors' && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Active Donors</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{activeJourneys.length} donors en route</span>
              </div>
            </div>
            
            <div className="space-y-4">
              {activeJourneys.map((journey) => (
                <motion.div
                  key={journey.id}
                  className="border border-gray-200 rounded-lg p-4"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{journey.donorName}</h4>
                      <p className="text-sm text-gray-600">{journey.contactNumber}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBloodGroupColor(journey.bloodGroup)}`}>
                        {journey.bloodGroup}
                      </span>
                      <span className="text-xs text-gray-500">{journey.distance.toFixed(1)} km</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center text-sm text-gray-600">
                      {getStatusIcon(journey.status)}
                      <span className={`ml-2 ${getStatusColor(journey.status)}`}>
                        {getStatusText(journey.status)}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        ETA: {journey.estimatedArrival.toLocaleTimeString()}
                      </p>
                      <p className="text-xs text-gray-500">{journey.matchScore}% match</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="bg-green-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${journey.progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'stock' && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Blood Stock Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {bloodStock.map((stock) => (
                <div key={stock.bloodGroup} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getBloodGroupColor(stock.bloodGroup)}`}>
                      {stock.bloodGroup}
                    </span>
                    <span className="text-xs text-gray-500">
                      {stock.lastUpdated.toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Available:</span>
                      <span className="text-sm font-medium text-green-600">{stock.available}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Reserved:</span>
                      <span className="text-sm font-medium text-yellow-600">{stock.reserved}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Critical:</span>
                      <span className="text-sm font-medium text-red-600">{stock.critical}</span>
                    </div>
                  </div>

                  {stock.critical > 0 && (
                    <div className="mt-3 p-2 bg-red-50 rounded text-xs text-red-700">
                      ⚠️ Critical level - Need donors urgently
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Donor Leaderboard</h3>
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search donors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <select
                  value={filterBloodGroup}
                  onChange={(e) => setFilterBloodGroup(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="all">All Blood Groups</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="space-y-3">
              {filteredDonors.map((donor, index) => (
                <motion.div
                  key={donor.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-red-600">{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{donor.name}</h4>
                      <p className="text-sm text-gray-600">{donor.distance.toFixed(1)} km away</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBloodGroupColor(donor.bloodGroup)}`}>
                      {donor.bloodGroup}
                    </span>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{donor.totalDonations} donations</p>
                      <p className="text-xs text-gray-500">
                        Last: {formatDate(donor.lastDonation.toISOString())}
                      </p>
                    </div>
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Heart
                          key={i}
                          className={`h-4 w-4 ${i < donor.rating ? 'text-red-500 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
