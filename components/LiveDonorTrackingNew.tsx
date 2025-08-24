'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Clock, Shield, Eye, EyeOff, Users, AlertTriangle, X } from 'lucide-react';

interface AnonymousDonor {
  id: string;
  bloodGroup: string;
  lat: number;
  lng: number;
  status: 'starting' | 'traveling' | 'nearby' | 'arrived' | 'donating';
  eta: string;
  distance: number;
  progress: number;
  speed: number; // km/h
  donorCode: string; // Anonymous identifier like "D001", "D002"
}

interface LiveDonorTrackingProps {
  isVisible: boolean;
  onClose: () => void;
  anonymousDonors?: AnonymousDonor[];
  hospitalLocation: { lat: number; lng: number };
  hospitalName: string;
  emergencyRequest?: {
    bloodGroup: string;
    urgency: 'low' | 'medium' | 'high' | 'critical';
    patientCode: string;
    location: string;
  };
}

declare global {
  interface Window {
    google: any;
  }
}

export default function LiveDonorTracking({
  isVisible,
  onClose,
  anonymousDonors = [],
  hospitalLocation,
  hospitalName,
  emergencyRequest
}: LiveDonorTrackingProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const routesRef = useRef<any[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState<AnonymousDonor | null>(null);
  const [privacyMode, setPrivacyMode] = useState(true);
  const [trackingStats, setTrackingStats] = useState({
    totalResponding: 0,
    averageETA: 0,
    closestDistance: 0
  });

  // Generate mock anonymous donors if none provided
  const [mockDonors, setMockDonors] = useState<AnonymousDonor[]>([]);

  useEffect(() => {
    if (anonymousDonors.length === 0 && emergencyRequest) {
      // Generate mock donors around the hospital
      const donors: AnonymousDonor[] = [];
      const baseCoords = hospitalLocation;
      
      for (let i = 0; i < 5; i++) {
        const donorId = `D${String(i + 1).padStart(3, '0')}`;
        const angle = (i * 72) * (Math.PI / 180); // Spread around hospital
        const distance = 2 + Math.random() * 8; // 2-10 km from hospital
        
        const lat = baseCoords.lat + (distance * 0.009) * Math.cos(angle);
        const lng = baseCoords.lng + (distance * 0.009) * Math.sin(angle);
        
        const eta = Math.floor(10 + distance * 2 + Math.random() * 10);
        const progress = Math.random() * 80;
        
        donors.push({
          id: donorId,
          bloodGroup: ['A+', 'B+', 'O+', 'AB+', 'O-'][Math.floor(Math.random() * 5)],
          lat,
          lng,
          status: ['starting', 'traveling', 'nearby'][Math.floor(Math.random() * 3)] as any,
          eta: eta.toString(),
          distance,
          progress,
          speed: 25 + Math.random() * 20,
          donorCode: donorId
        });
      }
      
      setMockDonors(donors);
    }
  }, [anonymousDonors, emergencyRequest, hospitalLocation]);

  const activeDonors = anonymousDonors.length > 0 ? anonymousDonors : mockDonors;

  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google) {
        setIsMapLoaded(true);
        setTimeout(() => initMap(), 100);
        return;
      }

      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyC-_w2_XxQaJ96X0dq00rOKm9JXJYQpV08';
      
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setIsMapLoaded(true);
        setTimeout(() => initMap(), 100);
      };
      script.onerror = () => {
        console.error('Failed to load Google Maps API');
      };
      document.head.appendChild(script);
    };

    if (isVisible) {
      loadGoogleMaps();
    }
  }, [isVisible]);

  // Calculate tracking statistics
  useEffect(() => {
    if (activeDonors.length > 0) {
      const responding = activeDonors.filter(d => d.status !== 'arrived' && d.status !== 'donating').length;
      const avgETA = activeDonors.reduce((sum, d) => sum + parseInt(d.eta), 0) / activeDonors.length;
      const closest = Math.min(...activeDonors.map(d => d.distance));
      
      setTrackingStats({
        totalResponding: responding,
        averageETA: avgETA,
        closestDistance: closest
      });
    }
  }, [activeDonors]);

  const initMap = () => {
    if (!mapRef.current || !window.google) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: hospitalLocation,
      zoom: 13,
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      styles: [
        {
          featureType: 'poi.medical',
          elementType: 'labels',
          stylers: [{ visibility: 'on' }]
        }
      ],
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true
    });

    mapInstanceRef.current = map;
    
    // Add hospital marker
    const hospitalMarker = new window.google.maps.Marker({
      position: hospitalLocation,
      map: map,
      title: hospitalName,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
            <circle cx="25" cy="25" r="23" fill="#dc2626" stroke="#ffffff" stroke-width="3"/>
            <path d="M25 10l-10 10v20h20V20l-10-10z" fill="#ffffff"/>
            <rect x="20" y="20" width="10" height="3" fill="#dc2626"/>
            <rect x="23.5" y="17" width="3" height="10" fill="#dc2626"/>
            <circle cx="25" cy="35" r="2" fill="#dc2626"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(50, 50),
        anchor: new window.google.maps.Point(25, 25)
      },
      zIndex: 1000
    });

    // Hospital info window
    const hospitalInfo = new window.google.maps.InfoWindow({
      content: `
        <div style="padding: 15px; max-width: 300px; font-family: Arial, sans-serif;">
          <div style="display: flex; align-items: center; margin-bottom: 10px;">
            <h3 style="margin: 0; color: #dc2626; font-size: 16px;">🏥 ${hospitalName}</h3>
          </div>
          ${emergencyRequest ? `
            <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 10px; margin-bottom: 10px;">
              <div style="color: #dc2626; font-weight: bold; margin-bottom: 5px;">🚨 EMERGENCY REQUEST</div>
              <div style="font-size: 12px; color: #374151;">
                <div>Blood Type: <strong>${emergencyRequest.bloodGroup}</strong></div>
                <div>Urgency: <strong style="color: ${getUrgencyColor(emergencyRequest.urgency)}">${emergencyRequest.urgency.toUpperCase()}</strong></div>
                <div>Patient: <strong>${emergencyRequest.patientCode}</strong></div>
              </div>
            </div>
          ` : ''}
          <div style="font-size: 12px; color: #666;">
            <div style="margin-bottom: 5px;">📍 Donation Center</div>
            <div style="margin-bottom: 5px;">⏰ 24/7 Emergency Service</div>
            <div>👥 ${activeDonors.length} Donors En Route</div>
          </div>
        </div>
      `
    });

    hospitalMarker.addListener('click', () => {
      hospitalInfo.open(map, hospitalMarker);
    });
  };

  // Update donor markers
  useEffect(() => {
    if (!isMapLoaded || !mapInstanceRef.current) return;

    // Clear existing markers and routes
    markersRef.current.forEach(marker => marker.setMap(null));
    routesRef.current.forEach(route => route.setMap(null));
    markersRef.current = [];
    routesRef.current = [];

    activeDonors.forEach((donor) => {
      // Create anonymous donor marker
      const donorMarker = new window.google.maps.Marker({
        position: { lat: donor.lat, lng: donor.lng },
        map: mapInstanceRef.current,
        title: privacyMode ? `Anonymous Donor ${donor.donorCode}` : donor.donorCode,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" fill="${getDonorStatusColor(donor.status)}" stroke="#ffffff" stroke-width="3"/>
              <circle cx="20" cy="20" r="12" fill="rgba(255,255,255,0.9)"/>
              ${privacyMode ? `
                <circle cx="20" cy="15" r="4" fill="${getDonorStatusColor(donor.status)}"/>
                <path d="M12 25c0-4.4 3.6-8 8-8s8 3.6 8 8" fill="${getDonorStatusColor(donor.status)}"/>
              ` : `
                <text x="20" y="24" text-anchor="middle" font-size="10" font-weight="bold" fill="${getDonorStatusColor(donor.status)}">${donor.bloodGroup}</text>
              `}
              ${donor.status === 'traveling' ? `
                <circle cx="32" cy="8" r="6" fill="#10b981" stroke="#ffffff" stroke-width="2"/>
                <path d="M29 8l2 2 4-4" stroke="#ffffff" stroke-width="1.5" fill="none"/>
              ` : ''}
            </svg>
          `),
          scaledSize: new window.google.maps.Size(40, 40),
          anchor: new window.google.maps.Point(20, 20),
          zIndex: getMarkerZIndex(donor.status)
        },
        animation: donor.status === 'traveling' ? window.google.maps.Animation.BOUNCE : null
      });

      // Enhanced info window
      const donorInfo = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 12px; max-width: 280px; font-family: Arial, sans-serif;">
            <div style="display: flex; align-items: center; justify-content: between; margin-bottom: 10px;">
              <h3 style="margin: 0; color: #374151; font-size: 14px;">
                ${privacyMode ? '🔒' : '👤'} ${donor.donorCode}
              </h3>
              <span style="background: ${getBloodGroupColor(donor.bloodGroup)}; color: white; padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; margin-left: 10px;">
                ${donor.bloodGroup}
              </span>
            </div>
            
            <div style="background: #f9fafb; border-radius: 8px; padding: 10px; margin-bottom: 10px;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
                <div>
                  <div style="color: #6b7280; margin-bottom: 2px;">Distance</div>
                  <div style="font-weight: bold; color: #374151;">${donor.distance.toFixed(1)} km</div>
                </div>
                <div>
                  <div style="color: #6b7280; margin-bottom: 2px;">ETA</div>
                  <div style="font-weight: bold; color: #374151;">${donor.eta} min</div>
                </div>
                <div>
                  <div style="color: #6b7280; margin-bottom: 2px;">Speed</div>
                  <div style="font-weight: bold; color: #374151;">${donor.speed.toFixed(0)} km/h</div>
                </div>
                <div>
                  <div style="color: #6b7280; margin-bottom: 2px;">Progress</div>
                  <div style="font-weight: bold; color: #374151;">${donor.progress.toFixed(0)}%</div>
                </div>
              </div>
            </div>

            <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <div style="width: 8px; height: 8px; border-radius: 50%; background: ${getDonorStatusColor(donor.status)}; margin-right: 8px;"></div>
              <span style="font-size: 12px; color: #374151; font-weight: 500;">${getStatusText(donor.status)}</span>
            </div>

            <div style="width: 100%; background: #e5e7eb; border-radius: 10px; height: 6px; overflow: hidden;">
              <div style="width: ${donor.progress}%; background: ${getDonorStatusColor(donor.status)}; height: 100%; border-radius: 10px; transition: width 0.3s ease;"></div>
            </div>

            ${privacyMode ? `
              <div style="margin-top: 8px; padding: 6px; background: #fef3c7; border-radius: 6px; font-size: 11px; color: #92400e;">
                🛡️ Identity protected for donor privacy
              </div>
            ` : ''}
          </div>
        `
      });

      donorMarker.addListener('click', () => {
        setSelectedDonor(donor);
        donorInfo.open(mapInstanceRef.current, donorMarker);
      });

      markersRef.current.push(donorMarker);

      // Draw route line for traveling donors
      if (donor.status === 'traveling' || donor.status === 'starting') {
        const routeLine = new window.google.maps.Polyline({
          path: [
            { lat: donor.lat, lng: donor.lng },
            hospitalLocation
          ],
          geodesic: true,
          strokeColor: getDonorStatusColor(donor.status),
          strokeOpacity: 0.8,
          strokeWeight: 3,
          icons: [{
            icon: {
              path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
              scale: 3,
              strokeColor: getDonorStatusColor(donor.status),
              fillColor: getDonorStatusColor(donor.status),
              fillOpacity: 1
            },
            offset: `${donor.progress}%`,
            repeat: '20px'
          }],
          map: mapInstanceRef.current
        });

        routesRef.current.push(routeLine);
      }
    });

    // Auto-fit map to show all donors and hospital
    if (activeDonors.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(hospitalLocation);
      activeDonors.forEach(donor => {
        bounds.extend({ lat: donor.lat, lng: donor.lng });
      });
      mapInstanceRef.current.fitBounds(bounds);
      
      const listener = window.google.maps.event.addListener(mapInstanceRef.current, 'idle', () => {
        if (mapInstanceRef.current.getZoom() > 15) mapInstanceRef.current.setZoom(15);
        window.google.maps.event.removeListener(listener);
      });
    }
  }, [activeDonors, privacyMode, isMapLoaded]);

  const getDonorStatusColor = (status: string) => {
    switch (status) {
      case 'starting': return '#3b82f6';
      case 'traveling': return '#10b981';
      case 'nearby': return '#f59e0b';
      case 'arrived': return '#8b5cf6';
      case 'donating': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getBloodGroupColor = (bloodGroup: string) => {
    const colors: { [key: string]: string } = {
      'A+': '#ef4444', 'A-': '#dc2626',
      'B+': '#3b82f6', 'B-': '#2563eb',
      'O+': '#10b981', 'O-': '#059669',
      'AB+': '#8b5cf6', 'AB-': '#7c3aed'
    };
    return colors[bloodGroup] || '#6b7280';
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'starting': return 'Getting Ready';
      case 'traveling': return 'On the Way';
      case 'nearby': return 'Almost There';
      case 'arrived': return 'At Hospital';
      case 'donating': return 'Donating';
      default: return 'Unknown';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#d97706';
      case 'low': return '#65a30d';
      default: return '#6b7280';
    }
  };

  const getMarkerZIndex = (status: string) => {
    switch (status) {
      case 'donating': return 1000;
      case 'arrived': return 900;
      case 'nearby': return 800;
      case 'traveling': return 700;
      case 'starting': return 600;
      default: return 500;
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[80vh] relative overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white p-4 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold flex items-center">
                <MapPin className="h-6 w-6 mr-2" />
                Live Donor Tracking
              </h2>
              <p className="text-red-100 text-sm">Real-time anonymous donor movement tracking</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-red-700 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex h-full">
            {/* Sidebar */}
            <div className="w-80 border-r border-gray-200 p-4 overflow-y-auto">
              {/* Privacy Controls */}
              <div className="mb-4">
                <button
                  onClick={() => setPrivacyMode(!privacyMode)}
                  className={`w-full flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    privacyMode 
                      ? 'bg-green-100 text-green-700 border border-green-300' 
                      : 'bg-gray-100 text-gray-700 border border-gray-300'
                  }`}
                >
                  {privacyMode ? <Shield className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                  {privacyMode ? 'Privacy Mode ON' : 'Privacy Mode OFF'}
                </button>
              </div>

              {/* Stats */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <Users className="h-4 w-4 mr-2 text-blue-600" />
                  Tracking Statistics
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Donors Responding:</span>
                    <span className="font-semibold text-green-600">{trackingStats.totalResponding}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Average ETA:</span>
                    <span className="font-semibold text-blue-600">{trackingStats.averageETA.toFixed(0)} min</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Closest Donor:</span>
                    <span className="font-semibold text-orange-600">{trackingStats.closestDistance.toFixed(1)} km</span>
                  </div>
                </div>
              </div>

              {/* Emergency Request Info */}
              {emergencyRequest && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center mb-2">
                    <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                    <span className="text-sm font-semibold text-red-900">Emergency Request</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Blood Type:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium text-white`} style={{ backgroundColor: getBloodGroupColor(emergencyRequest.bloodGroup) }}>
                        {emergencyRequest.bloodGroup}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Urgency:</span>
                      <span className="font-medium" style={{ color: getUrgencyColor(emergencyRequest.urgency) }}>
                        {emergencyRequest.urgency.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Patient:</span>
                      <span className="font-medium">{emergencyRequest.patientCode}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Donor List */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Active Donors</h3>
                <div className="space-y-2">
                  {activeDonors.map((donor) => (
                    <div
                      key={donor.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedDonor?.id === donor.id ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedDonor(donor)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">
                          {privacyMode ? '🔒' : '👤'} {donor.donorCode}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium text-white`} style={{ backgroundColor: getBloodGroupColor(donor.bloodGroup) }}>
                          {donor.bloodGroup}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>{donor.distance.toFixed(1)} km</span>
                        <span>{donor.eta} min</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium`} style={{ backgroundColor: getDonorStatusColor(donor.status), color: 'white' }}>
                          {getStatusText(donor.status)}
                        </span>
                      </div>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div 
                            className="h-1 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${donor.progress}%`, 
                              backgroundColor: getDonorStatusColor(donor.status) 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="flex-1 relative">
              <div 
                ref={mapRef} 
                className="w-full h-full"
              />

              {/* Loading State */}
              {!isMapLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading live donor tracking...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
