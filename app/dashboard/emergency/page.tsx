'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Heart, 
  AlertTriangle, 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  ArrowLeft,
  Search,
  User,
  Navigation,
  Eye
} from 'lucide-react';
import { useUsers, useCreateEmergencyRequest, useEmergencyRequests, useDonations } from '@/lib/hooks';
import { getBloodGroupColor, getUrgencyColor, formatDate, findMatchingDonors } from '@/utils/helpers';
import { EmergencyRequest, DonorMatch, CreateEmergencyRequestForm } from '@/types';
import LiveDonorTracking from '@/components/LiveDonorTrackingNew';

export default function EmergencyPage() {
  const [formData, setFormData] = useState({
    requesterName: '',
    requesterContact: '',
    bloodGroup: 'A+',
    unitsRequired: 1,
    urgencyLevel: 'Medium',
    location: '',
    hospitalName: '',
    description: ''
  });

  const [matchedDonors, setMatchedDonors] = useState<DonorMatch[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showLiveTracking, setShowLiveTracking] = useState(false);
  const [currentEmergencyRequest, setCurrentEmergencyRequest] = useState<{
    bloodGroup: string;
    urgency: 'low' | 'medium' | 'high' | 'critical';
    patientCode: string;
    location: string;
    hospitalLat: number;
    hospitalLng: number;
  } | null>(null);

  // Fetch real data
  const { data: usersData, loading: usersLoading } = useUsers({ limit: 100 });
  const { data: donationsData, loading: donationsLoading } = useDonations({ limit: 500 });
  const { data: emergencyRequests, loading: emergencyLoading } = useEmergencyRequests({ limit: 10 });
  const { mutate: createEmergencyRequest, loading: isSubmitting } = useCreateEmergencyRequest(
    (newRequest) => {
      console.log('Emergency request created:', newRequest);
      // Reset form after success
      setFormData({
        requesterName: '',
        requesterContact: '',
        bloodGroup: 'A+',
        unitsRequired: 1,
        urgencyLevel: 'Medium',
        location: '',
        hospitalName: '',
        description: ''
      });
    },
    (error) => {
      console.error('Error creating emergency request:', error);
    }
  );

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const urgencyLevels = ['Low', 'Medium', 'High', 'Critical'];
  
  // Common hospitals in Mumbai and other cities
  const hospitals = [
    { name: 'Lilavati Hospital', location: 'Lilavati Hospital, Bandra West, Mumbai', city: 'Mumbai' },
    { name: 'KEM Hospital', location: 'KEM Hospital, Parel, Mumbai', city: 'Mumbai' },
    { name: 'Hinduja Hospital', location: 'Hinduja Hospital, Mahim, Mumbai', city: 'Mumbai' },
    { name: 'Bombay Hospital', location: 'Bombay Hospital, Marine Lines, Mumbai', city: 'Mumbai' },
    { name: 'Jaslok Hospital', location: 'Jaslok Hospital, Pedder Road, Mumbai', city: 'Mumbai' },
    { name: 'Tata Memorial Hospital', location: 'Tata Memorial Hospital, Parel, Mumbai', city: 'Mumbai' },
    { name: 'AIIMS Delhi', location: 'AIIMS, Ansari Nagar, New Delhi', city: 'Delhi' },
    { name: 'Apollo Hospitals', location: 'Apollo Hospitals, Sarita Vihar, Delhi', city: 'Delhi' },
    { name: 'Fortis Hospital', location: 'Fortis Hospital, Vasant Kunj, Delhi', city: 'Delhi' },
    { name: 'Manipal Hospital', location: 'Manipal Hospital, HAL Airport Road, Bangalore', city: 'Bangalore' },
    { name: 'Custom Location', location: '', city: 'Other' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Special handling for hospital selection
    if (name === 'hospitalSelect') {
      const selectedHospital = hospitals.find(h => h.name === value);
      if (selectedHospital) {
        if (selectedHospital.name === 'Custom Location') {
          setFormData(prev => ({
            ...prev,
            hospitalName: '',
            location: ''
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            hospitalName: selectedHospital.name,
            location: selectedHospital.location
          }));
        }
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    
    try {
      // First, we need to get a valid user ID for the requester
      // For now, we'll use the first user in the database or create a temporary one
      let requesterId = 'U100'; // Default to first user
      
      if (usersData?.data && usersData.data.length > 0) {
        requesterId = usersData.data[0].userId;
      }

      // Create emergency request data
      const emergencyRequestData: Partial<EmergencyRequest> = {
        requesterId: requesterId,
        patientName: formData.requesterName,
        bloodGroup: formData.bloodGroup,
        unitsRequired: formData.unitsRequired,
        urgencyLevel: formData.urgencyLevel,
        location: formData.location,
        contactNumber: formData.requesterContact,
        hospitalName: formData.hospitalName,
        description: formData.description,
        requiredBy: new Date(Date.now() + 24 * 60 * 60 * 1000)
      };

      // Create the emergency request in the database
      await createEmergencyRequest(emergencyRequestData);

      // Find matching donors using real data
      const users = (usersData?.data as any)?.data || [];
      const donations = (donationsData?.data as any)?.data || [];
      
      if (users.length > 0 && donations.length > 0) {
        console.log('Finding matching donors...');
        console.log('Users count:', users.length);
        console.log('Donations count:', donations.length);
        console.log('Emergency request data:', emergencyRequestData);
        
        const matches = findMatchingDonors(users, donations, emergencyRequestData as EmergencyRequest);
        
        console.log('Found matches:', matches.length, 'donors');
        if (matches.length > 0) {
          console.log('Sample match:', matches[0]);
        }
        
        setMatchedDonors(matches);
        setShowResults(true);
      } else {
        console.log('Missing data - showing empty results');
        console.log('Users count:', users.length);
        console.log('Donations count:', donations.length);
        setMatchedDonors([]);
        setShowResults(true); // Show results even if no data to display the "no donors found" message
      }

      // Set current emergency request for live tracking
      setCurrentEmergencyRequest({
        bloodGroup: formData.bloodGroup,
        urgency: (formData.urgencyLevel.toLowerCase() as 'low' | 'medium' | 'high' | 'critical'),
        patientCode: `PT-${Date.now().toString().slice(-6)}`,
        location: formData.location,
        hospitalLat: 19.0170, // Default Mumbai coordinates
        hospitalLng: 72.8477
      });

    } catch (error) {
      console.error('Error creating emergency request:', error);
      alert('Failed to create emergency request. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleContactDonor = (donor: DonorMatch) => {
    // In a real app, this would trigger SMS/email/call
    alert(`Contacting ${donor.user.name} at ${donor.user.mobile}`);
  };

  const handleStartLiveTracking = () => {
    setShowLiveTracking(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="mr-4">
                <ArrowLeft className="h-6 w-6 text-gray-600 hover:text-gray-900" />
              </Link>
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Emergency Blood Request</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* How Matching Works Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">🩸 How Donor Matching Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">📋 Matching Criteria:</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• <strong>Blood Type Compatibility:</strong> Donors with compatible blood groups</li>
                <li>• <strong>Geographic Proximity:</strong> Donors within 50km of hospital</li>
                <li>• <strong>Donation Eligibility:</strong> Last donation &gt; 56 days ago</li>
                <li>• <strong>Availability Status:</strong> Active emergency/bridge donors</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">🎯 Important Notes:</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• <strong>Patient Name:</strong> Used for hospital records only</li>
                <li>• <strong>Matching:</strong> Based on blood type + location, not patient identity</li>
                <li>• <strong>Universal Donors:</strong> O- donors can help anyone</li>
                <li>• <strong>Emergency Priority:</strong> Critical cases get highest priority</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Request Form */}
          <div className="card">
            <div className="flex items-center mb-6">
              <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Create Emergency Request</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Requester Name *
                  </label>
                  <input
                    type="text"
                    name="requesterName"
                    value={formData.requesterName}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="Hospital or individual name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Number *
                  </label>
                  <input
                    type="tel"
                    name="requesterContact"
                    value={formData.requesterContact}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blood Group Required *
                  </label>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                  >
                    <option value="">Select Blood Group</option>
                    {bloodGroups.map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Units Required *
                  </label>
                  <input
                    type="number"
                    name="unitsRequired"
                    value={formData.unitsRequired}
                    onChange={handleInputChange}
                    min="1"
                    max="10"
                    required
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Urgency Level *
                  </label>
                  <select
                    name="urgencyLevel"
                    value={formData.urgencyLevel}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                  >
                    {urgencyLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Hospital *
                  </label>
                  <select
                    name="hospitalSelect"
                    value={formData.hospitalName || ''}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                  >
                    <option value="">Choose a hospital...</option>
                    {hospitals.map(hospital => (
                      <option key={hospital.name} value={hospital.name}>
                        {hospital.name} {hospital.city !== 'Other' && `(${hospital.city})`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hospital Name *
                  </label>
                  <input
                    type="text"
                    name="hospitalName"
                    value={formData.hospitalName}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="Enter hospital name"
                    readOnly={formData.hospitalName !== '' && formData.hospitalName !== 'Custom Location'}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hospital Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  placeholder="Enter complete hospital address with city"
                  readOnly={formData.location !== '' && formData.hospitalName !== 'Custom Location'}
                />
                {formData.location && (
                  <p className="text-xs text-gray-500 mt-1">
                    📍 {formData.location}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="input-field"
                  placeholder="Any additional information about the emergency..."
                />
              </div>

              <button
                type="submit"
                disabled={isSearching}
                className="btn-primary w-full flex items-center justify-center"
              >
                {isSearching ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Searching for Donors...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Find Matching Donors
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {showResults && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Matching Donors</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{matchedDonors.length} donors found</span>
                    {matchedDonors.length > 0 && (
                      <button
                        onClick={handleStartLiveTracking}
                        className="btn-primary flex items-center text-sm px-3 py-1"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Live Track
                      </button>
                    )}
                  </div>
                </div>

                {matchedDonors.length > 0 ? (
                  <div className="space-y-4">
                    {matchedDonors.slice(0, 5).map((donor, index) => (
                      <motion.div
                        key={donor.user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900">{donor.user.name}</h4>
                            <p className="text-sm text-gray-600">{donor.user.mobile}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBloodGroupColor(donor.user.bloodGroup)}`}>
                              {donor.user.bloodGroup}
                            </span>
                            <span className="text-xs text-gray-500">{donor.distance} km</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                          <div>
                            <span className="font-medium">Last Donation:</span>
                            <p>{donor.lastDonation ? new Date(donor.lastDonation.donationDate).toLocaleDateString() : 'Never'}</p>
                          </div>
                          <div>
                            <span className="font-medium">Next Eligible:</span>
                            <p>{donor.lastDonation ? new Date(donor.lastDonation.nextEligibleDate).toLocaleDateString() : 'Now'}</p>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full" 
                                style={{ width: `${donor.matchScore || donor.compatibilityScore}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-600">{donor.matchScore || donor.compatibilityScore}% match</span>
                          </div>
                          <button
                            onClick={() => handleContactDonor(donor)}
                            className="btn-primary text-sm px-3 py-1"
                          >
                            Contact
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No matching donors found in your area.</p>
                    <p className="text-sm text-gray-500 mt-2">Try expanding your search radius or contact nearby blood banks.</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Emergency Guidelines */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Guidelines</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start">
                  <Clock className="h-4 w-4 text-red-600 mr-2 mt-0.5" />
                  <span>Critical requests are prioritized and processed within 15 minutes</span>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 text-red-600 mr-2 mt-0.5" />
                  <span>Donors are matched based on proximity, availability, and compatibility</span>
                </div>
                <div className="flex items-start">
                  <Phone className="h-4 w-4 text-red-600 mr-2 mt-0.5" />
                  <span>Emergency hotline: +91 98765 43210 (24/7)</span>
                </div>
                <div className="flex items-start">
                  <Mail className="h-4 w-4 text-red-600 mr-2 mt-0.5" />
                  <span>Email: emergency@bloodbridge.com</span>
                </div>
              </div>
            </div>

            {/* Blood Compatibility Chart */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Blood Compatibility</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-red-50 rounded">
                  <span className="font-medium">A+ can receive:</span>
                  <p>A+, A-, O+, O-</p>
                </div>
                <div className="p-2 bg-blue-50 rounded">
                  <span className="font-medium">B+ can receive:</span>
                  <p>B+, B-, O+, O-</p>
                </div>
                <div className="p-2 bg-green-50 rounded">
                  <span className="font-medium">AB+ can receive:</span>
                  <p>All blood types</p>
                </div>
                <div className="p-2 bg-yellow-50 rounded">
                  <span className="font-medium">O+ can receive:</span>
                  <p>O+, O-</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Donor Tracking Modal */}
      <LiveDonorTracking
        isVisible={showLiveTracking}
        onClose={() => setShowLiveTracking(false)}
        hospitalLocation={{ 
          lat: currentEmergencyRequest?.hospitalLat || 19.0170, 
          lng: currentEmergencyRequest?.hospitalLng || 72.8477 
        }}
        hospitalName={formData.hospitalName || 'Emergency Hospital'}
        emergencyRequest={currentEmergencyRequest ? {
          bloodGroup: currentEmergencyRequest.bloodGroup,
          urgency: currentEmergencyRequest.urgency,
          patientCode: currentEmergencyRequest.patientCode,
          location: currentEmergencyRequest.location
        } : undefined}
      />
    </div>
  );
}
