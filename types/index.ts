export interface User {
  id: string;
  name: string;
  gender: 'Male' | 'Female' | 'Other';
  mobile: string;
  dateOfBirth: string;
  bloodGroup: BloodGroup;
  city: string;
  role: UserRole;
  latitude?: number;
  longitude?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Bridge {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
  donorCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Donation {
  id: string;
  userId: string;
  bridgeId: string;
  donationDate: string;
  donationType: DonationType;
  status: DonationStatus;
  nextEligibleDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BridgeFighterInfo {
  id: string;
  bridgeId: string;
  userId: string;
  bloodGroup: BloodGroup;
  donationFrequency: number; // in days
  lastDonationDate: string;
  nextDonationDate: string;
  isActive: boolean;
}

export interface EmergencyRequest {
  id: string;
  requesterName: string;
  requesterContact: string;
  bloodGroup: BloodGroup;
  units: number;
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  location: string;
  latitude: number;
  longitude: number;
  status: 'Pending' | 'Matched' | 'Completed' | 'Cancelled';
  matchedDonors?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DonorMatch {
  userId: string;
  userName: string;
  bloodGroup: BloodGroup;
  distance: number; // in km
  lastDonationDate: string;
  nextEligibleDate: string;
  contactNumber: string;
  matchScore: number; // 0-100
}

export interface Analytics {
  totalDonors: number;
  activeDonors: number;
  inactiveDonors: number;
  totalDonations: number;
  pendingDonations: number;
  completedDonations: number;
  rejectedDonations: number;
  bloodGroupDistribution: Record<BloodGroup, number>;
  cityDistribution: Record<string, number>;
  genderDistribution: Record<string, number>;
  monthlyDonations: Array<{
    month: string;
    count: number;
  }>;
  bridgeStats: Array<{
    bridgeId: string;
    bridgeName: string;
    activeDonors: number;
    totalDonations: number;
  }>;
}

export interface ChatMessage {
  id: string;
  userId: string;
  message: string;
  isUser: boolean;
  timestamp: string;
  attachments?: string[];
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
}

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type UserRole = 'Bridge Donor' | 'Emergency Donor' | 'Fighter' | 'Admin' | 'Coordinator';

export type DonationType = 'Blood Bridge Donation' | 'Voluntary Donation' | 'Emergency Donation';

export type DonationStatus = 'Pending' | 'Complete' | 'Rejected' | 'Cancelled';

export interface DashboardStats {
  totalUsers: number;
  activeBridges: number;
  emergencyRequests: number;
  pendingDonations: number;
  bloodAvailability: Record<BloodGroup, number>;
}

export interface SearchFilters {
  bloodGroup?: BloodGroup;
  city?: string;
  role?: UserRole;
  status?: 'active' | 'inactive';
  dateRange?: {
    start: string;
    end: string;
  };
}
