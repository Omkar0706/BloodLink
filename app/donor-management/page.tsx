'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  UserPlus, 
  Heart, 
  ArrowLeft,
  Save,
  Users,
  Droplets,
  Search,
  Loader2,
  MapPin,
  Phone
} from 'lucide-react';
import { useUsers, useCreateUser, useCreateDonation, useDonations } from '@/lib/hooks';
import { CreateUserForm } from '@/types';

// Helper functions
const formatDate = (date: Date | string) => {
  const d = new Date(date);
  return d.toLocaleDateString();
};

const getBloodGroupColor = (bloodGroup: string) => {
  const colors: Record<string, string> = {
    'A+': 'bg-red-100 text-red-800',
    'A-': 'bg-red-200 text-red-900',
    'B+': 'bg-blue-100 text-blue-800',
    'B-': 'bg-blue-200 text-blue-900',
    'AB+': 'bg-purple-100 text-purple-800',
    'AB-': 'bg-purple-200 text-purple-900',
    'O+': 'bg-green-100 text-green-800',
    'O-': 'bg-green-200 text-green-900',
  };
  return colors[bloodGroup] || 'bg-gray-100 text-gray-800';
};

interface DonationFormData {
  userId: string;
  donationType: string;
  donationDate: string;
  bridgeId: string;
  donationStatus: string;
}

export default function DonorManagementPage() {
  const [activeTab, setActiveTab] = useState('view-donors');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterBloodGroup, setFilterBloodGroup] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // Form states
  const [donorFormData, setDonorFormData] = useState<CreateUserForm>({
    name: '',
    gender: 'Male',
    mobile: '',
    dateOfBirth: '',
    bloodGroup: '',
    city: '',
    pincode: 400001,
    role: 'Fighter'
  });

  const [donationFormData, setDonationFormData] = useState<DonationFormData>({
    userId: '',
    donationType: 'Blood Donation',
    donationDate: new Date().toISOString().split('T')[0],
    bridgeId: 'B100',
    donationStatus: 'Complete'
  });

  // Fetch real data using hooks
  const { 
    data: usersData, 
    loading: usersLoading, 
    error: usersError, 
    refetch: refetchUsers 
  } = useUsers({ 
    page: currentPage, 
    limit: usersPerPage,
    role: filterRole || undefined,
    bloodGroup: filterBloodGroup || undefined
  });

  const { 
    data: donationsData, 
    loading: donationsLoading 
  } = useDonations({ limit: 5 });

  // Mutations
  const { 
    mutate: createUser, 
    loading: isSubmittingDonor 
  } = useCreateUser(
    (newUser) => {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setDonorFormData({
        name: '',
        gender: 'Male',
        mobile: '',
        dateOfBirth: '',
        bloodGroup: '',
        city: '',
        pincode: 400001,
        role: 'Fighter'
      });
      refetchUsers();
    },
    (error) => {
      console.error('Error creating user:', error);
    }
  );

  const { 
    mutate: createDonation, 
    loading: isSubmittingDonation 
  } = useCreateDonation(
    (newDonation) => {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setDonationFormData({
        userId: '',
        donationType: 'Blood Donation',
        donationDate: new Date().toISOString().split('T')[0],
        bridgeId: 'B100',
        donationStatus: 'Complete'
      });
    },
    (error) => {
      console.error('Error creating donation:', error);
    }
  );

  const handleDonorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createUser({
      ...donorFormData,
      dateOfBirth: new Date(donorFormData.dateOfBirth)
    });
  };

  const handleDonationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createDonation({
      ...donationFormData,
      donationDate: new Date(donationFormData.donationDate),
      nextEligibleDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days later
    });
  };

  // Filter users based on search term
  const filteredUsers = usersData?.data?.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.mobile.includes(searchTerm) ||
    user.city.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const genders = ['Male', 'Female', 'Other'];
  const roles = ['Fighter', 'Bridge Donor', 'Emergency Donor'];
  const donationTypes = ['Blood Bridge Donation', 'Emergency Donation', 'Voluntary Donation'];

  const handleDonorInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDonorFormData(prev => ({
      ...prev,
      [name]: name === 'pincode' ? parseInt(value) || 0 : value
    }));
  };

  const handleDonationInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDonationFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
              <Heart className="h-8 w-8 text-red-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Donor Management</span>
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
            className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg"
          >
            <p className="font-medium">Success! Operation completed successfully.</p>
          </motion.div>
        )}

        {/* Error Message */}
        {usersError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            <p className="font-medium">Error loading data: {usersError}</p>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'view-donors', name: 'View Donors', icon: Users },
              { id: 'add-donor', name: 'Add Donor', icon: UserPlus },
              { id: 'add-donation', name: 'Record Donation', icon: Droplets },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'view-donors' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {usersLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : usersData?.total || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <Droplets className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Total Donations</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {donationsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : donationsData?.total || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <Heart className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Active Donors</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {usersData?.data?.length || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by name, mobile, or city..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">All Roles</option>
                  {roles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>

                <select
                  value={filterBloodGroup}
                  onChange={(e) => setFilterBloodGroup(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">All Blood Groups</option>
                  {bloodGroups.map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Users List */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Donors List</h3>
              </div>
              <div className="p-6">
                {usersLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : filteredUsers.length > 0 ? (
                  <div className="space-y-4">
                    {filteredUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">{user.name}</h4>
                              <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                                <span className="flex items-center">
                                  <Phone className="h-4 w-4 mr-1" />
                                  {user.mobile}
                                </span>
                                <span className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-1" />
                                  {user.city}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2 mt-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBloodGroupColor(user.bloodGroup)}`}>
                                  {user.bloodGroup}
                                </span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {user.role}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {user.gender} • {new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear()} years
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No donors found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'add-donor' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Add New Donor</h3>
              
              <form onSubmit={handleDonorSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={donorFormData.name}
                      onChange={handleDonorInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Enter full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender *
                    </label>
                    <select
                      name="gender"
                      required
                      value={donorFormData.gender}
                      onChange={handleDonorInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      {genders.map(gender => (
                        <option key={gender} value={gender}>{gender}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      name="mobile"
                      required
                      value={donorFormData.mobile}
                      onChange={handleDonorInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="+91-9876543210"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      required
                      value={donorFormData.dateOfBirth}
                      onChange={handleDonorInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Blood Group *
                    </label>
                    <select
                      name="bloodGroup"
                      required
                      value={donorFormData.bloodGroup}
                      onChange={handleDonorInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="">Select Blood Group</option>
                      {bloodGroups.map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={donorFormData.city}
                      onChange={handleDonorInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Enter city"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PIN Code *
                    </label>
                    <input
                      type="number"
                      name="pincode"
                      required
                      value={donorFormData.pincode}
                      onChange={handleDonorInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="400001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role *
                    </label>
                    <select
                      name="role"
                      required
                      value={donorFormData.role}
                      onChange={handleDonorInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      {roles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingDonor}
                    className="flex items-center space-x-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingDonor ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    <span>{isSubmittingDonor ? 'Saving...' : 'Save Donor'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'add-donation' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Record New Donation</h3>
              
              <form onSubmit={handleDonationSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Donor User ID *
                  </label>
                  <input
                    type="text"
                    name="userId"
                    required
                    value={donationFormData.userId}
                    onChange={handleDonationInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter user ID (e.g., U100)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Donation Type *
                  </label>
                  <select
                    name="donationType"
                    required
                    value={donationFormData.donationType}
                    onChange={handleDonationInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
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
                    required
                    value={donationFormData.donationDate}
                    onChange={handleDonationInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bridge ID
                  </label>
                  <input
                    type="text"
                    name="bridgeId"
                    value={donationFormData.bridgeId}
                    onChange={handleDonationInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="B100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    name="donationStatus"
                    required
                    value={donationFormData.donationStatus}
                    onChange={handleDonationInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="Complete">Complete</option>
                    <option value="Pending">Pending</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingDonation}
                    className="flex items-center space-x-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingDonation ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    <span>{isSubmittingDonation ? 'Recording...' : 'Record Donation'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
