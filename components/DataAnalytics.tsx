'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';

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

// Mock data based on the dataset structure
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
  }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B6B'];

export default function DataAnalytics() {
  const [data, setData] = useState<BloodDonationUser[]>(mockDataset);

  // Calculate insights
  const roleDistribution = data.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const bloodGroupDistribution = data.reduce((acc, user) => {
    acc[user.blood_group] = (acc[user.blood_group] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const activeInactiveDistribution = data.reduce((acc, user) => {
    acc[user.user_donation_active_status] = (acc[user.user_donation_active_status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const averageDonationsPerRole = data.reduce((acc, user) => {
    if (!acc[user.role]) {
      acc[user.role] = { total: 0, count: 0 };
    }
    acc[user.role].total += user.donations_till_date;
    acc[user.role].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  const averageCallsToDonationsRatio = data.reduce((sum, user) => sum + user.calls_to_donations_ratio, 0) / data.length;

  const bridgePatients = data.filter(user => user.bridge_status && user.bridge_blood_group);
  const bridgeBloodGroupDistribution = bridgePatients.reduce((acc, user) => {
    if (user.bridge_blood_group) {
      acc[user.bridge_blood_group] = (acc[user.bridge_blood_group] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Prepare chart data
  const roleChartData = Object.entries(roleDistribution).map(([role, count]) => ({
    role,
    count,
    percentage: (count / data.length * 100).toFixed(1)
  }));

  const bloodGroupChartData = Object.entries(bloodGroupDistribution).map(([group, count]) => ({
    group,
    count
  }));

  const averageDonationsChartData = Object.entries(averageDonationsPerRole).map(([role, stats]) => ({
    role,
    average: (stats.total / stats.count).toFixed(1)
  }));

  const geospatialData = data.map(user => ({
    x: user.longitude,
    y: user.latitude,
    z: user.donations_till_date,
    role: user.role,
    bloodGroup: user.blood_group,
    active: user.user_donation_active_status === 'active'
  }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Blood Donation Analytics</h1>
        <Badge variant="outline" className="text-sm">
          Total Users: {data.length}
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="roles">Role Analysis</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="geospatial">Geospatial</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.length}</div>
                <p className="text-xs text-muted-foreground">
                  Active: {activeInactiveDistribution.active || 0} | Inactive: {activeInactiveDistribution.inactive || 0}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bridge Patients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{bridgePatients.length}</div>
                <p className="text-xs text-muted-foreground">
                  {((bridgePatients.length / data.length) * 100).toFixed(1)}% of total users
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Calls/Donations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{averageCallsToDonationsRatio.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  Lower is better
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.reduce((sum, user) => sum + user.donations_till_date, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all users
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Blood Group Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={bloodGroupChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ group, percentage }) => `${group} ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {bloodGroupChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Role Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={roleChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="role" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Average Donations per Role</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={averageDonationsChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="role" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="average" fill="#00C49F" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bridge Patients Blood Groups</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(bridgeBloodGroupDistribution).map(([group, count]) => ({ group, count }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ group, percentage }) => `${group} ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {Object.entries(bridgeBloodGroupDistribution).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Role Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(averageDonationsPerRole).map(([role, stats]) => (
                  <div key={role} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{role}</span>
                      <span>{(stats.total / stats.count).toFixed(1)} avg donations</span>
                    </div>
                    <Progress value={(stats.total / stats.count) / 25 * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(activeInactiveDistribution).map(([status, count]) => ({ status, count }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ status, percentage }) => `${status} ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {Object.entries(activeInactiveDistribution).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry[0] === 'active' ? '#00C49F' : '#FF8042'} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Calls to Donations Ratio by Role</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="role" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="calls_to_donations_ratio" fill="#FFBB28" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Donation Frequency Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="donations_till_date" name="Total Donations" />
                  <YAxis dataKey="frequency_in_days" name="Frequency (days)" />
                  <ZAxis dataKey="calls_to_donations_ratio" range={[50, 400]} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter data={data} fill="#8884d8" />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geospatial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Geospatial Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="x" name="Longitude" />
                  <YAxis dataKey="y" name="Latitude" />
                  <ZAxis dataKey="z" range={[50, 400]} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter data={geospatialData} fill="#8884d8">
                    {geospatialData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.active ? '#00C49F' : '#FF8042'} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Location Clusters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">Identified clusters</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>High Demand Areas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
                <p className="text-xs text-muted-foreground">Areas with bridge patients</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Coverage Gap</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1</div>
                <p className="text-xs text-muted-foreground">Areas needing donors</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
