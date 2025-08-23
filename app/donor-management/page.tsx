'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  UserPlus, 
  Heart, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  ArrowLeft,
  Save,
  Plus,
  Users,
  Droplets,
  Clock
} from 'lucide-react';
import { mockUsers, mockDonations } from '@/lib/mockData';
import { getBloodGroupColor, formatDate } from '@/utils/helpers';

interface DonorFormData {
  name: string;
  gender: string;
  mobile: string;
  email: string;
  dateOfBirth: string;
  bloodGroup: string;
  city: string;
  role: string;
  latitude: number;
  longitude: number;
}

interface DonationFormData {
  donorId: string;
  donationType: string;
  donationDate: string;
  notes: string;
}

export default function DonorManagementPage() {
  const [activeTab, setActiveTab] = useState('add-donor');
  const [donorFormData, setDonorFormData] = useState<DonorFormData>({
    name: '',
    gender: '',
    mobile: '',
    email: '',
    dateOfBirth: '',
    bloodGroup: '',
    city: '',
    role: '',
    latitude: 19.0170,
    longitude: 72.8477
  });

  const [donationFormData, setDonationFormData] = useState<DonationFormData>({
    donorId: '',
    donationType: '',
    donationDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [isSubmittingDonor, setIsSubmittingDonor] = useState(false);
  const [isSubmittingDonation, setIsSubmittingDonation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const genders = ['Male', 'Female', 'Other'];
  const roles = ['Bridge Donor', 'Emergency Donor', 'Fighter'];
  const donationTypes = ['Blood Bridge Donation', 'Emergency Donation', 'Voluntary Donation'];

  const handleDonorInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDonorFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDonationInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDonationFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDonorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingDonor(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    console.log('New donor data:', donorFormData);
    
    setIsSubmittingDonor(false);
    setShowSuccess(true);
    
    // Reset form
    setDonorFormData({
      name: '',
      gender: '',
      mobile: '',
      email: '',
      dateOfBirth: '',
      bloodGroup: '',
      city: '',
      role: '',
      latitude: 19.0170,
      longitude: 72.8477
    });

    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleDonationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingDonation(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    console.log('New donation data:', donationFormData);
    
    setIsSubmittingDonation(false);
    setShowSuccess(true);
    
    // Reset form
    setDonationFormData({
      donorId: '',
      donationType: '',
      donationDate: new Date().toISOString().split('T')[0],
      notes: ''
    });

    setTimeout(() => setShowSuccess(false), 3000);
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
              <UserPlus className="h-8 w-8 text-red-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Donor Management</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Total Donors: {mockUsers.length}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg"
          >
            <div className="flex items-center">
              <Heart className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-green-800 font-medium">
                {activeTab === 'add-donor' ? 'Donor added successfully!' : 'Donation recorded successfully!'}
              </span>
            </div>
          </motion.div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                <p className="text-sm font-medium text-gray-600">Total Donors</p>
                <p className="text-2xl font-bold text-gray-900">{mockUsers.length}</p>
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
                <p className="text-sm font-medium text-gray-600">Total Donations</p>
                <p className="text-2xl font-bold text-gray-900">{mockDonations.length}</p>
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
              <div className="p-3 bg-purple-100 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Donors</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockUsers.filter(user => user.isActive).length}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('add-donor')}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'add-donor'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Donor
              </button>
              <button
                onClick={() => setActiveTab('record-donation')}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'record-donation'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Heart className="h-4 w-4 mr-2" />
                Record Donation
              </button>
            </nav>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'add-donor' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Add Donor Form */}
            <div className="card">
              <div className="flex items-center mb-6">
                <UserPlus className="h-6 w-6 text-red-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Add New Donor</h2>
              </div>

              <form onSubmit={handleDonorSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={donorFormData.name}
                      onChange={handleDonorInputChange}
                      required
                      className="input-field"
                      placeholder="Enter full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender *
                    </label>
                    <select
                      name="gender"
                      value={donorFormData.gender}
                      onChange={handleDonorInputChange}
                      required
                      className="input-field"
                    >
                      <option value="">Select Gender</option>
                      {genders.map(gender => (
                        <option key={gender} value={gender}>{gender}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      name="mobile"
                      value={donorFormData.mobile}
                      onChange={handleDonorInputChange}
                      required
                      className="input-field"
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={donorFormData.email}
                      onChange={handleDonorInputChange}
                      className="input-field"
                      placeholder="donor@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={donorFormData.dateOfBirth}
                      onChange={handleDonorInputChange}
                      required
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Blood Group *
                    </label>
                    <select
                      name="bloodGroup"
                      value={donorFormData.bloodGroup}
                      onChange={handleDonorInputChange}
                      required
                      className="input-field"
                    >
                      <option value="">Select Blood Group</option>
                      {bloodGroups.map(group => (
                        <option key={group} value={group}>{group}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={donorFormData.city}
                      onChange={handleDonorInputChange}
                      required
                      className="input-field"
                      placeholder="Enter city"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role *
                    </label>
                    <select
                      name="role"
                      value={donorFormData.role}
                      onChange={handleDonorInputChange}
                      required
                      className="input-field"
                    >
                      <option value="">Select Role</option>
                      {roles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingDonor}
                  className="btn-primary w-full flex items-center justify-center"
                >
                  {isSubmittingDonor ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Adding Donor...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Add Donor
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Donor Guidelines */}
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Donor Eligibility Guidelines</h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start">
                    <Calendar className="h-4 w-4 text-red-600 mr-2 mt-0.5" />
                    <span>Age must be between 18-65 years</span>
                  </div>
                  <div className="flex items-start">
                    <Heart className="h-4 w-4 text-red-600 mr-2 mt-0.5" />
                    <span>Weight must be at least 50 kg</span>
                  </div>
                  <div className="flex items-start">
                    <Clock className="h-4 w-4 text-red-600 mr-2 mt-0.5" />
                    <span>Minimum 56 days gap between donations</span>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 text-red-600 mr-2 mt-0.5" />
                    <span>Must be in good health condition</span>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Donors</h3>
                <div className="space-y-3">
                  {mockUsers.slice(0, 5).map((donor) => (
                    <div key={donor.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{donor.name}</p>
                        <p className="text-sm text-gray-600">{donor.city} • {donor.role}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBloodGroupColor(donor.bloodGroup)}`}>
                          {donor.bloodGroup}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          donor.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {donor.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'record-donation' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Record Donation Form */}
            <div className="card">
              <div className="flex items-center mb-6">
                <Heart className="h-6 w-6 text-red-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Record Blood Donation</h2>
              </div>

              <form onSubmit={handleDonationSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Donor *
                  </label>
                  <select
                    name="donorId"
                    value={donationFormData.donorId}
                    onChange={handleDonationInputChange}
                    required
                    className="input-field"
                  >
                    <option value="">Select a donor</option>
                    {mockUsers.filter(user => user.isActive).map(donor => (
                      <option key={donor.id} value={donor.id}>
                        {donor.name} - {donor.bloodGroup} ({donor.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Donation Type *
                    </label>
                    <select
                      name="donationType"
                      value={donationFormData.donationType}
                      onChange={handleDonationInputChange}
                      required
                      className="input-field"
                    >
                      <option value="">Select Type</option>
                      {donationTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Donation Date *
                    </label>
                    <input
                      type="date"
                      name="donationDate"
                      value={donationFormData.donationDate}
                      onChange={handleDonationInputChange}
                      required
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={donationFormData.notes}
                    onChange={handleDonationInputChange}
                    rows={3}
                    className="input-field"
                    placeholder="Any additional notes about the donation..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingDonation}
                  className="btn-primary w-full flex items-center justify-center"
                >
                  {isSubmittingDonation ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Recording Donation...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Record Donation
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Recent Donations */}
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Donations</h3>
                <div className="space-y-3">
                  {mockDonations.slice(0, 5).map((donation) => {
                    const donor = mockUsers.find(user => user.id === donation.userId);
                    return (
                      <div key={donation.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{donor?.name || 'Unknown Donor'}</p>
                          <p className="text-sm text-gray-600">
                            {donation.donationType} • {formatDate(donation.donationDate)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            donation.status === 'Complete' ? 'bg-green-100 text-green-800' :
                            donation.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {donation.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Donation Statistics</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Donations:</span>
                    <span className="font-medium">{mockDonations.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completed:</span>
                    <span className="font-medium text-green-600">
                      {mockDonations.filter(d => d.status === 'Complete').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pending:</span>
                    <span className="font-medium text-yellow-600">
                      {mockDonations.filter(d => d.status === 'Pending').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">This Month:</span>
                    <span className="font-medium">
                      {mockDonations.filter(d => {
                        const donationDate = new Date(d.donationDate);
                        const now = new Date();
                        return donationDate.getMonth() === now.getMonth() && 
                               donationDate.getFullYear() === now.getFullYear();
                      }).length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
