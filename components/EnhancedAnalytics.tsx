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
  ZAxis,
  AreaChart,
  Area
} from 'recharts';
import { getComprehensiveDataset, EnhancedUser } from '@/lib/comprehensiveData';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B6B'];

export default function EnhancedAnalytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = () => {
      const comprehensiveData = getComprehensiveDataset();
      setData(comprehensiveData);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-lg">Loading comprehensive analytics...</div>
      </div>
    );
  }

  const { users, patterns, summary } = data;

  // Prepare chart data for donation metrics analysis
  const donationMetricsData = users.map(user => ({
    user_id: user.user_id,
    donations_till_date: user.donations_till_date,
    cycle_of_donations: user.cycle_of_donations,
    frequency_in_days: user.frequency_in_days,
    calls_to_donations_ratio: user.calls_to_donations_ratio,
    role: user.role,
    blood_group: user.blood_group,
    city: user.city,
    eligibility_status: user.eligibility_status,
    active_status: user.user_donation_active_status
  }));

  const roleAnalysisData = Object.entries(patterns.byRole).map(([role, data]) => ({
    role,
    total: data.total,
    avgDonations: data.avgDonations,
    avgFrequency: data.avgFrequency,
    avgCallsRatio: data.avgCallsRatio
  }));

  const bloodGroupAnalysisData = Object.entries(patterns.byBloodGroup).map(([bg, data]) => ({
    blood_group: bg,
    total: data.total,
    avgDonations: data.avgDonations,
    avgFrequency: data.avgFrequency
  }));

  const cityAnalysisData = Object.entries(patterns.byCity).map(([city, data]) => ({
    city,
    total: data.total,
    avgDonations: data.avgDonations,
    activeUsers: data.activeUsers
  }));

  const frequencyAnalysisData = Object.entries(patterns.byFrequency).map(([freq, data]) => ({
    frequency: `${freq} days`,
    total: data.total,
    avgDonations: data.avgDonations
  }));

  // Time-based analysis for last_donation_date and next_eligible_date
  const timeAnalysisData = users.reduce((acc, user) => {
    if (user.last_donation_date) {
      const monthsAgo = Math.floor((new Date().getTime() - new Date(user.last_donation_date).getTime()) / (1000 * 60 * 60 * 24 * 30));
      const key = monthsAgo <= 1 ? 'Last Month' : monthsAgo <= 3 ? '1-3 Months' : monthsAgo <= 6 ? '3-6 Months' : '6+ Months';
      acc[key] = (acc[key] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const timeAnalysisChartData = Object.entries(timeAnalysisData).map(([period, count]) => ({
    period,
    count
  }));

  // Eligibility timeline analysis
  const eligibilityTimelineData = users.reduce((acc, user) => {
    if (user.next_eligible_date) {
      const daysUntilEligible = Math.floor((new Date(user.next_eligible_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      const key = daysUntilEligible <= 0 ? 'Eligible Now' : daysUntilEligible <= 30 ? 'Within 30 days' : daysUntilEligible <= 90 ? '30-90 days' : '90+ days';
      acc[key] = (acc[key] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const eligibilityTimelineChartData = Object.entries(eligibilityTimelineData).map(([period, count]) => ({
    period,
    count
  }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Comprehensive Donation Analytics</h1>
        <Badge variant="outline" className="text-sm">
          Total Users: {summary.totalUsers}
        </Badge>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalDonations}</div>
            <p className="text-xs text-muted-foreground">
              Avg: {summary.avgDonationsPerUser.toFixed(1)} per user
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              {((summary.activeUsers / summary.totalUsers) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eligible Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.eligibleUsers}</div>
            <p className="text-xs text-muted-foreground">
              {((summary.eligibleUsers / summary.totalUsers) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Calls/Donations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.avgCallsToDonationsRatio.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Lower is better
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="donation-metrics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="donation-metrics">Donation Metrics</TabsTrigger>
          <TabsTrigger value="role-analysis">Role Analysis</TabsTrigger>
          <TabsTrigger value="time-analysis">Time Analysis</TabsTrigger>
          <TabsTrigger value="eligibility">Eligibility</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
        </TabsList>

        <TabsContent value="donation-metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Donations vs Frequency Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="donations_till_date" name="Total Donations" />
                    <YAxis dataKey="frequency_in_days" name="Frequency (days)" />
                    <ZAxis dataKey="calls_to_donations_ratio" range={[50, 400]} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter data={donationMetricsData} fill="#8884d8">
                      {donationMetricsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.active_status === 'active' ? '#00C49F' : '#FF8042'} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Calls to Donations Ratio Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={donationMetricsData}>
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
              <CardTitle>Donation Cycle Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={donationMetricsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="donations_till_date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="cycle_of_donations" stackId="1" stroke="#8884d8" fill="#8884d8" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="role-analysis" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Role Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={roleAnalysisData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="role" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avgDonations" fill="#8884d8" name="Avg Donations" />
                    <Bar dataKey="avgFrequency" fill="#82CA9D" name="Avg Frequency (days)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Role Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={roleAnalysisData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ role, total }) => `${role} ${total}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="total"
                    >
                      {roleAnalysisData.map((entry, index) => (
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
              <CardTitle>Role Efficiency Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {roleAnalysisData.map((role) => (
                  <div key={role.role} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{role.role}</span>
                      <span>Avg Calls/Donations: {role.avgCallsRatio.toFixed(2)}</span>
                    </div>
                    <Progress value={(role.avgCallsRatio / 5) * 100} className="h-2" />
                    <div className="text-xs text-muted-foreground">
                      {role.total} users | Avg {role.avgDonations.toFixed(1)} donations | {role.avgFrequency.toFixed(0)} days frequency
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time-analysis" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Last Donation Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={timeAnalysisChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ period, count }) => `${period} ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {timeAnalysisChartData.map((entry, index) => (
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
                <CardTitle>Blood Group Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={bloodGroupAnalysisData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="blood_group" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="avgDonations" fill="#00C49F" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Geographic Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={cityAnalysisData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="city" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" fill="#8884d8" name="Total Users" />
                  <Bar dataKey="activeUsers" fill="#00C49F" name="Active Users" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="eligibility" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Eligibility Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={eligibilityTimelineChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ period, count }) => `${period} ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {eligibilityTimelineChartData.map((entry, index) => (
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
                <CardTitle>Frequency Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={frequencyAnalysisData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="frequency" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total" fill="#FFBB28" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Eligibility Status Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{patterns.eligibilityAnalysis.eligible}</div>
                  <div className="text-sm text-gray-600">Eligible Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{patterns.eligibilityAnalysis.notEligible}</div>
                  <div className="text-sm text-gray-600">Not Eligible</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{patterns.eligibilityAnalysis.active}</div>
                  <div className="text-sm text-gray-600">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{patterns.eligibilityAnalysis.inactive}</div>
                  <div className="text-sm text-gray-600">Inactive Users</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Donation Patterns by Blood Group</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={bloodGroupAnalysisData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="blood_group" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avgDonations" fill="#8884d8" name="Avg Donations" />
                    <Bar dataKey="avgFrequency" fill="#82CA9D" name="Avg Frequency" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>City-wise Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={cityAnalysisData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="city" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="total" stroke="#8884d8" name="Total Users" />
                    <Line type="monotone" dataKey="activeUsers" stroke="#00C49F" name="Active Users" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Key Insights Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-lg font-semibold text-blue-600">Most Active Role</div>
                    <div className="text-2xl font-bold">
                      {roleAnalysisData.sort((a, b) => b.avgDonations - a.avgDonations)[0]?.role}
                    </div>
                    <div className="text-sm text-gray-600">
                      {roleAnalysisData.sort((a, b) => b.avgDonations - a.avgDonations)[0]?.avgDonations.toFixed(1)} avg donations
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-lg font-semibold text-green-600">Most Efficient</div>
                    <div className="text-2xl font-bold">
                      {roleAnalysisData.sort((a, b) => a.avgCallsRatio - b.avgCallsRatio)[0]?.role}
                    </div>
                    <div className="text-sm text-gray-600">
                      {roleAnalysisData.sort((a, b) => a.avgCallsRatio - b.avgCallsRatio)[0]?.avgCallsRatio.toFixed(2)} calls/donation
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-lg font-semibold text-purple-600">Top City</div>
                    <div className="text-2xl font-bold">
                      {cityAnalysisData.sort((a, b) => b.activeUsers - a.activeUsers)[0]?.city}
                    </div>
                    <div className="text-sm text-gray-600">
                      {cityAnalysisData.sort((a, b) => b.activeUsers - a.activeUsers)[0]?.activeUsers} active users
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
