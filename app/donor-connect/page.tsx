'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  MapPin, 
  Navigation, 
  Phone, 
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Droplets
} from 'lucide-react';

interface EmergencyRequest {
  id: string;
  bloodGroup: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  patientCode: string;
  location: string;
  hospitalName: string;
  hospitalLat: number;
  hospitalLng: number;
  unitsRequired: number;
  timeRequested: string;
}

export default function DonorConnectPage() {
  const [donorInfo, setDonorInfo] = useState({
    name: '',
    bloodGroup: 'O+',
    phone: '',
    donorCode: ''
  });
  
  const [isConnected, setIsConnected] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<EmergencyRequest | null>(null);
  const [donorStatus, setDonorStatus] = useState<'idle' | 'responding' | 'traveling' | 'arrived' | 'donating'>('idle');
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [hospitalLocation, setHospitalLocation] = useState<{lat: number, lng: number} | null>(null);

  // Clear old localStorage data on component mount (page reload)
  useEffect(() => {
    localStorage.removeItem('donorLocation');
    localStorage.removeItem('bloodlink_donor_active');
    console.log('Cleared old donor data from localStorage');
  }, []);

  // Cleanup when component unmounts or user leaves
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (donorInfo.donorCode) {
        try {
          await fetch(`/api/donor-location?donorCode=${donorInfo.donorCode}`, {
            method: 'DELETE'
          });
          console.log('Cleaned up donor on page leave');
        } catch (error) {
          console.log('Could not clean up donor:', error);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
      handleBeforeUnload();
    };
  }, [donorInfo.donorCode, watchId]);

  // Get hospital location for distance calculation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentLat = position.coords.latitude;
          const currentLng = position.coords.longitude;
          
          console.log('Setting hospital location to your current position for demo:', currentLat, currentLng);
          setHospitalLocation({
            lat: currentLat,
            lng: currentLng
          });
        },
        (error) => {
          console.error('Could not get location for hospital:', error);
          setHospitalLocation({ lat: 19.076000, lng: 72.877700 });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    }
  }, []);

  // Mock emergency request (in real app, this would come from your backend)
  const mockEmergencyRequest: EmergencyRequest = {
    id: 'ER-001243',
    bloodGroup: 'O+',
    urgency: 'critical',
    patientCode: 'PT-001243',
    location: 'Your Current Area',
    hospitalName: 'Local Emergency Center',
    hospitalLat: hospitalLocation?.lat || 19.076000,
    hospitalLng: hospitalLocation?.lng || 72.877700,
    unitsRequired: 2,
    timeRequested: new Date().toISOString()
  };

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // Helper function to calculate distance between two points in km
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const connectAsDonor = () => {
    if (!donorInfo.name || !donorInfo.phone) {
      alert('Please fill in your name and phone number');
      return;
    }
    
    // Generate unique donor code with timestamp to prevent duplicates
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 900) + 100;
    const donorCode = `D${random}${timestamp}`;
    
    setDonorInfo(prev => ({ ...prev, donorCode }));
    setIsConnected(true);
    setIsTrackingLocation(true);
    
    console.log('Connecting as donor with unique code:', donorCode);
    
    // Start location tracking immediately
    startLocationTracking(donorCode);
    
    // Simulate finding a matching emergency request
    setTimeout(() => {
      if (donorInfo.bloodGroup === mockEmergencyRequest.bloodGroup || 
          donorInfo.bloodGroup === 'O-' || 
          mockEmergencyRequest.bloodGroup === 'AB+') {
        setCurrentRequest(mockEmergencyRequest);
      }
    }, 2000);
  };

  const startLocationTracking = (donorCode: string) => {
    if (navigator.geolocation) {
      const options = {
        enableHighAccuracy: true,
        timeout: 30000, // Longer timeout for maximum accuracy
        maximumAge: 0 // Always get fresh location data
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(newLocation);
          
          // Send location to server API
          const donorLocationData = {
            ...newLocation,
            donorCode: donorCode,
            status: 'responding',
            timestamp: Date.now(),
            bloodGroup: donorInfo.bloodGroup,
            name: donorInfo.name,
            phone: donorInfo.phone
          };

          try {
            const response = await fetch('/api/donor-location', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(donorLocationData),
            });

            const result = await response.json();
            
            if (result.success) {
              console.log('Donor location shared via API:', donorLocationData);
              alert(`Location shared via server! Lat: ${newLocation.lat.toFixed(4)}, Lng: ${newLocation.lng.toFixed(4)}`);
            } else {
              console.error('Failed to share location:', result.error);
              alert('Failed to share location. Please try again.');
            }
          } catch (error) {
            console.error('Error sharing location:', error);
            alert('Network error. Please check your connection.');
          }

          // Also keep localStorage as backup for same-device testing
          localStorage.setItem('donorLocation', JSON.stringify(donorLocationData));
          localStorage.setItem('bloodlink_donor_active', 'true');
        },
        async (error) => {
          console.error('Error getting location:', error);
          // Fallback to mock location for demo
          const mockLocation = {
            lat: 19.0760 + (Math.random() - 0.5) * 0.02,
            lng: 72.8777 + (Math.random() - 0.5) * 0.02
          };
          setCurrentLocation(mockLocation);
          
          const donorLocationData = {
            ...mockLocation,
            donorCode: donorCode,
            status: 'responding',
            timestamp: Date.now(),
            bloodGroup: donorInfo.bloodGroup,
            name: donorInfo.name,
            phone: donorInfo.phone
          };

          try {
            const response = await fetch('/api/donor-location', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(donorLocationData),
            });

            const result = await response.json();
            
            if (result.success) {
              console.log('Fallback location shared via API:', donorLocationData);
              alert(`Using demo location via server! Lat: ${mockLocation.lat.toFixed(4)}, Lng: ${mockLocation.lng.toFixed(4)}`);
            }
          } catch (apiError) {
            console.error('Error sharing fallback location:', apiError);
          }

          // Also keep localStorage as backup
          localStorage.setItem('donorLocation', JSON.stringify(donorLocationData));
          localStorage.setItem('bloodlink_donor_active', 'true');
        },
        options
      );

      // Watch position changes with enhanced accuracy
      const watchOptions = {
        enableHighAccuracy: true,
        timeout: 30000, // Maximum timeout for best accuracy
        maximumAge: 0 // Always get the freshest possible location
      };

      const watchId = navigator.geolocation.watchPosition(
        async (position) => {
          // Only update if accuracy is reasonable (less than 20 meters for close proximity)
          if (position.coords.accuracy > 20) {
            console.log('Location accuracy too poor:', position.coords.accuracy, 'meters');
            return;
          }

          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };

          // Filter out locations that are too similar (reduce noise) - smaller threshold for sitting together
          if (currentLocation) {
            const distance = calculateDistance(
              currentLocation.lat, currentLocation.lng,
              newLocation.lat, newLocation.lng
            );
            
            // Only update if moved more than 1 meter (very sensitive for close proximity)
            if (distance < 0.001) {
              console.log('Movement too small, ignoring update:', distance, 'km');
              return;
            }
          }

          setCurrentLocation(newLocation);
          
          // Update location in real-time via API
          const donorLocationData = {
            lat: newLocation.lat,
            lng: newLocation.lng,
            donorCode: donorCode,
            status: donorStatus,
            timestamp: Date.now(),
            bloodGroup: donorInfo.bloodGroup,
            name: donorInfo.name,
            phone: donorInfo.phone
          };

          try {
            await fetch('/api/donor-location', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(donorLocationData),
            });
          } catch (error) {
            console.error('Error updating location:', error);
          }

          // Also update localStorage as backup
          localStorage.setItem('donorLocation', JSON.stringify(donorLocationData));
        },
        (error) => {
          console.error('Error watching location:', error);
        },
        watchOptions
      );

      setWatchId(watchId);
    }
  };

  const respondToEmergency = async () => {
    setDonorStatus('traveling');
    
    // Update status via API
    const currentLocationData = localStorage.getItem('donorLocation');
    if (currentLocationData) {
      try {
        const locationData = JSON.parse(currentLocationData);
        const updatedData = {
          ...locationData,
          status: 'traveling',
          timestamp: Date.now()
        };

        await fetch('/api/donor-location', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedData),
        });

        localStorage.setItem('donorLocation', JSON.stringify(updatedData));
      } catch (error) {
        console.error('Error updating status:', error);
      }
    }

    // Simulate travel status updates
    setTimeout(() => {
      setDonorStatus('traveling');
      if (currentLocation) {
        localStorage.setItem('donorLocation', JSON.stringify({
          ...currentLocation,
          donorCode: donorInfo.donorCode,
          status: 'traveling',
          timestamp: Date.now()
        }));
      }
    }, 3000);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'responding': return 'text-blue-600 bg-blue-50';
      case 'traveling': return 'text-green-600 bg-green-50';
      case 'arrived': return 'text-purple-600 bg-purple-50';
      case 'donating': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Heart className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            BloodLink Donor
          </h1>
          <p className="text-gray-600">
            Connect as a donor to help save lives
          </p>
        </div>

        {!isConnected ? (
          /* Donor Registration */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold mb-6 text-center">
              Register as Donor
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={donorInfo.name}
                    onChange={(e) => setDonorInfo(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blood Group
                </label>
                <div className="relative">
                  <Droplets className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <select
                    value={donorInfo.bloodGroup}
                    onChange={(e) => setDonorInfo(prev => ({ ...prev, bloodGroup: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    {bloodGroups.map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={donorInfo.phone}
                    onChange={(e) => setDonorInfo(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={connectAsDonor}
                className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
              >
                Connect as Donor
              </motion.button>
              
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-700 text-center">
                  💡 <strong>Demo Note:</strong> If you're having network connectivity issues, you can run this page on the same computer as the tracking demo for testing purposes.
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Connected Donor Interface */
          <div className="space-y-6">
            {/* Donor Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Donor Status</h2>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(donorStatus)}`}>
                  {donorStatus === 'idle' && 'Available'}
                  {donorStatus === 'responding' && 'Responding'}
                  {donorStatus === 'traveling' && 'En Route'}
                  {donorStatus === 'arrived' && 'At Hospital'}
                  {donorStatus === 'donating' && 'Donating'}
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div>Name: <span className="font-medium text-gray-900">{donorInfo.name}</span></div>
                <div>Donor Code: <span className="font-medium text-gray-900">{donorInfo.donorCode}</span></div>
                <div>Blood Group: <span className="font-medium text-red-600">{donorInfo.bloodGroup}</span></div>
                <div>Phone: <span className="font-medium text-gray-900">{donorInfo.phone}</span></div>
                <div className="flex items-center gap-2 pt-2">
                  {isTrackingLocation ? (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="font-medium text-green-600">Location sharing active</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span className="text-gray-500">Location sharing inactive</span>
                    </>
                  )}
                </div>
                {currentLocation && (
                  <div className="text-xs text-gray-500">
                    📍 Lat: {currentLocation.lat.toFixed(4)}, Lng: {currentLocation.lng.toFixed(4)}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Emergency Request */}
            {currentRequest && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-red-600">
                    🚨 Emergency Request
                  </h3>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(currentRequest.urgency)}`}>
                    {currentRequest.urgency.toUpperCase()}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-red-500" />
                    <span className="text-sm">
                      <strong>{currentRequest.bloodGroup}</strong> blood needed ({currentRequest.unitsRequired} units)
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{currentRequest.hospitalName}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">Patient: {currentRequest.patientCode}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      Requested: {new Date(currentRequest.timeRequested).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                {donorStatus === 'idle' && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={respondToEmergency}
                    className="w-full mt-4 bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Respond to Emergency
                  </motion.button>
                )}

                {donorStatus !== 'idle' && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Response confirmed!</span>
                    </div>
                    <p className="text-sm text-green-600 mt-1">
                      Your location is being shared with the hospital. Thank you for saving a life! 🙏
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Location Sharing */}
            {donorStatus !== 'idle' && currentLocation && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-blue-500" />
                  Live Location Sharing
                </h3>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div>Current Status: <span className="font-medium text-gray-900">{donorStatus}</span></div>
                  <div>Latitude: <span className="font-mono">{currentLocation.lat.toFixed(6)}</span></div>
                  <div>Longitude: <span className="font-mono">{currentLocation.lng.toFixed(6)}</span></div>
                </div>
                
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700">
                    🔒 Your identity is protected. Only your anonymous donor code and location are shared.
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
