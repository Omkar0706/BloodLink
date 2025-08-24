import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { 
  User, 
  EmergencyRequest, 
  DonationTracker, 
  DashboardStats,
  Analytics,
  ApiResponse,
  PaginatedResponse 
} from '@/types';

// Generic hook for API calls with loading states
export function useApiCall<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      
      if (result.success && result.data) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to fetch data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
}

// Hook for dashboard statistics
export function useDashboardStats() {
  return useApiCall(() => api.analytics.getDashboardStats());
}

// Hook for users with pagination and filtering
export function useUsers(params?: {
  role?: string;
  bloodGroup?: string;
  city?: string;
  page?: number;
  limit?: number;
}) {
  return useApiCall(
    () => api.users.getUsers(params),
    [params?.role, params?.bloodGroup, params?.city, params?.page, params?.limit]
  );
}

// Hook for a single user
export function useUser(userId: string) {
  return useApiCall(
    () => api.users.getUser(userId),
    [userId]
  );
}

// Hook for emergency requests
export function useEmergencyRequests(params?: {
  status?: string;
  urgencyLevel?: string;
  bloodGroup?: string;
  page?: number;
  limit?: number;
}) {
  return useApiCall(
    () => api.emergency.getRequests(params),
    [params?.status, params?.urgencyLevel, params?.bloodGroup, params?.page, params?.limit]
  );
}

// Hook for donations
export function useDonations(params?: {
  userId?: string;
  status?: string;
  bridgeId?: string;
  page?: number;
  limit?: number;
}) {
  return useApiCall(
    () => api.donations.getDonations(params),
    [params?.userId, params?.status, params?.bridgeId, params?.page, params?.limit]
  );
}

// Hook for analytics
export function useAnalytics(params?: {
  startDate?: string;
  endDate?: string;
  city?: string;
}) {
  return useApiCall(
    () => api.analytics.getAnalytics(params),
    [params?.startDate, params?.endDate, params?.city]
  );
}

// Hook for blood group statistics
export function useBloodGroupStats() {
  return useApiCall(() => api.analytics.getBloodGroupStats());
}

// Hook for city statistics
export function useCityStats() {
  return useApiCall(() => api.analytics.getCityStats());
}

// Hook for health check
export function useHealthCheck() {
  return useApiCall(() => api.health.check());
}

// Hook for creating/updating data with optimistic updates
export function useMutation<T, U>(
  mutationFn: (data: U) => Promise<ApiResponse<T>>,
  onSuccess?: (data: T) => void,
  onError?: (error: string) => void
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (data: U) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await mutationFn(data);
      
      if (result.success && result.data) {
        onSuccess?.(result.data);
        return result.data;
      } else {
        const errorMsg = result.error || 'Mutation failed';
        setError(errorMsg);
        onError?.(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      onError?.(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
}

// Specific mutation hooks
export function useCreateUser(
  onSuccess?: (user: User) => void,
  onError?: (error: string) => void
) {
  return useMutation(
    (userData: Partial<User>) => api.users.createUser(userData),
    onSuccess,
    onError
  );
}

export function useUpdateUser(
  onSuccess?: (user: User) => void,
  onError?: (error: string) => void
) {
  return useMutation(
    ({ userId, ...userData }: { userId: string } & Partial<User>) => 
      api.users.updateUser(userId, userData),
    onSuccess,
    onError
  );
}

export function useCreateEmergencyRequest(
  onSuccess?: (request: EmergencyRequest) => void,
  onError?: (error: string) => void
) {
  return useMutation(
    (requestData: Partial<EmergencyRequest>) => api.emergency.createRequest(requestData),
    onSuccess,
    onError
  );
}

export function useCreateDonation(
  onSuccess?: (donation: DonationTracker) => void,
  onError?: (error: string) => void
) {
  return useMutation(
    (donationData: Partial<DonationTracker>) => api.donations.createDonation(donationData),
    onSuccess,
    onError
  );
}
