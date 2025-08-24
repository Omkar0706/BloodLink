'use client';

import { useState, useEffect } from 'react';
import DemoTracking from '@/components/DemoTracking';

export default function LiveTrackingPage() {
  const [hospitalLocation, setHospitalLocation] = useState({ lat: 0, lng: 0 }); // Will be set dynamically
  const [locationName, setLocationName] = useState('Getting location...');
  const [isLocationSet, setIsLocationSet] = useState(false);

  // Get current location for hospital simulation
  useEffect(() => {
    if (navigator.geolocation) {
      // Try multiple times to get the best accuracy
      let attempts = 0;
      const maxAttempts = 3;
      let bestAccuracy = Infinity;
      let bestPosition: any = null;

      const tryGetLocation = () => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            attempts++;
            console.log(`Location attempt ${attempts}:`, position.coords.latitude, position.coords.longitude, 'Accuracy:', position.coords.accuracy, 'meters');
            
            // Keep the most accurate result
            if (position.coords.accuracy < bestAccuracy) {
              bestAccuracy = position.coords.accuracy;
              bestPosition = position;
            }

            // If we have a good accuracy or reached max attempts, use the best result
            if (position.coords.accuracy < 10 || attempts >= maxAttempts) {
              const currentLat = bestPosition.coords.latitude;
              const currentLng = bestPosition.coords.longitude;
              
              console.log('Using best location:', currentLat, currentLng, 'Accuracy:', bestAccuracy, 'meters');
              
              // Set hospital to current location for demo (in real app, this would come from backend)
              setHospitalLocation({
                lat: currentLat,
                lng: currentLng
              });
              
              // Show precise coordinates for debugging
              setLocationName(`Emergency Center (${currentLat.toFixed(6)}, ${currentLng.toFixed(6)}) ±${bestAccuracy.toFixed(0)}m`);
              setIsLocationSet(true);
            } else if (attempts < maxAttempts) {
              // Try again for better accuracy
              setTimeout(tryGetLocation, 1000);
            }
          },
          (error) => {
            console.error('Location attempt failed:', error);
            attempts++;
            
            if (attempts >= maxAttempts) {
              console.error('Could not get current location after multiple attempts');
              // Fallback to test coordinates near you
              setHospitalLocation({ lat: 19.076000, lng: 72.877700 });
              setLocationName('Demo Emergency Center (GPS Failed - Using Fallback)');
              setIsLocationSet(true);
            } else {
              setTimeout(tryGetLocation, 1000);
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0 // Get fresh location
          }
        );
      };

      tryGetLocation();
    } else {
      // Fallback if geolocation not available
      setHospitalLocation({ lat: 19.076000, lng: 72.877700 });
      setLocationName('Demo Emergency Center (Geolocation not available)');
      setIsLocationSet(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Description */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              🗺️ Live Donor Tracking Demo
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Real-time anonymous donor movement tracking for hackathon demo
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-3xl mx-auto">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">🎯 Demo Instructions:</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
                <div>
                  <h4 className="font-medium mb-1">Patient Side (This Page):</h4>
                  <ul className="space-y-1">
                    <li>• Emergency request is active</li>
                    <li>• Map shows hospital location</li>
                    <li>• Waiting for donor connections</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-1">System Status:</h4>
                  <ul className="space-y-1">
                    <li>• {isLocationSet ? '✅ Patient location detected' : '⏳ Getting patient location...'}</li>
                    <li>• Hospital: {locationName}</li>
                    <li>• Tracking: High precision GPS enabled</li>
                    <li>• Auto-cleanup: Old donors cleared on reload</li>
                    <li>• Distance: Meter-level accuracy</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Tracking */}
      {isLocationSet && (
        <DemoTracking
          isVisible={true}
          onClose={() => {}} // No close for demo
          hospitalLocation={hospitalLocation}
          hospitalName={locationName}
          emergencyRequest={{
            bloodGroup: 'O+',
            urgency: 'critical',
            patientCode: 'PT-001243',
            location: 'Your Current Area'
          }}
        />
      )}
      
      {!isLocationSet && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Getting your location for demo...</p>
          </div>
        </div>
      )}
    </div>
  );
}
