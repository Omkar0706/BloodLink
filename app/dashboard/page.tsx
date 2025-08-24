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
  RefreshCw,
  Plus,
  Brain
} from 'lucide-react';
import { useDashboardStats, useUsers, useEmergencyRequests, useDonations } from '@/lib/hooks';
import { formatDate, getBloodGroupColor } from '@/utils/helpers';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch real data from API
  const { data: stats, loading: statsLoading, refetch: refetchStats } = useDashboardStats();
  const { data: usersData, loading: usersLoading, refetch: refetchUsers } = useUsers({ limit: 10 });
  const { data: emergencyData, loading: emergencyLoading, refetch: refetchEmergency } = useEmergencyRequests({ limit: 5 });
  const { data: donationsData, loading: donationsLoading, refetch: refetchDonations } = useDonations({ limit: 5 });

  const dashboardStats = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Active Bridges',
      value: stats?.activeBridges || 0,
      icon: MapPin,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Emergency Requests',
      value: stats?.emergencyRequests || 0,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      title: 'Total Donations',
      value: stats?.totalDonations || 0,
      icon: Heart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  const handleRefreshAll = () => {
    refetchStats();
    refetchUsers();
    refetchEmergency();
    refetchDonations();
  };

  const recentDonations = donationsData?.data || [];
  const recentRequests = emergencyData?.data || [];
  const recentUsers = usersData?.data || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <Heart className="h-8 w-8 text-red-600" />
                <span className="text-xl font-bold text-gray-900">BloodLink Dashboard</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefreshAll}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                disabled={statsLoading || usersLoading || emergencyLoading || donationsLoading}
              >
                <RefreshCw className={`h-4 w-4 ${(statsLoading || usersLoading || emergencyLoading || donationsLoading) ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              
              <Link
                href="/ai-features"
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Brain className="h-4 w-4" />
                <span>AI Features</span>
              </Link>
              
              <Link
                href="/dashboard/emergency"
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>New Emergency</span>
              </Link>

              <Link
                href="/donor-management"
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Users className="h-4 w-4" />
                <span>Donor Management</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardStats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="flex items-center">
                <div className={`${stat.bgColor} rounded-lg p-3`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {['overview', 'users', 'donations', 'emergencies'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Users */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Users</h3>
              </div>
              <div className="p-6">
                {usersLoading ? (
                  <div className="text-center text-gray-500">Loading users...</div>
                ) : (
                  <div className="space-y-4">
                    {recentUsers.slice(0, 5).map((user: any) => (
                      <div key={user.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.city}</p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBloodGroupColor(user.bloodGroup)}`}>
                          {user.bloodGroup}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Donations */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Donations</h3>
              </div>
              <div className="p-6">
                {donationsLoading ? (
                  <div className="text-center text-gray-500">Loading donations...</div>
                ) : (
                  <div className="space-y-4">
                    {recentDonations.slice(0, 5).map((donation: any) => {
                      const donor = recentUsers.find((u: any) => u.userId === donation.userId);
                      return (
                        <div key={donation.id} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{donor?.name || 'Unknown Donor'}</p>
                            <p className="text-sm text-gray-500">{donation.donationType}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">{new Date(donation.donationDate).toLocaleDateString()}</p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBloodGroupColor(donor?.bloodGroup || 'A+')}`}>
                              {donor?.bloodGroup || 'A+'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">All Users</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Group</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentUsers.map((user: any) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBloodGroupColor(user.bloodGroup)}`}>
                          {user.bloodGroup}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.city}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.role}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.mobile}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'donations' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Donations</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentDonations.map((donation: any) => {
                  const donor = recentUsers.find((u: any) => u.userId === donation.userId);
                  return (
                    <div key={donation.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{donor?.name || 'Unknown Donor'}</h4>
                          <p className="text-sm text-gray-600">{donation.donationType}</p>
                          <p className="text-sm text-gray-500">Date: {new Date(donation.donationDate).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="status-badge status-active">Completed</span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBloodGroupColor(donor?.bloodGroup || 'A+')}`}>
                            {donor?.bloodGroup || 'A+'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'emergencies' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Emergency Requests</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentRequests.map((request: any) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{request.requester || 'Emergency Request'}</h4>
                        <p className="text-sm text-gray-600">
                          {request.unitsRequired || 1} units of {request.bloodGroup} needed
                        </p>
                        <p className="text-sm text-gray-500">Location: {request.location}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="status-badge status-urgent">
                          {request.urgencyLevel || 'High'}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBloodGroupColor(request.bloodGroup)}`}>
                          {request.bloodGroup}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
