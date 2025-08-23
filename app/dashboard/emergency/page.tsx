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
import { mockUsers, mockDonations } from '@/lib/mockData';
import { findMatchingDonors, getBloodGroupColor, getUrgencyColor, formatDate } from '@/utils/helpers';
import { EmergencyRequest, DonorMatch } from '@/types';
import LiveDonorTracking from '@/components/LiveDonorTracking';

export default function EmergencyPage() {
  const [formData, setFormData] = useState({
    requesterName: '',
    requesterContact: '',
    bloodGroup: 'A+',
    units: 1,
    urgency: 'Medium',
    location: 'Lilavati Hospital, Mumbai',
    latitude: 19.0170, // Lilavati Hospital coordinates
    longitude: 72.8477,
    notes: ''
  });

  const [matchedDonors, setMatchedDonors] = useState<DonorMatch[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showLiveTracking, setShowLiveTracking] = useState(false);
  const [currentEmergencyRequest, setCurrentEmergencyRequest] = useState<{
    bloodGroup: string;
    location: string;
    hospitalLat: number;
    hospitalLng: number;
  } | null>(null);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const urgencyLevels = ['Low', 'Medium', 'High', 'Critical'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const emergencyRequest: EmergencyRequest = {
      id: 'temp-id',
      ...formData,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const matches = findMatchingDonors(emergencyRequest, mockUsers, mockDonations);
    setMatchedDonors(matches);
    setShowResults(true);
    setIsSearching(false);

    // Set current emergency request for live tracking
    setCurrentEmergencyRequest({
      bloodGroup: formData.bloodGroup,
      location: formData.location,
      hospitalLat: formData.latitude,
      hospitalLng: formData.longitude
    });
  };

  const handleContactDonor = (donor: DonorMatch) => {
    // In a real app, this would trigger SMS/email/call
    alert(`Contacting ${donor.userName} at ${donor.contactNumber}`);
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
                    name="units"
                    value={formData.units}
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
                    name="urgency"
                    value={formData.urgency}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                  >
                    {urgencyLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
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
                    placeholder="Lilavati Hospital, Mumbai"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Currently set to Lilavati Hospital, Bandra West, Mumbai
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
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
                        key={donor.userId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900">{donor.userName}</h4>
                            <p className="text-sm text-gray-600">{donor.contactNumber}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBloodGroupColor(donor.bloodGroup)}`}>
                              {donor.bloodGroup}
                            </span>
                            <span className="text-xs text-gray-500">{donor.distance} km</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                          <div>
                            <span className="font-medium">Last Donation:</span>
                            <p>{donor.lastDonationDate}</p>
                          </div>
                          <div>
                            <span className="font-medium">Next Eligible:</span>
                            <p>{donor.nextEligibleDate}</p>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full" 
                                style={{ width: `${donor.matchScore}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-600">{donor.matchScore}% match</span>
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
        emergencyRequest={currentEmergencyRequest || undefined}
      />
    </div>
  );
}
