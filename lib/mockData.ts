import { User, Bridge, Donation, EmergencyRequest, Analytics, DashboardStats } from '@/types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Priya Sharma',
    gender: 'Female',
    mobile: '9876543210',
    dateOfBirth: '1990-05-15',
    bloodGroup: 'B-',
    city: 'Mumbai',
    role: 'Bridge Donor',
    latitude: 19.0170 + 0.02, // Near Lilavati Hospital
    longitude: 72.8477 + 0.02,
    isActive: true,
    createdAt: '2023-01-15T10:00:00Z',
    updatedAt: '2023-12-01T10:00:00Z'
  },
  {
    id: '2',
    name: 'Rahul Kumar',
    gender: 'Male',
    mobile: '8765432109',
    dateOfBirth: '1985-08-22',
    bloodGroup: 'A+',
    city: 'Mumbai',
    role: 'Emergency Donor',
    latitude: 19.0170 - 0.03, // Near Lilavati Hospital
    longitude: 72.8477 - 0.03,
    isActive: true,
    createdAt: '2023-02-10T10:00:00Z',
    updatedAt: '2023-12-01T10:00:00Z'
  },
  {
    id: '3',
    name: 'Anjali Patel',
    gender: 'Female',
    mobile: '7654321098',
    dateOfBirth: '1992-12-03',
    bloodGroup: 'O+',
    city: 'Mumbai',
    role: 'Fighter',
    latitude: 19.0170 + 0.05, // Near Lilavati Hospital
    longitude: 72.8477 + 0.05,
    isActive: true,
    createdAt: '2023-03-05T10:00:00Z',
    updatedAt: '2023-12-01T10:00:00Z'
  },
  {
    id: '4',
    name: 'Vikram Singh',
    gender: 'Male',
    mobile: '6543210987',
    dateOfBirth: '1988-03-18',
    bloodGroup: 'AB+',
    city: 'Kolkata',
    role: 'Bridge Donor',
    latitude: 22.5726,
    longitude: 88.3639,
    isActive: false,
    createdAt: '2023-04-12T10:00:00Z',
    updatedAt: '2023-12-01T10:00:00Z'
  },
  {
    id: '5',
    name: 'Meera Reddy',
    gender: 'Female',
    mobile: '5432109876',
    dateOfBirth: '1995-07-25',
    bloodGroup: 'A-',
    city: 'Delhi',
    role: 'Emergency Donor',
    latitude: 28.7041,
    longitude: 77.1025,
    isActive: true,
    createdAt: '2023-05-20T10:00:00Z',
    updatedAt: '2023-12-01T10:00:00Z'
  }
];

export const mockBridges: Bridge[] = [
  {
    id: 'bridge-1',
    name: 'Bandra West Bridge',
    location: 'Bandra West, Mumbai',
    latitude: 19.0170 + 0.01,
    longitude: 72.8477 + 0.01,
    isActive: true,
    donorCount: 15,
    createdAt: '2023-01-01T10:00:00Z',
    updatedAt: '2023-12-01T10:00:00Z'
  },
  {
    id: 'bridge-2',
    name: 'Pune Station Bridge',
    location: 'Pune Station, Pune',
    latitude: 18.5204,
    longitude: 73.8567,
    isActive: true,
    donorCount: 12,
    createdAt: '2023-01-15T10:00:00Z',
    updatedAt: '2023-12-01T10:00:00Z'
  },
  {
    id: 'bridge-3',
    name: 'Hyderabad Central Bridge',
    location: 'Hyderabad Central, Hyderabad',
    latitude: 17.3850,
    longitude: 78.4867,
    isActive: false,
    donorCount: 8,
    createdAt: '2023-02-01T10:00:00Z',
    updatedAt: '2023-12-01T10:00:00Z'
  }
];

export const mockDonations: Donation[] = [
  {
    id: 'donation-1',
    userId: '1',
    bridgeId: 'bridge-1',
    donationDate: '2023-11-15T10:00:00Z',
    donationType: 'Blood Bridge Donation',
    status: 'Complete',
    nextEligibleDate: '2024-01-10T10:00:00Z',
    notes: 'Regular donation',
    createdAt: '2023-11-15T10:00:00Z',
    updatedAt: '2023-11-15T10:00:00Z'
  },
  {
    id: 'donation-2',
    userId: '2',
    bridgeId: 'bridge-2',
    donationDate: '2023-11-20T10:00:00Z',
    donationType: 'Emergency Donation',
    status: 'Complete',
    nextEligibleDate: '2024-01-15T10:00:00Z',
    notes: 'Emergency request fulfilled',
    createdAt: '2023-11-20T10:00:00Z',
    updatedAt: '2023-11-20T10:00:00Z'
  },
  {
    id: 'donation-3',
    userId: '3',
    bridgeId: 'bridge-3',
    donationDate: '2023-11-25T10:00:00Z',
    donationType: 'Voluntary Donation',
    status: 'Pending',
    nextEligibleDate: '2024-01-20T10:00:00Z',
    notes: 'Pending approval',
    createdAt: '2023-11-25T10:00:00Z',
    updatedAt: '2023-11-25T10:00:00Z'
  }
];

export const mockEmergencyRequests: EmergencyRequest[] = [
  {
    id: 'emergency-1',
    requesterName: 'City Hospital',
    requesterContact: '022-12345678',
    bloodGroup: 'A+',
    units: 2,
    urgency: 'Critical',
    location: 'Mumbai Central Hospital',
    latitude: 19.0760,
    longitude: 72.8777,
    status: 'Matched',
    matchedDonors: ['2'],
    createdAt: '2023-12-01T08:00:00Z',
    updatedAt: '2023-12-01T08:30:00Z'
  },
  {
    id: 'emergency-2',
    requesterName: 'General Hospital',
    requesterContact: '020-87654321',
    bloodGroup: 'O+',
    units: 1,
    urgency: 'High',
    location: 'Pune General Hospital',
    latitude: 18.5204,
    longitude: 73.8567,
    status: 'Pending',
    createdAt: '2023-12-01T09:00:00Z',
    updatedAt: '2023-12-01T09:00:00Z'
  }
];

export const mockAnalytics: Analytics = {
  totalDonors: 200,
  activeDonors: 135,
  inactiveDonors: 65,
  totalDonations: 150,
  pendingDonations: 25,
  completedDonations: 120,
  rejectedDonations: 5,
  bloodGroupDistribution: {
    'A+': 28,
    'A-': 28,
    'B+': 26,
    'B-': 32,
    'AB+': 18,
    'AB-': 22,
    'O+': 26,
    'O-': 20
  },
  cityDistribution: {
    'Mumbai': 35,
    'Pune': 30,
    'Hyderabad': 27,
    'Kolkata': 27,
    'Delhi': 24,
    'Chennai': 20,
    'Bangalore': 18,
    'Ahmedabad': 19
  },
  genderDistribution: {
    'Female': 71,
    'Male': 64,
    'Other': 65
  },
  monthlyDonations: [
    { month: 'Jan', count: 12 },
    { month: 'Feb', count: 15 },
    { month: 'Mar', count: 18 },
    { month: 'Apr', count: 14 },
    { month: 'May', count: 16 },
    { month: 'Jun', count: 20 },
    { month: 'Jul', count: 22 },
    { month: 'Aug', count: 19 },
    { month: 'Sep', count: 17 },
    { month: 'Oct', count: 21 },
    { month: 'Nov', count: 25 },
    { month: 'Dec', count: 23 }
  ],
  bridgeStats: [
    {
      bridgeId: 'bridge-1',
      bridgeName: 'Mumbai Central Bridge',
      activeDonors: 15,
      totalDonations: 45
    },
    {
      bridgeId: 'bridge-2',
      bridgeName: 'Pune Station Bridge',
      activeDonors: 12,
      totalDonations: 38
    },
    {
      bridgeId: 'bridge-3',
      bridgeName: 'Hyderabad Central Bridge',
      activeDonors: 8,
      totalDonations: 25
    }
  ]
};

export const mockDashboardStats: DashboardStats = {
  totalUsers: 200,
  activeBridges: 2,
  emergencyRequests: 5,
  pendingDonations: 25,
  bloodAvailability: {
    'A+': 15,
    'A-': 12,
    'B+': 18,
    'B-': 20,
    'AB+': 8,
    'AB-': 10,
    'O+': 22,
    'O-': 16
  }
};
