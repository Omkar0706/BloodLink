// Comprehensive Blood Donation Management System Dataset
// Integrating all 4 sheets with proper relationships

export interface UserData {
  user_id: string;
  name: string;
  gender: 'Male' | 'Female' | 'Other';
  mobile: string;
  date_of_birth: string;
  blood_group: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  city: string;
  pincode: string;
  role: 'Bridge Donor' | 'Emergency Donor' | 'Fighter';
  insert_timestamp: string;
}

export interface BridgeFighterInfo {
  bridge_id: string;
  bridge_name: string;
  user_id: string;
  frequency_days: number; // 15, 20, or 30 days
  units: number; // 1-3 units
  blood_group: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
}

export interface MappingBridgeUserRole {
  mapping_id: string;
  bridge_id: string;
  user_id: string;
  role_in_bridge: 'Bridge Donor' | 'Emergency Donor';
  assignment_date: string;
}

export interface TrackerDonation {
  donation_id: string;
  user_id: string;
  bridge_id: string;
  donation_date: string;
  donation_type: 'Blood Bridge Donation' | 'Voluntary Donation';
  status: 'Complete' | 'Pending' | 'Rejected';
  next_eligible_date: string;
  units_donated: number;
  notes?: string;
}

// Enhanced User with calculated fields for analysis
export interface EnhancedUser extends UserData {
  // Calculated donation metrics
  donations_till_date: number;
  last_donation_date?: string;
  next_eligible_date?: string;
  cycle_of_donations: number;
  frequency_in_days: number;
  last_bridge_donation_date?: string;
  calls_to_donations_ratio: number;
  total_calls: number;
  
  // Bridge associations
  bridge_assignments: BridgeAssignment[];
  donation_history: TrackerDonation[];
  
  // Status indicators
  eligibility_status: 'eligible' | 'not eligible';
  user_donation_active_status: 'active' | 'inactive';
  inactive_trigger_comment?: string;
}

export interface BridgeAssignment {
  bridge_id: string;
  bridge_name: string;
  role_in_bridge: 'Bridge Donor' | 'Emergency Donor';
  frequency_days: number;
  units_required: number;
  blood_group_required: string;
  last_donation_date?: string;
  next_donation_date?: string;
}

// Mock data generation for comprehensive analysis
export const generateComprehensiveDataset = () => {
  const cities = ['Hyderabad', 'Pune', 'Delhi', 'Mumbai', 'Kolkata', 'Chennai', 'Ahmedabad', 'Bengaluru'];
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const roles = ['Bridge Donor', 'Emergency Donor', 'Fighter'];
  const donationTypes = ['Blood Bridge Donation', 'Voluntary Donation'];
  const statuses = ['Complete', 'Pending', 'Rejected'];

  // Generate 300 users
  const users: UserData[] = Array.from({ length: 300 }, (_, i) => ({
    user_id: `U${String(i + 1).padStart(3, '0')}`,
    name: `User ${i + 1}`,
    gender: ['Male', 'Female', 'Other'][Math.floor(Math.random() * 3)] as 'Male' | 'Female' | 'Other',
    mobile: `98765${String(Math.floor(Math.random() * 90000) + 10000)}`,
    date_of_birth: `19${Math.floor(Math.random() * 30) + 70}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
    blood_group: bloodGroups[Math.floor(Math.random() * bloodGroups.length)] as any,
    city: cities[Math.floor(Math.random() * cities.length)],
    pincode: String(Math.floor(Math.random() * 900000) + 100000),
    role: roles[Math.floor(Math.random() * roles.length)] as any,
    insert_timestamp: `2025-${String(Math.floor(Math.random() * 8) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`
  }));

  // Generate 300 bridge records
  const bridges: BridgeFighterInfo[] = Array.from({ length: 300 }, (_, i) => ({
    bridge_id: `B${String(i + 100).padStart(3, '0')}`,
    bridge_name: `Bridge-${i + 1}`,
    user_id: users[i]?.user_id || `U${String(i + 1).padStart(3, '0')}`,
    frequency_days: [15, 20, 30][Math.floor(Math.random() * 3)],
    units: Math.floor(Math.random() * 3) + 1,
    blood_group: bloodGroups[Math.floor(Math.random() * bloodGroups.length)] as any
  }));

  // Generate 200 bridge-user role mappings
  const mappings: MappingBridgeUserRole[] = Array.from({ length: 200 }, (_, i) => ({
    mapping_id: `M${String(i + 1).padStart(3, '0')}`,
    bridge_id: bridges[Math.floor(Math.random() * bridges.length)]?.bridge_id || `B${String(i + 100).padStart(3, '0')}`,
    user_id: users[Math.floor(Math.random() * users.length)]?.user_id || `U${String(i + 1).padStart(3, '0')}`,
    role_in_bridge: ['Bridge Donor', 'Emergency Donor'][Math.floor(Math.random() * 2)] as 'Bridge Donor' | 'Emergency Donor',
    assignment_date: `2025-${String(Math.floor(Math.random() * 8) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`
  }));

  // Generate 200 donation records
  const donations: TrackerDonation[] = Array.from({ length: 200 }, (_, i) => {
    const donationDate = new Date(2024, 7, 13); // 2024-08-13
    donationDate.setDate(donationDate.getDate() + Math.floor(Math.random() * 365));
    
    const nextEligibleDate = new Date(donationDate);
    nextEligibleDate.setDate(nextEligibleDate.getDate() + 90); // 90 days after donation
    
    return {
      donation_id: `D${String(i + 1).padStart(3, '0')}`,
      user_id: users[Math.floor(Math.random() * users.length)]?.user_id || `U${String(i + 1).padStart(3, '0')}`,
      bridge_id: bridges[Math.floor(Math.random() * bridges.length)]?.bridge_id || `B${String(i + 100).padStart(3, '0')}`,
      donation_date: donationDate.toISOString().split('T')[0],
      donation_type: donationTypes[Math.floor(Math.random() * donationTypes.length)] as any,
      status: statuses[Math.floor(Math.random() * statuses.length)] as any,
      next_eligible_date: nextEligibleDate.toISOString().split('T')[0],
      units_donated: Math.floor(Math.random() * 3) + 1,
      notes: Math.random() > 0.7 ? 'Special notes for this donation' : undefined
    };
  });

  return { users, bridges, mappings, donations };
};

// Enhanced analytics functions
export const calculateUserMetrics = (userId: string, donations: TrackerDonation[], mappings: MappingBridgeUserRole[], bridges: BridgeFighterInfo[]) => {
  const userDonations = donations.filter(d => d.user_id === userId);
  const userMappings = mappings.filter(m => m.user_id === userId);
  
  const donations_till_date = userDonations.length;
  const last_donation_date = userDonations.length > 0 
    ? userDonations.sort((a, b) => new Date(b.donation_date).getTime() - new Date(a.donation_date).getTime())[0].donation_date
    : undefined;
  
  const next_eligible_date = userDonations.length > 0
    ? userDonations.sort((a, b) => new Date(b.donation_date).getTime() - new Date(a.donation_date).getTime())[0].next_eligible_date
    : undefined;
  
  const cycle_of_donations = userDonations.filter(d => d.status === 'Complete').length;
  const frequency_in_days = userMappings.length > 0 
    ? userMappings.map(m => bridges.find(b => b.bridge_id === m.bridge_id)?.frequency_days || 30).reduce((a, b) => a + b, 0) / userMappings.length
    : 30;
  
  const last_bridge_donation_date = userDonations.filter(d => d.donation_type === 'Blood Bridge Donation').length > 0
    ? userDonations.filter(d => d.donation_type === 'Blood Bridge Donation')
        .sort((a, b) => new Date(b.donation_date).getTime() - new Date(a.donation_date).getTime())[0].donation_date
    : undefined;
  
  const total_calls = Math.floor(Math.random() * 50) + 5; // Simulated call data
  const calls_to_donations_ratio = donations_till_date > 0 ? total_calls / donations_till_date : total_calls;
  
  const eligibility_status = next_eligible_date && new Date(next_eligible_date) > new Date() ? 'eligible' : 'not eligible';
  const user_donation_active_status = donations_till_date > 0 && new Date(last_donation_date!) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) ? 'active' : 'inactive';
  
  return {
    donations_till_date,
    last_donation_date,
    next_eligible_date,
    cycle_of_donations,
    frequency_in_days,
    last_bridge_donation_date,
    calls_to_donations_ratio,
    total_calls,
    eligibility_status,
    user_donation_active_status,
    inactive_trigger_comment: user_donation_active_status === 'inactive' ? 'No recent donation activity' : undefined
  };
};

export const generateEnhancedUsers = () => {
  const { users, donations, mappings, bridges } = generateComprehensiveDataset();
  
  return users.map(user => {
    const metrics = calculateUserMetrics(user.user_id, donations, mappings, bridges);
    const userDonations = donations.filter(d => d.user_id === user.user_id);
    const userMappings = mappings.filter(m => m.user_id === user.user_id);
    
    const bridgeAssignments: BridgeAssignment[] = userMappings.map(mapping => {
      const bridge = bridges.find(b => b.bridge_id === mapping.bridge_id);
      const bridgeDonations = userDonations.filter(d => d.bridge_id === mapping.bridge_id);
      const lastBridgeDonation = bridgeDonations.length > 0 
        ? bridgeDonations.sort((a, b) => new Date(b.donation_date).getTime() - new Date(a.donation_date).getTime())[0]
        : null;
      
      return {
        bridge_id: mapping.bridge_id,
        bridge_name: bridge?.bridge_name || `Bridge-${mapping.bridge_id}`,
        role_in_bridge: mapping.role_in_bridge,
        frequency_days: bridge?.frequency_days || 30,
        units_required: bridge?.units || 1,
        blood_group_required: bridge?.blood_group || 'O+',
        last_donation_date: lastBridgeDonation?.donation_date,
        next_donation_date: lastBridgeDonation ? 
          new Date(new Date(lastBridgeDonation.donation_date).getTime() + (bridge?.frequency_days || 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined
      };
    });
    
    return {
      ...user,
      ...metrics,
      bridge_assignments: bridgeAssignments,
      donation_history: userDonations
    } as EnhancedUser;
  });
};

// Analytics helper functions
export const analyzeDonationPatterns = (users: EnhancedUser[]) => {
  const patterns = {
    byRole: {} as Record<string, { total: number; avgDonations: number; avgFrequency: number; avgCallsRatio: number }>,
    byBloodGroup: {} as Record<string, { total: number; avgDonations: number; avgFrequency: number }>,
    byCity: {} as Record<string, { total: number; avgDonations: number; activeUsers: number }>,
    byFrequency: {} as Record<number, { total: number; avgDonations: number }>,
    eligibilityAnalysis: {
      eligible: 0,
      notEligible: 0,
      active: 0,
      inactive: 0
    }
  };

  users.forEach(user => {
    // Role analysis
    if (!patterns.byRole[user.role]) {
      patterns.byRole[user.role] = { total: 0, avgDonations: 0, avgFrequency: 0, avgCallsRatio: 0 };
    }
    patterns.byRole[user.role].total++;
    patterns.byRole[user.role].avgDonations += user.donations_till_date;
    patterns.byRole[user.role].avgFrequency += user.frequency_in_days;
    patterns.byRole[user.role].avgCallsRatio += user.calls_to_donations_ratio;

    // Blood group analysis
    if (!patterns.byBloodGroup[user.blood_group]) {
      patterns.byBloodGroup[user.blood_group] = { total: 0, avgDonations: 0, avgFrequency: 0 };
    }
    patterns.byBloodGroup[user.blood_group].total++;
    patterns.byBloodGroup[user.blood_group].avgDonations += user.donations_till_date;
    patterns.byBloodGroup[user.blood_group].avgFrequency += user.frequency_in_days;

    // City analysis
    if (!patterns.byCity[user.city]) {
      patterns.byCity[user.city] = { total: 0, avgDonations: 0, activeUsers: 0 };
    }
    patterns.byCity[user.city].total++;
    patterns.byCity[user.city].avgDonations += user.donations_till_date;
    if (user.user_donation_active_status === 'active') {
      patterns.byCity[user.city].activeUsers++;
    }

    // Frequency analysis
    const frequency = Math.round(user.frequency_in_days);
    if (!patterns.byFrequency[frequency]) {
      patterns.byFrequency[frequency] = { total: 0, avgDonations: 0 };
    }
    patterns.byFrequency[frequency].total++;
    patterns.byFrequency[frequency].avgDonations += user.donations_till_date;

    // Eligibility analysis
    if (user.eligibility_status === 'eligible') patterns.eligibilityAnalysis.eligible++;
    else patterns.eligibilityAnalysis.notEligible++;
    
    if (user.user_donation_active_status === 'active') patterns.eligibilityAnalysis.active++;
    else patterns.eligibilityAnalysis.inactive++;
  });

  // Calculate averages
  Object.keys(patterns.byRole).forEach(role => {
    const data = patterns.byRole[role];
    data.avgDonations = data.avgDonations / data.total;
    data.avgFrequency = data.avgFrequency / data.total;
    data.avgCallsRatio = data.avgCallsRatio / data.total;
  });

  Object.keys(patterns.byBloodGroup).forEach(bg => {
    const data = patterns.byBloodGroup[bg];
    data.avgDonations = data.avgDonations / data.total;
    data.avgFrequency = data.avgFrequency / data.total;
  });

  Object.keys(patterns.byCity).forEach(city => {
    const data = patterns.byCity[city];
    data.avgDonations = data.avgDonations / data.total;
  });

  Object.keys(patterns.byFrequency).forEach(freq => {
    const data = patterns.byFrequency[Number(freq)];
    data.avgDonations = data.avgDonations / data.total;
  });

  return patterns;
};

export const getComprehensiveDataset = () => {
  const enhancedUsers = generateEnhancedUsers();
  const patterns = analyzeDonationPatterns(enhancedUsers);
  
  return {
    users: enhancedUsers,
    patterns,
    summary: {
      totalUsers: enhancedUsers.length,
      totalDonations: enhancedUsers.reduce((sum, user) => sum + user.donations_till_date, 0),
      activeUsers: enhancedUsers.filter(u => u.user_donation_active_status === 'active').length,
      eligibleUsers: enhancedUsers.filter(u => u.eligibility_status === 'eligible').length,
      avgDonationsPerUser: enhancedUsers.reduce((sum, user) => sum + user.donations_till_date, 0) / enhancedUsers.length,
      avgCallsToDonationsRatio: enhancedUsers.reduce((sum, user) => sum + user.calls_to_donations_ratio, 0) / enhancedUsers.length
    }
  };
};
