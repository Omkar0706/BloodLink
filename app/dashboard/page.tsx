'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Users, 
  MapPin, 
  AlertTriangle, 
  TrendingUp,
  Calendar,
  Phone,
  Mail,
  Bell,
  Search,
  Filter,
  Plus
} from 'lucide-react';
import { mockDashboardStats, mockUsers, mockDonations, mockEmergencyRequests } from '@/lib/mockData';
import { formatDate, getBloodGroupColor, getStatusColor, getUrgencyColor } from '@/utils/helpers';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');

  const stats = [
    {
      title: 'Total Donors',
      value: mockDashboardStats.totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Active Bridges',
      value: mockDashboardStats.activeBridges,
      icon: MapPin,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Emergency Requests',
      value: mockDashboardStats.emergencyRequests,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      title: 'Pending Donations',
      value: mockDashboardStats.pendingDonations,
      icon: Calendar,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    }
  ];

  const bloodGroups = Object.entries(mockDashboardStats.bloodAvailability).map(([group, count]) => ({
    group,
    count,
    color: getBloodGroupColor(group as any)
  }));

  const recentDonations = mockDonations.slice(0, 5);
  const recentRequests = mockEmergencyRequests.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-red-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Blood Bridge Dashboard</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search donors, bridges..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Bell className="h-5 w-5" />
              </button>
              
                             <Link href="/analytics" className="text-gray-600 hover:text-red-600 mr-4">
                 Analytics
               </Link>
               <Link href="/enhanced-analytics" className="text-gray-600 hover:text-red-600 mr-4">
                 Enhanced Analytics
               </Link>
               <Link href="/dataset" className="text-gray-600 hover:text-red-600 mr-4">
                 Dataset
               </Link>
               <Link href="/comprehensive-data" className="text-gray-600 hover:text-red-600 mr-4">
                 Comprehensive Data
               </Link>
              <Link href="/" className="text-gray-600 hover:text-red-600">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="card"
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: TrendingUp },
                { id: 'donors', label: 'Donors', icon: Users },
                { id: 'bridges', label: 'Bridges', icon: MapPin },
                { id: 'donations', label: 'Donations', icon: Heart },
                { id: 'emergency', label: 'Emergency', icon: AlertTriangle }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Blood Group Availability */}
            <div className="lg:col-span-2">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Blood Group Availability</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {bloodGroups.map((bg) => (
                    <div key={bg.group} className="text-center">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${bg.color}`}>
                        {bg.group}
                      </div>
                      <p className="text-2xl font-bold text-gray-900 mt-2">{bg.count}</p>
                      <p className="text-sm text-gray-600">units available</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link href="/dashboard/emergency" className="btn-primary w-full flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Emergency Request
                </Link>
                <Link href="/donor-management" className="btn-secondary w-full flex items-center justify-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Manage Donors
                </Link>
                <Link href="/donor-management" className="btn-success w-full flex items-center justify-center">
                  <Heart className="h-4 w-4 mr-2" />
                  Record Donation
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'donors' && (
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Donors</h3>
              <Link href="/dashboard/donors/new" className="btn-primary flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Add Donor
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Blood Group
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      City
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.mobile}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBloodGroupColor(user.bloodGroup)}`}>
                          {user.bloodGroup}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.city}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.role}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`status-badge ${user.isActive ? 'status-active' : 'status-inactive'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link href={`/dashboard/donors/${user.id}`} className="text-red-600 hover:text-red-900">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'donations' && (
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recent Donations</h3>
              <Link href="/dashboard/donations/new" className="btn-primary flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Record Donation
              </Link>
            </div>
            
            <div className="space-y-4">
              {recentDonations.map((donation) => {
                const donor = mockUsers.find(u => u.id === donation.userId);
                return (
                  <div key={donation.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{donor?.name}</h4>
                        <p className="text-sm text-gray-600">{donation.donationType}</p>
                        <p className="text-sm text-gray-500">Date: {formatDate(donation.donationDate)}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`status-badge ${getStatusColor(donation.status)}`}>
                          {donation.status}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBloodGroupColor(donor?.bloodGroup || 'A+')}`}>
                          {donor?.bloodGroup}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'emergency' && (
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Emergency Requests</h3>
              <Link href="/dashboard/emergency" className="btn-primary flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </Link>
            </div>
            
            <div className="space-y-4">
              {recentRequests.map((request) => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{request.requesterName}</h4>
                      <p className="text-sm text-gray-600">{request.location}</p>
                      <p className="text-sm text-gray-500">
                        {request.units} units of {request.bloodGroup} needed
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`status-badge ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                      <span className={`status-badge ${getUrgencyColor(request.urgency)}`}>
                        {request.urgency}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'bridges' && (
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Blood Bridges</h3>
              <Link href="/dashboard/bridges/new" className="btn-primary flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Add Bridge
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: 'Mumbai Central Bridge', location: 'Mumbai', donors: 15, status: 'Active' },
                { name: 'Pune Station Bridge', location: 'Pune', donors: 12, status: 'Active' },
                { name: 'Hyderabad Central Bridge', location: 'Hyderabad', donors: 8, status: 'Inactive' }
              ].map((bridge, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">{bridge.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{bridge.location}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">{bridge.donors} donors</span>
                    <span className={`status-badge ${bridge.status === 'Active' ? 'status-active' : 'status-inactive'}`}>
                      {bridge.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
