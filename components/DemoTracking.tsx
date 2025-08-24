'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Clock, Shield, Eye, EyeOff, Users, AlertTriangle, Smartphone } from 'lucide-react';

interface RealDonor {
  id: string;
  donorCode: string;
  bloodGroup: string;
  lat: number;
  lng: number;
  status: 'responding' | 'traveling' | 'arrived' | 'donating';
  eta: string;
  distance: number | string;
  duration?: string;
  estimatedArrival?: string;
  lastUpdate: string;
  phone: string;
  name?: string; // Hidden in privacy mode
}

interface DemoTrackingProps {
  isVisible: boolean;
  onClose: () => void;
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

export default function DemoTracking({ isVisible, onClose, hospitalLocation, hospitalName, emergencyRequest }: DemoTrackingProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const routesRef = useRef<any[]>([]);
  
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [connectedDonors, setConnectedDonors] = useState<RealDonor[]>([]);
  const [privacyMode, setPrivacyMode] = useState(true);
  const [lastUpdateTime, setLastUpdateTime] = useState(0);
  const donorMarkersRef = useRef<Map<string, any>>(new Map());

  // Check if donors have actually moved significantly
  const checkForLocationChanges = (newDonors: RealDonor[]) => {
    if (connectedDonors.length !== newDonors.length) return true;
    
    for (let i = 0; i < newDonors.length; i++) {
      const newDonor = newDonors[i];
      const existingDonor = connectedDonors.find(d => d.donorCode === newDonor.donorCode);
      
      if (!existingDonor) return true;
      
      // Check if position changed significantly (more than ~1 meter for close proximity)
      const latDiff = Math.abs(newDonor.lat - existingDonor.lat);
      const lngDiff = Math.abs(newDonor.lng - existingDonor.lng);
      const significantChange = latDiff > 0.00001 || lngDiff > 0.00001; // ~1 meter
      
      if (significantChange || newDonor.status !== existingDonor.status) {
        return true;
      }
    }
    
    return false;
  };
  const [waitingForDonors, setWaitingForDonors] = useState(true);
  const [patientLocation, setPatientLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Get patient's live location
  useEffect(() => {
    if (navigator.geolocation) {
      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setPatientLocation(location);
          console.log('Patient location obtained:', location);
        },
        (error) => {
          console.error('Error getting patient location:', error);
          setLocationError('Unable to get your location. Using default location.');
          // Fallback to provided hospital location
          setPatientLocation(hospitalLocation);
        },
        options
      );

      // Watch for location changes
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setPatientLocation(location);
        },
        (error) => {
          console.error('Error watching patient location:', error);
        },
        options
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    } else {
      setLocationError('Geolocation not supported. Using default location.');
      setPatientLocation(hospitalLocation);
    }
  }, [hospitalLocation]);

  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google) {
        setIsMapLoaded(true);
        return;
      }

      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyC-_w2_XxQaJ96X0dq00rOKm9JXJYQpV08';
      
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setIsMapLoaded(true);
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

  // Initialize map when both API is loaded and patient location is available
  useEffect(() => {
    if (isMapLoaded && patientLocation) {
      setTimeout(() => initMap(), 100);
    }
  }, [isMapLoaded, patientLocation]);

  // Check for real donor connections via API and localStorage (less aggressive)
  useEffect(() => {
    // Clear all donors when component first loads (page reload)
    const clearOldDonors = async () => {
      try {
        await fetch('/api/donor-location', { method: 'DELETE' });
        console.log('Cleared old donor data on page reload');
      } catch (error) {
        console.log('Could not clear old donors:', error);
      }
    };

    if (isVisible && patientLocation) {
      clearOldDonors();
    }

    const checkForDonors = () => {
      const interval = setInterval(async () => {
        // First try API (for cross-domain)
        try {
          const response = await fetch('/api/donor-location');
          const result = await response.json();
          
          if (result.success && result.donors.length > 0) {
            console.log('Donors found via API:', result.donors.length);
            
            const updatedDonors: RealDonor[] = result.donors.map((donorData: any) => ({
              id: donorData.donorCode,
              donorCode: donorData.donorCode,
              bloodGroup: donorData.bloodGroup || 'O+',
              lat: donorData.lat,
              lng: donorData.lng,
              status: donorData.status || 'responding',
              eta: calculateETA(donorData.lat, donorData.lng),
              distance: calculateDistance(donorData.lat, donorData.lng),
              lastUpdate: new Date(donorData.timestamp).toISOString(),
              phone: donorData.phone || '+91 98765 43210',
              name: donorData.name || 'Anonymous Donor'
            }));
            
            // Only update if there are actual changes
            const hasChanges = checkForLocationChanges(updatedDonors);
            if (hasChanges) {
              setConnectedDonors(updatedDonors);
              setLastUpdateTime(Date.now());
              console.log('Donors updated via API:', updatedDonors);
            }
            setWaitingForDonors(false);
            return; // Skip localStorage check if API worked
          } else {
            // No donors found, clear the list
            if (connectedDonors.length > 0) {
              setConnectedDonors([]);
              console.log('No donors found, clearing list');
            }
          }
        } catch (error) {
          console.log('API check failed, trying localStorage:', error);
        }

        // Fallback to localStorage (for same-domain)
        const donorLocationData = localStorage.getItem('donorLocation');
        console.log('Checking localStorage...', donorLocationData ? 'Found data' : 'No data');
        
        if (donorLocationData) {
          try {
            const donorData = JSON.parse(donorLocationData);
            const currentTime = Date.now();
            console.log('Donor data parsed:', donorData, 'Age:', (currentTime - donorData.timestamp) / 1000, 'seconds');
            
            // Only use data that's less than 60 seconds old
            if (currentTime - donorData.timestamp < 60000) {
              const existingDonorIndex = connectedDonors.findIndex(d => d.donorCode === donorData.donorCode);
              
              const updatedDonor: RealDonor = {
                id: donorData.donorCode,
                donorCode: donorData.donorCode,
                bloodGroup: donorData.bloodGroup || 'O+',
                lat: donorData.lat,
                lng: donorData.lng,
                status: donorData.status || 'responding',
                eta: calculateETA(donorData.lat, donorData.lng),
                distance: calculateDistance(donorData.lat, donorData.lng),
                lastUpdate: new Date(donorData.timestamp).toISOString(),
                phone: donorData.phone || '+91 98765 43210',
                name: donorData.name || 'Anonymous Donor'
              };
              
              if (existingDonorIndex >= 0) {
                // Update existing donor
                const newDonors = [...connectedDonors];
                newDonors[existingDonorIndex] = updatedDonor;
                setConnectedDonors(newDonors);
              } else {
                // Add new donor
                setConnectedDonors(prev => [...prev, updatedDonor]);
              }
              
              setWaitingForDonors(false);
              console.log('Donor detected and added via localStorage:', updatedDonor);
            } else {
              console.log('Donor data too old, ignoring');
            }
          } catch (error) {
            console.error('Error parsing donor data:', error);
          }
        }
      }, 5000); // Check every 5 seconds instead of 2 (less aggressive)

      return () => clearInterval(interval);
    };

    if (isVisible && patientLocation) {
      return checkForDonors();
    }
  }, [isVisible, patientLocation, lastUpdateTime]); // Remove connectedDonors dependency to prevent loops

  // Helper functions
  const calculateDistance = (lat: number, lng: number) => {
    if (!patientLocation) return 0;
    
    const R = 6371; // Earth's radius in km
    const dLat = (patientLocation.lat - lat) * Math.PI / 180;
    const dLon = (patientLocation.lng - lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat * Math.PI / 180) * Math.cos(patientLocation.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c * 10) / 10; // Round to 1 decimal
  };

  const calculateETA = (lat: number, lng: number) => {
    const distance = calculateDistance(lat, lng);
    const averageSpeed = 25; // km/h in city traffic
    const timeInHours = distance / averageSpeed;
    const timeInMinutes = Math.round(timeInHours * 60);
    return timeInMinutes.toString();
  };

  const initMap = () => {
    if (!mapRef.current || !window.google || !patientLocation) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: patientLocation,
      zoom: 13,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        },
        {
          featureType: 'transit',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ],
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false
    });

    mapInstanceRef.current = map;
    createPatientMarker();
  };

  const createPatientMarker = () => {
    if (!mapInstanceRef.current || !window.google || !patientLocation) return;

    const patientMarker = new window.google.maps.Marker({
      position: patientLocation,
      map: mapInstanceRef.current,
      title: "Your Location (Patient)",
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
            <circle cx="25" cy="25" r="22" fill="#dc2626" stroke="#ffffff" stroke-width="3"/>
            <rect x="18" y="15" width="4" height="20" fill="white"/>
            <rect x="15" y="21" width="20" height="4" fill="white"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(40, 40),
        anchor: new window.google.maps.Point(20, 20)
      }
    });

    const patientInfo = new window.google.maps.InfoWindow({
      content: `
        <div style="padding: 10px; max-width: 250px;">
          <h3 style="margin: 0 0 10px 0; color: #dc2626; font-size: 16px;">Your Location (Patient)</h3>
          ${emergencyRequest ? `
            <div style="background: #fef2f2; padding: 8px; border-radius: 6px; margin: 8px 0; border-left: 3px solid #dc2626;">
              <div style="font-weight: bold; color: #dc2626; margin-bottom: 4px;">🚨 Blood Request Active</div>
              <div style="font-size: 12px; color: #333;">
                <div>Need Blood Type: <strong style="color: #dc2626;">${emergencyRequest.bloodGroup}</strong></div>
                <div>Urgency: <strong style="color: ${getUrgencyColor(emergencyRequest.urgency)}">${emergencyRequest.urgency.toUpperCase()}</strong></div>
                <div>Patient ID: <strong>${emergencyRequest.patientCode}</strong></div>
              </div>
            </div>
          ` : ''}
          <div style="font-size: 12px; color: #666;">
            <div style="margin-bottom: 5px;">📍 Current Location</div>
            <div style="margin-bottom: 5px;">🔍 Searching for Donors</div>
            <div>👥 ${connectedDonors.length} Donors Connected</div>
          </div>
        </div>
      `
    });

    patientMarker.addListener('click', () => {
      patientInfo.open(mapInstanceRef.current, patientMarker);
    });
  };

  // Update donor markers when donors connect (with smooth animation)
  useEffect(() => {
    if (!isMapLoaded || !mapInstanceRef.current) return;

    // Track which donors are currently being processed to prevent duplicates
    const processedDonors = new Set<string>();

    connectedDonors.forEach((donor) => {
      // Prevent duplicate processing
      if (processedDonors.has(donor.donorCode)) {
        console.log('Skipping duplicate donor:', donor.donorCode);
        return;
      }
      processedDonors.add(donor.donorCode);

      const existingMarker = donorMarkersRef.current.get(donor.donorCode);
      
      if (existingMarker) {
        // Update existing marker position smoothly (no bouncing)
        const newPosition = { lat: donor.lat, lng: donor.lng };
        const currentPos = existingMarker.getPosition();
        
        // Only animate if position actually changed significantly
        const latDiff = Math.abs(currentPos.lat() - newPosition.lat);
        const lngDiff = Math.abs(currentPos.lng() - newPosition.lng);
        
        if (latDiff > 0.00001 || lngDiff > 0.00001) {
          animateMarkerToPosition(existingMarker, newPosition);
        }
        
        // Update marker icon if status changed (no bouncing)
        updateMarkerIcon(existingMarker, donor);
      } else {
        // Create new marker for new donor
        createNewDonorMarker(donor);
      }
    });

    // Remove markers for donors that are no longer connected
    donorMarkersRef.current.forEach((marker, donorCode) => {
      if (!connectedDonors.find(d => d.donorCode === donorCode)) {
        console.log('Removing disconnected donor marker:', donorCode);
        marker.setMap(null);
        donorMarkersRef.current.delete(donorCode);
      }
    });

    // Fit map to show all markers only when needed
    if (connectedDonors.length > 0 && patientLocation) {
      setTimeout(() => fitMapToBounds(), 500); // Small delay to ensure markers are placed
    }
  }, [connectedDonors, privacyMode, isMapLoaded]);

  const animateMarkerToPosition = (marker: any, newPosition: { lat: number; lng: number }) => {
    const currentPos = marker.getPosition();
    const startLat = currentPos.lat();
    const startLng = currentPos.lng();
    const endLat = newPosition.lat;
    const endLng = newPosition.lng;
    
    // Stop any ongoing animation first
    marker.setAnimation(null);
    
    let step = 0;
    const steps = 20; // Fewer steps for smoother, less jerky animation
    const stepTime = 50; // Faster steps for smoother movement
    
    const animate = () => {
      step++;
      const progress = step / steps;
      
      // Smooth easing function (ease-out)
      const easeProgress = 1 - Math.pow(1 - progress, 2);
      
      const currentLat = startLat + (endLat - startLat) * easeProgress;
      const currentLng = startLng + (endLng - startLng) * easeProgress;
      
      marker.setPosition({ lat: currentLat, lng: currentLng });
      
      if (step < steps) {
        setTimeout(animate, stepTime);
      }
    };
    
    // Only animate if the distance is significant
    const distance = Math.sqrt(Math.pow(endLat - startLat, 2) + Math.pow(endLng - startLng, 2));
    if (distance > 0.00001) { // ~1 meter for close proximity detection
      console.log('Animating donor movement:', distance, 'degrees');
      animate();
    }
  };

  const updateMarkerIcon = (marker: any, donor: RealDonor) => {
    const iconUrl = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
      <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="18" fill="${getDonorStatusColor(donor.status)}" stroke="#ffffff" stroke-width="3"/>
        <circle cx="20" cy="20" r="12" fill="rgba(255,255,255,0.9)"/>
        ${privacyMode ? `
          <circle cx="20" cy="15" r="4" fill="${getDonorStatusColor(donor.status)}"/>
          <path d="M12 25c0-4.4 3.6-8 8-8s8 3.6 8 8" fill="${getDonorStatusColor(donor.status)}"/>
        ` : `
          <text x="20" y="24" text-anchor="middle" font-size="10" font-weight="bold" fill="${getDonorStatusColor(donor.status)}">${donor.bloodGroup}</text>
        `}
        <circle cx="32" cy="8" r="6" fill="#10b981" stroke="#ffffff" stroke-width="2"/>
        <path d="M29 8l2 2 4-4" stroke="#ffffff" stroke-width="1.5" fill="none"/>
      </svg>
    `);
    
    marker.setIcon({
      url: iconUrl,
      scaledSize: new window.google.maps.Size(40, 40),
      anchor: new window.google.maps.Point(20, 20)
    });
  };

  const createNewDonorMarker = (donor: RealDonor) => {
    const donorMarker = new window.google.maps.Marker({
      position: { lat: donor.lat, lng: donor.lng },
      map: mapInstanceRef.current,
      title: privacyMode ? `Anonymous Donor ${donor.donorCode}` : donor.name,
      animation: window.google.maps.Animation.DROP, // Nice drop animation for new markers
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
            <circle cx="32" cy="8" r="6" fill="#10b981" stroke="#ffffff" stroke-width="2"/>
            <path d="M29 8l2 2 4-4" stroke="#ffffff" stroke-width="1.5" fill="none"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(40, 40),
        anchor: new window.google.maps.Point(20, 20)
      }
    });

    // Add donor info window
    const donorInfo = new window.google.maps.InfoWindow({
      content: `
        <div style="padding: 8px; max-width: 200px;">
          <h4 style="margin: 0 0 8px 0; color: ${getDonorStatusColor(donor.status)};">
            ${privacyMode ? `Donor ${donor.donorCode}` : donor.name}
          </h4>
          <div style="font-size: 12px; color: #333;">
            <div>Blood Group: <strong style="color: #dc2626;">${donor.bloodGroup}</strong></div>
            <div>Status: <strong>${getStatusText(donor.status)}</strong></div>
            <div>ETA: <strong>${donor.eta} minutes</strong></div>
            <div>Distance: <strong>${donor.distance} km</strong></div>
            ${!privacyMode ? `<div>Phone: <strong>${donor.phone}</strong></div>` : ''}
          </div>
          <div style="font-size: 10px; color: #666; margin-top: 8px;">
            Last update: ${new Date(donor.lastUpdate).toLocaleTimeString()}
          </div>
        </div>
      `
    });

    donorMarker.addListener('click', () => {
      donorInfo.open(mapInstanceRef.current, donorMarker);
    });

    donorMarkersRef.current.set(donor.donorCode, donorMarker);

    // Draw route to hospital (only for new markers)
    drawRouteToHospital(donor);
  };

  const fitMapToBounds = () => {
    if (!patientLocation) return;
    
    const bounds = new window.google.maps.LatLngBounds();
    bounds.extend(patientLocation);
    connectedDonors.forEach(donor => {
      bounds.extend({ lat: donor.lat, lng: donor.lng });
    });
    
    // Add padding to prevent markers from being too close to edges
    mapInstanceRef.current.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
  };

  const drawRouteToHospital = (donor: RealDonor) => {
    const directionsService = new window.google.maps.DirectionsService();
    const directionsRenderer = new window.google.maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: getDonorStatusColor(donor.status),
        strokeWeight: 3,
        strokeOpacity: 0.7
      }
    });

    directionsService.route({
      origin: { lat: donor.lat, lng: donor.lng },
      destination: patientLocation,
      travelMode: window.google.maps.TravelMode.DRIVING
    }, (result: any, status: any) => {
      if (status === 'OK') {
        directionsRenderer.setDirections(result);
        directionsRenderer.setMap(mapInstanceRef.current);
        routesRef.current.push(directionsRenderer);
        
        // Calculate and store distance/time
        const route = result.routes[0];
        const leg = route.legs[0];
        donor.distance = leg.distance.text;
        donor.duration = leg.duration.text;
        donor.estimatedArrival = new Date(Date.now() + leg.duration.value * 1000).toLocaleTimeString();
      }
    });
  };

  const getDonorStatusColor = (status: string) => {
    switch (status) {
      case 'responding': return '#3b82f6';
      case 'traveling': return '#10b981';
      case 'arrived': return '#8b5cf6';
      case 'donating': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'responding': return 'Responding';
      case 'traveling': return 'En Route';
      case 'arrived': return 'At Hospital';
      case 'donating': return 'Donating';
      default: return 'Unknown';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#ca8a04';
      case 'low': return '#16a34a';
      default: return '#6b7280';
    }
  };

  return (
    <div className={`fixed inset-0 z-50 ${isVisible ? 'block' : 'hidden'}`}>
      <div className="absolute inset-0 bg-gray-900 bg-opacity-50">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="bg-white shadow-sm border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  🗺️ Live Donor Tracking
                </h2>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Real-time anonymous donor movement tracking</span>
                  {locationError && (
                    <span className="text-orange-600 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      {locationError}
                    </span>
                  )}
                  {patientLocation && !locationError && (
                    <span className="text-green-600 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      Live location active
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Privacy Toggle */}
                <button
                  onClick={() => setPrivacyMode(!privacyMode)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    privacyMode 
                      ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                >
                  {privacyMode ? <Shield className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {privacyMode ? 'Privacy Mode' : 'Full Details'}
                </button>

                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex">
            {/* Map */}
            <div className="flex-1 relative">
              <div ref={mapRef} className="w-full h-full" />
              
              {!isMapLoaded && (
                <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading Google Maps...</p>
                    <p className="text-xs text-gray-500 mt-2">This may take a few seconds</p>
                  </div>
                </div>
              )}
              
              {isMapLoaded && !patientLocation && (
                <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-pulse" />
                    <p className="text-gray-600 font-medium">Getting your location...</p>
                    <p className="text-xs text-gray-500 mt-2">Please allow location access when prompted</p>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
              {/* Emergency Request Info */}
              {emergencyRequest && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="font-semibold text-red-800 mb-2">🚨 Emergency Request</h3>
                  <div className="space-y-1 text-sm text-red-700">
                    <div>Blood Type: <span className="font-medium">{emergencyRequest.bloodGroup}</span></div>
                    <div>Urgency: <span className="font-medium">{emergencyRequest.urgency.toUpperCase()}</span></div>
                    <div>Patient: <span className="font-medium">{emergencyRequest.patientCode}</span></div>
                    <div>Location: <span className="font-medium">{hospitalName}</span></div>
                  </div>
                </div>
              )}

              {/* Waiting for Donors */}
              {waitingForDonors && connectedDonors.length === 0 && (
                <div className="text-center py-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <Smartphone className="w-8 h-8 text-blue-500" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Waiting for Donors
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Emergency request sent. Waiting for donors to connect...
                  </p>
                  
                  {/* Debug Info */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                    <p className="text-xs text-gray-600 mb-2">Debug Info:</p>
                    <div className="text-xs text-left text-gray-500 space-y-1">
                      <div>Maps Loaded: {isMapLoaded ? '✅' : '❌'}</div>
                      <div>Patient Location: {patientLocation ? '✅' : '❌'}</div>
                      <div>LocalStorage Data: {localStorage.getItem('donorLocation') ? '✅ Found' : '❌ None'}</div>
                      <div>Connected Donors: {connectedDonors.length}</div>
                      <button 
                        onClick={async () => {
                          try {
                            const response = await fetch('/api/donor-location');
                            const result = await response.json();
                            alert(`API Status: ${result.success ? 'Working' : 'Failed'}\nDonors: ${result.donors?.length || 0}`);
                          } catch (error) {
                            alert(`API Error: ${error}`);
                          }
                        }}
                        className="mt-1 px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                      >
                        Test API
                      </button>
                      {localStorage.getItem('donorLocation') && (
                        <div className="mt-2 p-2 bg-white border rounded text-xs">
                          <div className="font-mono text-green-600">
                            {JSON.stringify(JSON.parse(localStorage.getItem('donorLocation') || '{}'), null, 2)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-700">
                      💡 Demo: Have your teammate visit <strong>/donor-connect</strong> to join as a donor
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      🔗 Public URL: <strong>https://13a156ee1bca.ngrok-free.app/donor-connect</strong>
                    </p>
                    <button 
                      onClick={async () => {
                        // Add a test donor via API
                        const testDonor = {
                          lat: patientLocation ? patientLocation.lat + 0.01 : 19.0860,
                          lng: patientLocation ? patientLocation.lng + 0.01 : 72.8877,
                          donorCode: 'D999',
                          status: 'responding',
                          timestamp: Date.now(),
                          bloodGroup: 'O+',
                          name: 'Test Donor',
                          phone: '+91 98765 43210'
                        };

                        try {
                          const response = await fetch('/api/donor-location', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(testDonor),
                          });

                          const result = await response.json();
                          if (result.success) {
                            alert('Test donor added via API!');
                          } else {
                            alert('Failed to add test donor');
                          }
                        } catch (error) {
                          alert('API Error: ' + error);
                        }

                        // Also add to localStorage as backup
                        localStorage.setItem('donorLocation', JSON.stringify(testDonor));
                      }}
                      className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 mr-2"
                    >
                      Add Test Donor (API)
                    </button>
                    <button 
                      onClick={() => {
                        // Force refresh donor detection
                        const donorData = localStorage.getItem('donorLocation');
                        if (donorData) {
                          console.log('Forcing donor refresh:', donorData);
                          window.location.reload();
                        }
                      }}
                      className="mt-2 px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                    >
                      Force Refresh
                    </button>
                  </div>
                </div>
              )}

              {/* Connected Donors */}
              {connectedDonors.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Connected Donors ({connectedDonors.length})
                  </h3>
                  
                  <div className="space-y-3">
                    {connectedDonors.map((donor) => (
                      <motion.div
                        key={donor.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">
                            {privacyMode ? `Donor ${donor.donorCode}` : donor.name}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full text-white`} style={{backgroundColor: getDonorStatusColor(donor.status)}}>
                            {getStatusText(donor.status)}
                          </span>
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                          <div>Blood: <span className="font-medium text-red-600">{donor.bloodGroup}</span></div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            <span>ETA: <span className="font-medium">{donor.duration || `${donor.eta} min`}</span></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3 h-3" />
                            <span>Distance: <span className="font-medium">{typeof donor.distance === 'string' ? donor.distance : `${donor.distance} km`}</span></span>
                          </div>
                          {donor.estimatedArrival && (
                            <div className="flex items-center gap-2">
                              <Navigation className="w-3 h-3" />
                              <span>Arrival: <span className="font-medium">{donor.estimatedArrival}</span></span>
                            </div>
                          )}
                          {!privacyMode && (
                            <div>Phone: <span className="font-medium">{donor.phone}</span></div>
                          )}
                        </div>
                        
                        <div className="mt-2 text-xs text-gray-500">
                          Last update: {new Date(donor.lastUpdate).toLocaleTimeString()}
                        </div>
                        
                        {/* Live Movement Indicator */}
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs text-green-600 font-medium">Live Tracking Active</span>
                          </div>
                          <div className="text-xs text-gray-400">•</div>
                          <span className="text-xs text-blue-600">Moving to hospital</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="mt-6 p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Demo Instructions</h4>
                <ol className="text-xs text-gray-600 space-y-1">
                  <li>1. Patient registers emergency (this page)</li>
                  <li>2. Donor visits <code>/donor-connect</code> page</li>
                  <li>3. Donor responds to emergency request</li>
                  <li>4. Live tracking shows real movement</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
