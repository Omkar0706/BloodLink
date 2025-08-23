'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ChevronDownIcon, 
  ChevronUpIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  UserIcon,
  HeartIcon,
  MapPinIcon,
  LinkIcon
} from '@heroicons/react/24/outline';
import { getComprehensiveDataset, EnhancedUser } from '@/lib/comprehensiveData';

type SortField = keyof EnhancedUser;
type SortDirection = 'asc' | 'desc';

export default function ComprehensiveDataTable() {
  const [data, setData] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('user_id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState('users');

  // Load data on component mount
  React.useEffect(() => {
    const comprehensiveData = getComprehensiveDataset();
    setData(comprehensiveData);
  }, []);

  if (!data) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-lg">Loading comprehensive data...</div>
      </div>
    );
  }

  const { users, patterns, summary } = data;

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = users.filter((user: EnhancedUser) => 
      user.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.blood_group.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a: EnhancedUser, b: EnhancedUser) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [users, searchTerm, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredAndSortedData.slice(startIndex, endIndex);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800">Inactive</Badge>;
      case 'eligible':
        return <Badge className="bg-blue-100 text-blue-800">Eligible</Badge>;
      case 'not eligible':
        return <Badge className="bg-yellow-100 text-yellow-800">Not Eligible</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getBloodGroupBadge = (bloodGroup: string) => {
    return <Badge className="bg-red-100 text-red-800">{bloodGroup}</Badge>;
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      'Bridge Donor': 'bg-purple-100 text-purple-800',
      'Emergency Donor': 'bg-orange-100 text-orange-800',
      'Fighter': 'bg-blue-100 text-blue-800'
    };
    return <Badge className={colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{role}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Comprehensive Blood Donation Data</h1>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="text-sm">
            Total Users: {summary.totalUsers}
          </Badge>
          <Badge variant="outline" className="text-sm">
            Total Donations: {summary.totalDonations}
          </Badge>
        </div>
      </div>

      {/* Dataset Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <UserIcon className="h-4 w-4 text-blue-600" />
            <CardTitle className="text-sm font-medium ml-2">User Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <HeartIcon className="h-4 w-4 text-red-600" />
            <CardTitle className="text-sm font-medium ml-2">Donations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalDonations}</div>
            <p className="text-xs text-muted-foreground">Total donations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <MapPinIcon className="h-4 w-4 text-green-600" />
            <CardTitle className="text-sm font-medium ml-2">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.activeUsers}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <LinkIcon className="h-4 w-4 text-purple-600" />
            <CardTitle className="text-sm font-medium ml-2">Eligible</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.eligibleUsers}</div>
            <p className="text-xs text-muted-foreground">Ready to donate</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FunnelIcon className="h-5 w-5" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by ID, name, role, blood group, or city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setSearchTerm('')}
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Table with Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Comprehensive Dataset Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="users">User Details</TabsTrigger>
              <TabsTrigger value="donation-metrics">Donation Metrics</TabsTrigger>
              <TabsTrigger value="bridge-assignments">Bridge Assignments</TabsTrigger>
              <TabsTrigger value="donation-history">Donation History</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th 
                        className="px-6 py-3 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('user_id')}
                      >
                        <div className="flex items-center gap-1">
                          User ID
                          {sortField === 'user_id' && (
                            sortDirection === 'asc' ? 
                              <ChevronUpIcon className="h-4 w-4" /> : 
                              <ChevronDownIcon className="h-4 w-4" />
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3">Name</th>
                      <th className="px-6 py-3">Role</th>
                      <th className="px-6 py-3">Blood Group</th>
                      <th className="px-6 py-3">City</th>
                      <th className="px-6 py-3">Gender</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.map((user: EnhancedUser) => (
                      <tr key={user.user_id} className="bg-white border-b hover:bg-gray-50">
                        <td className="px-6 py-4 font-mono text-xs">{user.user_id}</td>
                        <td className="px-6 py-4 font-medium">{user.name}</td>
                        <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                        <td className="px-6 py-4">{getBloodGroupBadge(user.blood_group)}</td>
                        <td className="px-6 py-4">{user.city}</td>
                        <td className="px-6 py-4">{user.gender}</td>
                        <td className="px-6 py-4">
                          {getStatusBadge(user.user_donation_active_status)}
                        </td>
                        <td className="px-6 py-4">
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="donation-metrics" className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th className="px-6 py-3">User ID</th>
                      <th className="px-6 py-3">Name</th>
                      <th 
                        className="px-6 py-3 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('donations_till_date')}
                      >
                        <div className="flex items-center gap-1">
                          Total Donations
                          {sortField === 'donations_till_date' && (
                            sortDirection === 'asc' ? 
                              <ChevronUpIcon className="h-4 w-4" /> : 
                              <ChevronDownIcon className="h-4 w-4" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('cycle_of_donations')}
                      >
                        <div className="flex items-center gap-1">
                          Completed Cycles
                          {sortField === 'cycle_of_donations' && (
                            sortDirection === 'asc' ? 
                              <ChevronUpIcon className="h-4 w-4" /> : 
                              <ChevronDownIcon className="h-4 w-4" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('frequency_in_days')}
                      >
                        <div className="flex items-center gap-1">
                          Frequency (days)
                          {sortField === 'frequency_in_days' && (
                            sortDirection === 'asc' ? 
                              <ChevronUpIcon className="h-4 w-4" /> : 
                              <ChevronDownIcon className="h-4 w-4" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('calls_to_donations_ratio')}
                      >
                        <div className="flex items-center gap-1">
                          Calls/Donations
                          {sortField === 'calls_to_donations_ratio' && (
                            sortDirection === 'asc' ? 
                              <ChevronUpIcon className="h-4 w-4" /> : 
                              <ChevronDownIcon className="h-4 w-4" />
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3">Last Donation</th>
                      <th className="px-6 py-3">Next Eligible</th>
                      <th className="px-6 py-3">Eligibility</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.map((user: EnhancedUser) => (
                      <tr key={user.user_id} className="bg-white border-b hover:bg-gray-50">
                        <td className="px-6 py-4 font-mono text-xs">{user.user_id}</td>
                        <td className="px-6 py-4 font-medium">{user.name}</td>
                        <td className="px-6 py-4 font-bold">{user.donations_till_date}</td>
                        <td className="px-6 py-4">{user.cycle_of_donations}</td>
                        <td className="px-6 py-4">{user.frequency_in_days.toFixed(0)}</td>
                        <td className="px-6 py-4">{user.calls_to_donations_ratio.toFixed(2)}</td>
                        <td className="px-6 py-4 text-sm">
                          {user.last_donation_date ? new Date(user.last_donation_date).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {user.next_eligible_date ? new Date(user.next_eligible_date).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(user.eligibility_status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="bridge-assignments" className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th className="px-6 py-3">User ID</th>
                      <th className="px-6 py-3">Name</th>
                      <th className="px-6 py-3">Bridge ID</th>
                      <th className="px-6 py-3">Bridge Name</th>
                      <th className="px-6 py-3">Role in Bridge</th>
                      <th className="px-6 py-3">Frequency (days)</th>
                      <th className="px-6 py-3">Units Required</th>
                      <th className="px-6 py-3">Blood Group Required</th>
                      <th className="px-6 py-3">Last Bridge Donation</th>
                      <th className="px-6 py-3">Next Bridge Donation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.map((user: EnhancedUser) => 
                      user.bridge_assignments.map((assignment, index) => (
                        <tr key={`${user.user_id}-${assignment.bridge_id}`} className="bg-white border-b hover:bg-gray-50">
                          <td className="px-6 py-4 font-mono text-xs">{user.user_id}</td>
                          <td className="px-6 py-4 font-medium">{user.name}</td>
                          <td className="px-6 py-4 font-mono text-xs">{assignment.bridge_id}</td>
                          <td className="px-6 py-4">{assignment.bridge_name}</td>
                          <td className="px-6 py-4">{getRoleBadge(assignment.role_in_bridge)}</td>
                          <td className="px-6 py-4">{assignment.frequency_days}</td>
                          <td className="px-6 py-4">{assignment.units_required}</td>
                          <td className="px-6 py-4">{getBloodGroupBadge(assignment.blood_group_required)}</td>
                          <td className="px-6 py-4 text-sm">
                            {assignment.last_donation_date ? new Date(assignment.last_donation_date).toLocaleDateString() : 'Never'}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {assignment.next_donation_date ? new Date(assignment.next_donation_date).toLocaleDateString() : 'N/A'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="donation-history" className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th className="px-6 py-3">User ID</th>
                      <th className="px-6 py-3">Name</th>
                      <th className="px-6 py-3">Donation ID</th>
                      <th className="px-6 py-3">Bridge ID</th>
                      <th className="px-6 py-3">Donation Date</th>
                      <th className="px-6 py-3">Donation Type</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Units Donated</th>
                      <th className="px-6 py-3">Next Eligible Date</th>
                      <th className="px-6 py-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.map((user: EnhancedUser) => 
                      user.donation_history.map((donation) => (
                        <tr key={donation.donation_id} className="bg-white border-b hover:bg-gray-50">
                          <td className="px-6 py-4 font-mono text-xs">{user.user_id}</td>
                          <td className="px-6 py-4 font-medium">{user.name}</td>
                          <td className="px-6 py-4 font-mono text-xs">{donation.donation_id}</td>
                          <td className="px-6 py-4 font-mono text-xs">{donation.bridge_id}</td>
                          <td className="px-6 py-4 text-sm">
                            {new Date(donation.donation_date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <Badge className="bg-blue-100 text-blue-800">{donation.donation_type}</Badge>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={
                              donation.status === 'Complete' ? 'bg-green-100 text-green-800' :
                              donation.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }>
                              {donation.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 font-bold">{donation.units_donated}</td>
                          <td className="px-6 py-4 text-sm">
                            {new Date(donation.next_eligible_date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {donation.notes || '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-700">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedData.length)} of {filteredAndSortedData.length} results
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-3 text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
