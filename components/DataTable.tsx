'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  ChevronDownIcon, 
  ChevronUpIcon, 
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

// Define the dataset structure based on the image
interface BloodDonationUser {
  user_id: string;
  role: 'Bridge Donor' | 'Emergency Donor' | 'Fighter' | 'Volunteer';
  donor_type: string;
  role_status: boolean;
  bridge_status: boolean;
  status_of_bridge?: boolean;
  blood_group: string;
  gender: 'Male' | 'Female';
  latitude: number;
  longitude: number;
  
  // Bridge Info
  bridge_id?: string;
  bridge_gender?: 'Male' | 'Female';
  bridge_blood_group?: string;
  quantity_required?: number;
  last_transfusion_date?: string;
  expected_next_transfusion_date?: string;
  
  // Donation History
  last_contact?: string;
  last_donation_date?: string;
  next_eligible_date?: string;
  donations_till_date: number;
  cycle_of_donations: number;
  frequency_in_days: number;
  last_bridge_donation_date?: string;
  calls_to_donations_ratio: number;
  
  // Engagement/Status
  total_calls: number;
  eligibility_status: 'eligible' | 'not eligible';
  status: boolean;
  donated_last_bridge_donation?: boolean;
  user_donation_active_status: 'active' | 'inactive';
  inactive_trigger_comment?: string;
}

// Extended mock data with more realistic entries
const mockDataset: BloodDonationUser[] = [
  {
    user_id: '27682366ac77',
    role: 'Emergency Donor',
    donor_type: 'One-Tim',
    role_status: true,
    bridge_status: false,
    blood_group: 'A Positiv',
    gender: 'Male',
    latitude: 17.332,
    longitude: 78.46,
    last_contact: '27:00.0',
    last_donation_date: '17-08-2025',
    next_eligible_date: '15-11-2025',
    donations_till_date: 3,
    cycle_of_donations: 90,
    frequency_in_days: 0,
    calls_to_donations_ratio: 0.33,
    total_calls: 3,
    eligibility_status: 'eligible',
    status: true,
    user_donation_active_status: 'active'
  },
  {
    user_id: '965f27',
    role: 'Bridge Donor',
    donor_type: 'Regular',
    role_status: true,
    bridge_status: true,
    blood_group: 'O Positiv',
    gender: 'Female',
    latitude: 17.388,
    longitude: 78.476,
    bridge_gender: 'Male',
    bridge_blood_group: 'O Positiv',
    quantity_required: 1,
    last_transfusion_date: '16-12-2025',
    expected_next_transfusion_date: '16-01-2026',
    last_contact: '09:38.0',
    last_donation_date: '01-05-2025',
    next_eligible_date: '30-07-2025',
    donations_till_date: 9,
    cycle_of_donations: 120,
    frequency_in_days: 5,
    calls_to_donations_ratio: 1,
    total_calls: 21,
    eligibility_status: 'eligible',
    status: true,
    donated_last_bridge_donation: true,
    user_donation_active_status: 'active'
  },
  {
    user_id: '20071c',
    role: 'Emergency Donor',
    donor_type: 'Regular',
    role_status: true,
    bridge_status: false,
    blood_group: 'B Positiv',
    gender: 'Male',
    latitude: 17.332,
    longitude: 78.46,
    last_contact: '28-07-2025',
    last_donation_date: '15-06-2025',
    next_eligible_date: '15-09-2025',
    donations_till_date: 1,
    cycle_of_donations: 1958,
    frequency_in_days: 20,
    calls_to_donations_ratio: 23,
    total_calls: 20,
    eligibility_status: 'not eligible',
    status: true,
    user_donation_active_status: 'inactive',
    inactive_trigger_comment: 'Inactive Very limited activity despite multiple calls'
  },
  {
    user_id: 'sample4',
    role: 'Bridge Donor',
    donor_type: 'Regular',
    role_status: true,
    bridge_status: true,
    blood_group: 'AB Positiv',
    gender: 'Female',
    latitude: 17.388,
    longitude: 78.476,
    bridge_gender: 'Female',
    bridge_blood_group: 'AB Positiv',
    quantity_required: 2,
    last_transfusion_date: '03-06-2025',
    expected_next_transfusion_date: '03-07-2025',
    last_contact: '15-08-2025',
    last_donation_date: '01-04-2025',
    next_eligible_date: '01-07-2025',
    donations_till_date: 23,
    cycle_of_donations: 90,
    frequency_in_days: 26,
    calls_to_donations_ratio: 0.14,
    total_calls: 26,
    eligibility_status: 'eligible',
    status: true,
    donated_last_bridge_donation: false,
    user_donation_active_status: 'active'
  },
  {
    user_id: 'sample5',
    role: 'Emergency Donor',
    donor_type: 'One-Tim',
    role_status: true,
    bridge_status: false,
    blood_group: 'O Negati',
    gender: 'Male',
    latitude: 17.332,
    longitude: 78.46,
    last_contact: '10-09-2025',
    last_donation_date: '20-07-2025',
    next_eligible_date: '20-10-2025',
    donations_till_date: 5,
    cycle_of_donations: 90,
    frequency_in_days: 15,
    calls_to_donations_ratio: 0.67,
    total_calls: 15,
    eligibility_status: 'eligible',
    status: true,
    user_donation_active_status: 'active'
  },
  {
    user_id: 'sample6',
    role: 'Fighter',
    donor_type: 'Regular',
    role_status: true,
    bridge_status: true,
    blood_group: 'A Negativ',
    gender: 'Female',
    latitude: 17.345,
    longitude: 78.489,
    bridge_gender: 'Male',
    bridge_blood_group: 'A Negativ',
    quantity_required: 1,
    last_transfusion_date: '20-11-2025',
    expected_next_transfusion_date: '20-12-2025',
    last_contact: '25-11-2025',
    last_donation_date: '15-10-2025',
    next_eligible_date: '15-01-2026',
    donations_till_date: 15,
    cycle_of_donations: 60,
    frequency_in_days: 10,
    calls_to_donations_ratio: 0.8,
    total_calls: 18,
    eligibility_status: 'eligible',
    status: true,
    donated_last_bridge_donation: true,
    user_donation_active_status: 'active'
  }
];

type SortField = keyof BloodDonationUser;
type SortDirection = 'asc' | 'desc';

export default function DataTable() {
  const [data, setData] = useState<BloodDonationUser[]>(mockDataset);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('user_id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter(user => 
      user.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.blood_group.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.gender.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [data, searchTerm, sortField, sortDirection]);

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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Blood Donation Dataset</h1>
        <Badge variant="outline" className="text-sm">
          Total Records: {data.length}
        </Badge>
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
                  placeholder="Search by ID, role, blood group, or gender..."
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

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Dataset Records</CardTitle>
        </CardHeader>
        <CardContent>
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
                  <th 
                    className="px-6 py-3 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('role')}
                  >
                    <div className="flex items-center gap-1">
                      Role
                      {sortField === 'role' && (
                        sortDirection === 'asc' ? 
                          <ChevronUpIcon className="h-4 w-4" /> : 
                          <ChevronDownIcon className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3">Donor Type</th>
                  <th className="px-6 py-3">Blood Group</th>
                  <th className="px-6 py-3">Gender</th>
                  <th className="px-6 py-3">Donations</th>
                  <th className="px-6 py-3">Calls/Donations</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Bridge Status</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((user, index) => (
                  <tr key={user.user_id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono text-xs">{user.user_id}</td>
                    <td className="px-6 py-4">
                      <Badge variant="outline">{user.role}</Badge>
                    </td>
                    <td className="px-6 py-4">{user.donor_type}</td>
                    <td className="px-6 py-4">
                      <Badge className="bg-red-100 text-red-800">{user.blood_group}</Badge>
                    </td>
                    <td className="px-6 py-4">{user.gender}</td>
                    <td className="px-6 py-4 font-medium">{user.donations_till_date}</td>
                    <td className="px-6 py-4">{user.calls_to_donations_ratio.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      {getStatusBadge(user.user_donation_active_status)}
                    </td>
                    <td className="px-6 py-4">
                      {user.bridge_status ? (
                        <Badge className="bg-green-100 text-green-800">Bridge</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">No Bridge</Badge>
                      )}
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
