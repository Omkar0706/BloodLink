// Database types matching our Prisma schema
export interface User {
  id: string;
  userId: string;
  name: string;
  gender: string;
  mobile: string;
  dateOfBirth: Date;
  bloodGroup: string;
  city: string;
  pincode: number;
  role: string;
  insertTime: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface BridgeFighterInfo {
  id: number;
  bridgeId: string;
  bridgeName: string;
  userId: string;
  bloodGroup: string;
  frequencyInDays: string;
  noUnits: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
}

export interface BridgeUserMapping {
  id: number;
  bridgeId: string;
  userId: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  bridgeFighterInfo?: BridgeFighterInfo;
}

export interface DonationTracker {
  id: number;
  userId: string;
  donationDate: Date;
  nextEligibleDate: Date;
  donationType: string;
  bridgeId: string;
  donationStatus: string;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  bridgeFighterInfo?: BridgeFighterInfo;
}

export interface EmergencyRequest {
  id: string;
  requesterId: string;
  patientName: string;
  bloodGroup: string;
  unitsRequired: number;
  urgencyLevel: string;
  location: string;
  contactNumber: string;
  hospitalName?: string;
  status: string;
  description?: string;
  requiredBy: Date;
  createdAt: Date;
  updatedAt: Date;
  requester?: User;
}

export interface RequestResponse {
  id: string;
  requestId: string;
  responderId: string;
  status: string;
  message?: string;
  createdAt: Date;
  updatedAt: Date;
  request?: EmergencyRequest;
  responder?: User;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
}

// Frontend specific types
export interface DonorMatch {
  user: User;
  distance: number;
  lastDonation?: DonationTracker;
  isEligible: boolean;
  compatibilityScore: number;
  matchScore?: number;
}
export interface DashboardStats {
  totalUsers: number;
  totalDonors: number;
  emergencyDonors: number;
  bridgeDonors: number;
  fighters: number;
  activeBridges: number;
  emergencyRequests: number;
  pendingDonations: number;
  completedDonations: number;
  totalDonations: number;
}

export interface Analytics {
  totalDonations: number;
  activeUsers: number;
  emergencyRequests: number;
  successRate: number;
  averageResponseTime: number;
  monthlyDonations: Array<{
    month: string;
    donations: number;
  }>;
  bloodGroupDistribution: Array<{
    bloodGroup: string;
    count: number;
  }>;
  cityWiseStats: Array<{
    city: string;
    donors: number;
    requests: number;
  }>;
}

// Form types for creating/editing
export interface CreateUserForm {
  name: string;
  gender: string;
  mobile: string;
  dateOfBirth: string;
  bloodGroup: string;
  city: string;
  pincode: number;
  role: string;
}

export interface CreateEmergencyRequestForm {
  patientName: string;
  bloodGroup: string;
  unitsRequired: number;
  urgencyLevel: string;
  location: string;
  contactNumber: string;
  hospitalName?: string;
  description?: string;
  requiredBy: string;
}

export interface UpdateUserForm extends Partial<CreateUserForm> {
  userId: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
