import { User, DonationTracker, EmergencyRequest, DonorMatch } from '@/types';

export const calculateAge = (dateOfBirth: string | Date): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
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
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export const isEligibleForDonation = (user: User, lastDonation?: DonationTracker): boolean => {
  const age = calculateAge(user.dateOfBirth);
  if (age < 18 || age > 60) return false;
  
  if (!lastDonation) return true;
  
  const lastDonationDate = new Date(lastDonation.donationDate);
  const today = new Date();
  const daysSinceLastDonation = Math.floor((today.getTime() - lastDonationDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Minimum 56 days between donations for males, 84 days for females
  const minDays = user.gender === 'Female' ? 84 : 56;
  return daysSinceLastDonation >= minDays;
};

export const findMatchingDonors = (
  request: EmergencyRequest,
  users: User[],
  donations: DonationTracker[]
): DonorMatch[] => {
  const eligibleDonors: DonorMatch[] = [];
  
  users.forEach(user => {
    if (user.bloodGroup !== request.bloodGroup) return;
    
    const userDonations = donations.filter(d => d.userId === user.userId);
    const lastDonation = userDonations.sort((a, b) => 
      new Date(b.donationDate).getTime() - new Date(a.donationDate).getTime()
    )[0];
    
    if (!isEligibleForDonation(user, lastDonation)) return;
    
    // For now, use a default distance since we don't have coordinates in the schema
    const distance = Math.random() * 20; // TODO: Implement real geolocation
    
    // Calculate match score based on distance, donation history, and role
    let matchScore = 100;
    
    // Distance penalty (max 30 points)
    if (distance > 15) matchScore -= 30;
    else if (distance > 10) matchScore -= 20;
    else if (distance > 5) matchScore -= 10;
    
    // Role bonus
    if (user.role === 'Emergency Donor') matchScore += 10;
    if (user.role === 'Fighter') matchScore += 5;
    
    // Donation history bonus
    if (userDonations.length > 5) matchScore += 10;
    else if (userDonations.length > 2) matchScore += 5;
    
    matchScore = Math.max(0, Math.min(100, matchScore));
    
    eligibleDonors.push({
      user,
      distance: Math.round(distance * 10) / 10,
      lastDonation,
      isEligible: true,
      compatibilityScore: matchScore,
      matchScore
    });
  });
  
  return eligibleDonors.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
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

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'Complete': 'bg-green-100 text-green-800',
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Cancelled': 'bg-red-100 text-red-800',
    'Fulfilled': 'bg-green-100 text-green-800',
    'Active': 'bg-blue-100 text-blue-800',
    'Inactive': 'bg-gray-100 text-gray-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getUrgencyColor = (urgency: string): string => {
  const colors: Record<string, string> = {
    'Low': 'bg-blue-100 text-blue-800',
    'Medium': 'bg-yellow-100 text-yellow-800',
    'High': 'bg-orange-100 text-orange-800',
    'Critical': 'bg-red-100 text-red-800'
  };
  return colors[urgency] || 'bg-gray-100 text-gray-800';
};

export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const isCompatibleBloodGroup = (donorGroup: string, recipientGroup: string): boolean => {
  const compatibility: Record<string, string[]> = {
    'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], // Universal donor
    'O+': ['O+', 'A+', 'B+', 'AB+'],
    'A-': ['A-', 'A+', 'AB-', 'AB+'],
    'A+': ['A+', 'AB+'],
    'B-': ['B-', 'B+', 'AB-', 'AB+'],
    'B+': ['B+', 'AB+'],
    'AB-': ['AB-', 'AB+'],
    'AB+': ['AB+'] // Universal recipient
  };
  
  return compatibility[donorGroup]?.includes(recipientGroup) || false;
};
