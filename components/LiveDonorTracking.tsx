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
  CheckCircle
} from 'lucide-react';
import { mockUsers } from '@/lib/mockData';
import { getBloodGroupColor, calculateDistance } from '@/utils/helpers';
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
  progress: number; // 0-100
  status: 'starting' | 'traveling' | 'arrived' | 'donating' | 'completed';
  startTime: Date;
  estimatedArrival: Date;
  actualArrival?: Date;
  contactNumber: string;
  distance: number;
}

interface LiveDonorTrackingProps {
  isVisible: boolean;
  onClose: () => void;
  emergencyRequest?: {
    bloodGroup: string;
    location: string;
    hospitalLat: number;
    hospitalLng: number;
  };
}

export default function LiveDonorTracking({ isVisible, onClose, emergencyRequest }: LiveDonorTrackingProps) {
  const [donorJourneys, setDonorJourneys] = useState<DonorJourney[]>([]);
  const [selectedJourney, setSelectedJourney] = useState<DonorJourney | null>(null);
  const animationRef = useRef<number>();

  // Initialize donor journeys when emergency request is made
  useEffect(() => {
    if (emergencyRequest && isVisible) {
      const matchingDonors = mockUsers.filter(user => 
        user.bloodGroup === emergencyRequest.bloodGroup && user.isActive
      ).slice(0, 3); // Show top 3 donors

      const journeys: DonorJourney[] = matchingDonors.map((donor, index) => {
        const distance = calculateDistance(
          donor.latitude || 0,
          donor.longitude || 0,
          emergencyRequest.hospitalLat,
          emergencyRequest.hospitalLng
        );

        const startTime = new Date();
        const estimatedArrival = new Date(startTime.getTime() + (distance * 2 * 60 * 1000)); // 2 min per km

        return {
          id: `journey-${donor.id}`,
          donorId: donor.id,
          donorName: donor.name,
          bloodGroup: donor.bloodGroup,
          startLat: donor.latitude || 0,
          startLng: donor.longitude || 0,
          endLat: emergencyRequest.hospitalLat,
          endLng: emergencyRequest.hospitalLng,
          currentLat: donor.latitude || 0,
          currentLng: donor.longitude || 0,
          progress: 0,
          status: 'starting',
          startTime,
          estimatedArrival,
          contactNumber: donor.mobile,
          distance
        };
      });

      setDonorJourneys(journeys);
    }
  }, [emergencyRequest, isVisible]);

  // Animate donor movement
  useEffect(() => {
    const animateDonors = () => {
      setDonorJourneys(prev => prev.map(journey => {
        if (journey.status === 'completed') return journey;

        let newProgress = journey.progress;
        let newStatus: 'starting' | 'traveling' | 'arrived' | 'donating' | 'completed' = journey.status;

        // Update progress based on status
        if (journey.status === 'starting') {
          newProgress = Math.min(100, journey.progress + 2);
          if (newProgress >= 5) {
            newStatus = 'traveling';
          }
        } else if (journey.status === 'traveling') {
          newProgress = Math.min(95, journey.progress + 1);
          if (newProgress >= 95) {
            newStatus = 'arrived';
            newProgress = 100;
          }
        } else if (journey.status === 'arrived') {
          newStatus = 'donating';
        } else if (journey.status === 'donating') {
          // Simulate donation time
          const donationTime = 15 * 60 * 1000; // 15 minutes
          if (journey.actualArrival) {
            const timeSinceArrival = Date.now() - journey.actualArrival.getTime();
            if (timeSinceArrival >= donationTime) {
              newStatus = 'completed';
            }
          }
        }

        // Calculate current position
        const progressRatio = newProgress / 100;
        const newLat = journey.startLat + (journey.endLat - journey.startLat) * progressRatio;
        const newLng = journey.startLng + (journey.endLng - journey.startLng) * progressRatio;

        // Set arrival time when donor arrives
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

    if (isVisible && donorJourneys.length > 0) {
      animationRef.current = requestAnimationFrame(animateDonors);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isVisible, donorJourneys]);

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

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.8, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 20 }}
          className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[600px] flex flex-col"
        >
          {/* Header */}
          <div className="bg-red-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center">
              <Navigation className="h-6 w-6 mr-2" />
              <span className="font-semibold text-lg">Live Donor Tracking</span>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200"
            >
              <span className="text-2xl">&times;</span>
            </button>
          </div>

                     <div className="flex-1 flex">
             {/* Map Area */}
             <div className="flex-1 p-4 relative">
               {emergencyRequest && (
                 <GoogleMapsIntegration
                   donorJourneys={donorJourneys.map(journey => ({
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
                   hospitalLocation={{ lat: emergencyRequest.hospitalLat, lng: emergencyRequest.hospitalLng }}
                   onDonorSelect={(donor) => {
                     const selected = donorJourneys.find(j => j.id === donor.id);
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
               )}
             </div>

            {/* Journey Details */}
            <div className="w-80 border-l border-gray-200 p-4 overflow-y-auto">
              <h3 className="font-semibold text-lg mb-4">Donor Journeys</h3>
              
              {donorJourneys.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <Navigation className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No active donor journeys</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {donorJourneys.map((journey) => (
                    <motion.div
                      key={journey.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedJourney?.id === journey.id
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedJourney(journey)}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{journey.donorName}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBloodGroupColor(journey.bloodGroup as any)}`}>
                          {journey.bloodGroup}
                        </span>
                      </div>

                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        {getStatusIcon(journey.status)}
                        <span className={`ml-2 ${getStatusColor(journey.status)}`}>
                          {getStatusText(journey.status)}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs text-gray-500">
                        <div className="flex justify-between">
                          <span>Distance:</span>
                          <span>{journey.distance.toFixed(1)} km</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Progress:</span>
                          <span>{journey.progress.toFixed(0)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>ETA:</span>
                          <span>{journey.estimatedArrival.toLocaleTimeString()}</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div
                            className="bg-green-500 h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${journey.progress}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Selected Journey Details */}
          {selectedJourney && (
            <div className="border-t border-gray-200 p-4 bg-gray-50">
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
                    {selectedJourney.distance.toFixed(1)} km away
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
