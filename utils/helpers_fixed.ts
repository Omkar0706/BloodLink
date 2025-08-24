import { User, DonationTracker, EmergencyRequest, DonorMatch } from '@/types';

export const calculateAge = (dateOfBirth: Date): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

export const getBloodGroupColor = (bloodGroup: string): string => {
  const colors: Record<string, string> = {
    'A+': 'bg-red-100 text-red-800',
    'A-': 'bg-red-200 text-red-900',
    'B+': 'bg-blue-100 text-blue-800',
    'B-': 'bg-blue-200 text-blue-900',
    'AB+': 'bg-purple-100 text-purple-800',
    'AB-': 'bg-purple-200 text-purple-900',
    'O+': 'bg-green-100 text-green-800',
    'O-': 'bg-green-200 text-green-900',
  };
  return colors[bloodGroup] || 'bg-gray-100 text-gray-800';
};

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'active': 'status-active',
    'inactive': 'status-inactive',
    'pending': 'status-pending',
    'completed': 'status-completed',
    'urgent': 'status-urgent',
  };
  return colors[status.toLowerCase()] || 'status-pending';
};

export const getUrgencyColor = (urgency: string): string => {
  const colors: Record<string, string> = {
    'low': 'status-active',
    'medium': 'status-pending',
    'high': 'status-urgent',
    'critical': 'status-urgent',
  };
  return colors[urgency.toLowerCase()] || 'status-pending';
};

// Blood compatibility checker
export const isCompatibleBloodGroup = (donorBlood: string, recipientBlood: string): boolean => {
  const compatibility: Record<string, string[]> = {
    'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], // Universal donor
    'O+': ['O+', 'A+', 'B+', 'AB+'],
    'A-': ['A-', 'A+', 'AB-', 'AB+'],
    'A+': ['A+', 'AB+'],
    'B-': ['B-', 'B+', 'AB-', 'AB+'],
    'B+': ['B+', 'AB+'],
    'AB-': ['AB-', 'AB+'],
    'AB+': ['AB+'], // Universal recipient (can only donate to AB+)
  };
  
  return compatibility[donorBlood]?.includes(recipientBlood) || false;
};

// Check if donor is eligible to donate (not donated in last 56 days)
export const isDonorEligible = (lastDonationDate?: Date): boolean => {
  if (!lastDonationDate) return true;
  
  const daysSinceLastDonation = Math.floor(
    (Date.now() - new Date(lastDonationDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  
  return daysSinceLastDonation >= 56; // 8 weeks minimum gap
};

// Calculate compatibility score for donor matching
export const calculateCompatibilityScore = (
  donorBloodGroup: string,
  requiredBloodGroup: string,
  distance: number,
  isEligible: boolean
): number => {
  let score = 0;
  
  // Blood compatibility (40 points)
  if (isCompatibleBloodGroup(donorBloodGroup, requiredBloodGroup)) {
    score += 40;
    // Exact match gets bonus
    if (donorBloodGroup === requiredBloodGroup) {
      score += 10;
    }
  }
  
  // Distance factor (30 points max)
  if (distance <= 5) score += 30;
  else if (distance <= 10) score += 25;
  else if (distance <= 20) score += 20;
  else if (distance <= 50) score += 10;
  
  // Eligibility (20 points)
  if (isEligible) score += 20;
  
  // Random factor for variety (10 points)
  score += Math.floor(Math.random() * 10);
  
  return Math.min(score, 100);
};

// Main function to find matching donors
export const findMatchingDonors = (
  users: User[],
  donations: DonationTracker[],
  emergencyRequest: {
    bloodGroup: string;
    latitude?: number;
    longitude?: number;
    location: string;
  },
  maxDistance: number = 50
): DonorMatch[] => {
  const requiredBloodGroup = emergencyRequest.bloodGroup;
  const requestLat = emergencyRequest.latitude || 19.0760; // Default to Mumbai coordinates
  const requestLng = emergencyRequest.longitude || 72.8777;
  
  const donors: DonorMatch[] = users
    .filter(user => {
      // Only include users who can donate to the required blood group
      return isCompatibleBloodGroup(user.bloodGroup, requiredBloodGroup);
    })
    .map(user => {
      // Find user's last donation
      const userDonations = donations
        .filter(d => d.userId === user.userId)
        .sort((a, b) => new Date(b.donationDate).getTime() - new Date(a.donationDate).getTime());
      
      const lastDonation = userDonations[0];
      
      // Calculate distance (using city-based approximation if coordinates not available)
      const userLat = getCityCoordinates(user.city).lat;
      const userLng = getCityCoordinates(user.city).lng;
      const distance = calculateDistance(requestLat, requestLng, userLat, userLng);
      
      // Check eligibility
      const isEligible = isDonorEligible(lastDonation?.donationDate);
      
      // Calculate compatibility score
      const compatibilityScore = calculateCompatibilityScore(
        user.bloodGroup,
        requiredBloodGroup,
        distance,
        isEligible
      );
      
      return {
        user,
        distance: Math.round(distance * 10) / 10, // Round to 1 decimal place
        lastDonation,
        isEligible,
        compatibilityScore,
        matchScore: compatibilityScore // For backward compatibility
      };
    })
    .filter(donor => donor.distance <= maxDistance)
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  
  return donors;
};

// Helper function to get approximate coordinates for cities
export const getCityCoordinates = (city: string): { lat: number; lng: number } => {
  const cityCoords: Record<string, { lat: number; lng: number }> = {
    'mumbai': { lat: 19.0760, lng: 72.8777 },
    'delhi': { lat: 28.7041, lng: 77.1025 },
    'bangalore': { lat: 12.9716, lng: 77.5946 },
    'chennai': { lat: 13.0827, lng: 80.2707 },
    'kolkata': { lat: 22.5726, lng: 88.3639 },
    'hyderabad': { lat: 17.3850, lng: 78.4867 },
    'pune': { lat: 18.5204, lng: 73.8567 },
    'ahmedabad': { lat: 23.0225, lng: 72.5714 },
    'jaipur': { lat: 26.9124, lng: 75.7873 },
    'surat': { lat: 21.1702, lng: 72.8311 },
    'lucknow': { lat: 26.8467, lng: 80.9462 },
    'kanpur': { lat: 26.4499, lng: 80.3319 },
    'nagpur': { lat: 21.1458, lng: 79.0882 },
    'indore': { lat: 22.7196, lng: 75.8577 },
    'bhopal': { lat: 23.2599, lng: 77.4126 },
    'visakhapatnam': { lat: 17.6868, lng: 83.2185 },
    'pimpri-chinchwad': { lat: 18.6298, lng: 73.7997 },
    'patna': { lat: 25.5941, lng: 85.1376 },
    'vadodara': { lat: 22.3072, lng: 73.1812 },
    'ghaziabad': { lat: 28.6692, lng: 77.4538 },
  };
  
  const cityKey = city.toLowerCase().trim();
  return cityCoords[cityKey] || { lat: 19.0760, lng: 72.8777 }; // Default to Mumbai
};
