import { 
  User, 
  EmergencyRequest, 
  DonationTracker, 
  BridgeFighterInfo,
  DashboardStats,
  Analytics,
  ApiResponse,
  PaginatedResponse 
} from '@/types';

const API_BASE = '/api';

// Generic API call function
async function apiCall<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// User API functions
export const userApi = {
  // Get all users with optional filters
  getUsers: async (params?: {
    role?: string;
    bloodGroup?: string;
    city?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginatedResponse<User>>> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    return apiCall<PaginatedResponse<User>>(
      `/users?${searchParams.toString()}`
    );
  },

  // Get user by ID
  getUser: async (userId: string): Promise<ApiResponse<User>> => {
    return apiCall<User>(`/users/${userId}`);
  },

  // Create new user
  createUser: async (userData: Partial<User>): Promise<ApiResponse<User>> => {
    return apiCall<User>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Update user
  updateUser: async (userId: string, userData: Partial<User>): Promise<ApiResponse<User>> => {
    return apiCall<User>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  // Delete user
  deleteUser: async (userId: string): Promise<ApiResponse<void>> => {
    return apiCall<void>(`/users/${userId}`, {
      method: 'DELETE',
    });
  },
};

// Emergency Request API functions
export const emergencyApi = {
  // Get all emergency requests
  getRequests: async (params?: {
    status?: string;
    urgencyLevel?: string;
    bloodGroup?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginatedResponse<EmergencyRequest>>> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    return apiCall<PaginatedResponse<EmergencyRequest>>(
      `/emergency?${searchParams.toString()}`
    );
  },

  // Create emergency request
  createRequest: async (requestData: Partial<EmergencyRequest>): Promise<ApiResponse<EmergencyRequest>> => {
    return apiCall<EmergencyRequest>('/emergency', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  },

  // Update emergency request
  updateRequest: async (requestId: string, requestData: Partial<EmergencyRequest>): Promise<ApiResponse<EmergencyRequest>> => {
    return apiCall<EmergencyRequest>(`/emergency/${requestId}`, {
      method: 'PUT',
      body: JSON.stringify(requestData),
    });
  },

  // Respond to emergency request
  respondToRequest: async (requestId: string, responseData: {
    message?: string;
    status: string;
  }): Promise<ApiResponse<void>> => {
    return apiCall<void>(`/emergency/${requestId}/respond`, {
      method: 'POST',
      body: JSON.stringify(responseData),
    });
  },
};

// Donations API functions
export const donationApi = {
  // Get all donations
  getDonations: async (params?: {
    userId?: string;
    status?: string;
    bridgeId?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginatedResponse<DonationTracker>>> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    return apiCall<PaginatedResponse<DonationTracker>>(
      `/donations?${searchParams.toString()}`
    );
  },

  // Create donation record
  createDonation: async (donationData: Partial<DonationTracker>): Promise<ApiResponse<DonationTracker>> => {
    return apiCall<DonationTracker>('/donations', {
      method: 'POST',
      body: JSON.stringify(donationData),
    });
  },

  // Update donation record
  updateDonation: async (donationId: number, donationData: Partial<DonationTracker>): Promise<ApiResponse<DonationTracker>> => {
    return apiCall<DonationTracker>(`/donations/${donationId}`, {
      method: 'PUT',
      body: JSON.stringify(donationData),
    });
  },
};

// Analytics API functions
export const analyticsApi = {
  // Get dashboard statistics
  getDashboardStats: async (): Promise<ApiResponse<DashboardStats>> => {
    return apiCall<DashboardStats>('/analytics/dashboard');
  },

  // Get detailed analytics
  getAnalytics: async (params?: {
    startDate?: string;
    endDate?: string;
    city?: string;
  }): Promise<ApiResponse<Analytics>> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    return apiCall<Analytics>(`/analytics?${searchParams.toString()}`);
  },

  // Get blood group distribution
  getBloodGroupStats: async (): Promise<ApiResponse<Array<{
    bloodGroup: string;
    count: number;
  }>>> => {
    return apiCall('/analytics/blood-groups');
  },

  // Get city-wise statistics
  getCityStats: async (): Promise<ApiResponse<Array<{
    city: string;
    donors: number;
    requests: number;
  }>>> => {
    return apiCall('/analytics/cities');
  },
};

// Health check
export const healthApi = {
  check: async (): Promise<ApiResponse<{ status: string; timestamp: string }>> => {
    return apiCall('/health');
  },
};

// Export all APIs
export const api = {
  users: userApi,
  emergency: emergencyApi,
  donations: donationApi,
  analytics: analyticsApi,
  health: healthApi,
};

export default api;
