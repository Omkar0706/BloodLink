'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Clock, Phone } from 'lucide-react';

interface DonorMarker {
  id: string;
  name: string;
  bloodGroup: string;
  lat: number;
  lng: number;
  status: 'starting' | 'traveling' | 'arrived' | 'donating' | 'completed';
  eta: string;
  distance: number;
  progress: number;
}

interface GoogleMapsIntegrationProps {
  donorJourneys: DonorMarker[];
  hospitalLocation: { lat: number; lng: number };
  onDonorSelect: (donor: DonorMarker) => void;
  selectedDonor?: DonorMarker | null;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export default function GoogleMapsIntegration({
  donorJourneys,
  hospitalLocation,
  onDonorSelect,
  selectedDonor
}: GoogleMapsIntegrationProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google) {
        setIsMapLoaded(true);
        // Initialize map immediately if Google Maps is already loaded
        setTimeout(() => initMap(), 100);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyC-_w2_XxQaJ96X0dq00rOKm9JXJYQpV08&libraries=geometry,places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setIsMapLoaded(true);
        // Initialize map after script loads
        setTimeout(() => initMap(), 100);
      };
      script.onerror = () => {
        console.error('Failed to load Google Maps API');
      };
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  // Initialize map when component is ready
  useEffect(() => {
    if (isMapLoaded && mapRef.current && !mapInstanceRef.current) {
      initMap();
    }
  }, [isMapLoaded, hospitalLocation]);

  const initMap = () => {
    if (!mapRef.current || !window.google) {
      console.log('Map ref or Google Maps not available');
      return;
    }

    console.log('Initializing Google Maps...');
    
    const map = new window.google.maps.Map(mapRef.current, {
      center: hospitalLocation,
      zoom: 12,
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      styles: [
        {
          featureType: 'poi.medical',
          elementType: 'labels',
          stylers: [{ visibility: 'on' }]
        }
      ]
    });

    mapInstanceRef.current = map;
    console.log('Google Maps initialized successfully');

    // Add hospital marker
    new window.google.maps.Marker({
      position: hospitalLocation,
      map: map,
      title: 'Hospital',
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" fill="#dc2626" stroke="#ffffff" stroke-width="2"/>
            <path d="M20 8l-8 8v16h16V16l-8-8z" fill="#ffffff"/>
            <path d="M16 20h8v4h-8z" fill="#dc2626"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(40, 40),
        anchor: new window.google.maps.Point(20, 20)
      }
    });

    // Add hospital info window
    const hospitalInfoWindow = new window.google.maps.InfoWindow({
      content: `
        <div style="padding: 10px; max-width: 200px;">
          <h3 style="margin: 0 0 5px 0; color: #dc2626;">🏥 Hospital</h3>
          <p style="margin: 0; font-size: 12px; color: #666;">
            Blood donation center<br>
            Emergency: 24/7
          </p>
        </div>
      `
    });

    // Add click listener to hospital marker
    map.addListener('click', () => {
      hospitalInfoWindow.close();
    });
  };

  // Update donor markers
  useEffect(() => {
    if (!isMapLoaded || !mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add new markers for each donor
    donorJourneys.forEach((donor, index) => {
      const marker = new window.google.maps.Marker({
        position: { lat: donor.lat, lng: donor.lng },
        map: mapInstanceRef.current,
        title: donor.name,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="14" fill="${getDonorStatusColor(donor.status)}" stroke="#ffffff" stroke-width="2"/>
              <path d="M16 8c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4z" fill="#ffffff"/>
              <path d="M8 20c0-4.4 3.6-8 8-8s8 3.6 8 8" fill="#ffffff"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32),
          anchor: new window.google.maps.Point(16, 16)
        }
      });

      // Create info window for donor
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 10px; max-width: 250px;">
            <h3 style="margin: 0 0 5px 0; color: #374151;">${donor.name}</h3>
            <div style="display: flex; align-items: center; margin-bottom: 5px;">
              <span style="background: ${getBloodGroupColor(donor.bloodGroup)}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">
                ${donor.bloodGroup}
              </span>
              <span style="margin-left: 8px; font-size: 12px; color: #666;">${donor.distance.toFixed(1)} km</span>
            </div>
            <div style="font-size: 12px; color: #666;">
              <div style="margin-bottom: 3px;">🕒 ETA: ${donor.eta}</div>
              <div style="margin-bottom: 3px;">📊 Progress: ${donor.progress.toFixed(0)}%</div>
              <div>📱 Status: ${getStatusText(donor.status)}</div>
            </div>
          </div>
        `
      });

      // Add click listener
      marker.addListener('click', () => {
        onDonorSelect(donor);
        infoWindow.open(mapInstanceRef.current, marker);
      });

      markersRef.current.push(marker);

      // Draw route line if donor is traveling or starting
      if (donor.status === 'traveling' || donor.status === 'starting') {
        const path = new window.google.maps.Polyline({
          path: [
            { lat: donor.lat, lng: donor.lng },
            hospitalLocation
          ],
          geodesic: true,
          strokeColor: getDonorStatusColor(donor.status),
          strokeOpacity: 0.8,
          strokeWeight: 3,
          map: mapInstanceRef.current
        });

        markersRef.current.push(path);
      }
    });
  }, [donorJourneys, isMapLoaded, onDonorSelect]);

  const getBloodGroupColor = (bloodGroup: string) => {
    const colors: { [key: string]: string } = {
      'A+': '#dc2626',
      'A-': '#dc2626',
      'B+': '#2563eb',
      'B-': '#2563eb',
      'AB+': '#059669',
      'AB-': '#059669',
      'O+': '#d97706',
      'O-': '#d97706'
    };
    return colors[bloodGroup] || '#6b7280';
  };

  const getDonorStatusColor = (status: string) => {
    switch (status) {
      case 'starting': return '#3b82f6'; // Blue
      case 'traveling': return '#10b981'; // Green
      case 'arrived': return '#f59e0b'; // Yellow
      case 'donating': return '#8b5cf6'; // Purple
      case 'completed': return '#9ca3af'; // Gray
      default: return '#10b981';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'starting': return '🚶 Preparing';
      case 'traveling': return '🚗 On the way';
      case 'arrived': return '📍 Arrived';
      case 'donating': return '❤️ Donating';
      case 'completed': return '✅ Completed';
      default: return 'Unknown';
    }
  };

  return (
    <div className="relative">
      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="w-full h-96 rounded-lg border-2 border-gray-300 bg-gray-100"
        style={{ minHeight: '400px', position: 'relative' }}
      />
      
      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 left-2 bg-white p-2 rounded text-xs z-10">
          <div>Map Loaded: {isMapLoaded ? 'Yes' : 'No'}</div>
          <div>Map Instance: {mapInstanceRef.current ? 'Yes' : 'No'}</div>
          <div>Donors: {donorJourneys.length}</div>
        </div>
      )}
      
      {/* Loading Overlay */}
      {!isMapLoaded && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading Google Maps...</p>
          </div>
        </div>
      )}

      {/* Map Controls */}
      <div className="absolute top-4 right-4 space-y-2">
        <button
          onClick={() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() + 1);
            }
          }}
          className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50"
        >
          <span className="text-lg">+</span>
        </button>
        <button
          onClick={() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() - 1);
            }
          }}
          className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50"
        >
          <span className="text-lg">−</span>
        </button>
        <button
          onClick={() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.setCenter(hospitalLocation);
              mapInstanceRef.current.setZoom(12);
            }
          }}
          className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50"
        >
          <Navigation className="h-4 w-4" />
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg">
        <div className="text-sm font-medium text-gray-900 mb-2">Legend</div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-600 rounded-full mr-2"></div>
            <span>Hospital</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span>Preparing</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span>Traveling</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
            <span>Arrived</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
            <span>Donating</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
            <span>Completed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
