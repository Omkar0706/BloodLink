'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Award, 
  Target, 
  Heart, 
  Users, 
  Calendar,
  TrendingUp,
  Gift,
  Medal,
  Crown,
  Zap,
  MapPin,
  Clock
} from 'lucide-react';

interface DonorProfile {
  id: string;
  name: string;
  bloodType: string;
  totalDonations: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  badges: Badge[];
  streakDays: number;
  rank: number;
  lifeSaved: number;
  city: string;
  joinDate: string;
  avatar: string;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earnedDate: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  reward: {
    xp: number;
    badge?: Badge;
  };
  deadline: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface Leaderboard {
  rank: number;
  donor: DonorProfile;
  score: number;
  change: number;
}

const mockBadges: Badge[] = [
  { id: '1', name: 'First Drop', description: 'Made your first donation', icon: '🩸', rarity: 'common', earnedDate: '2024-01-15' },
  { id: '2', name: 'Life Saver', description: 'Saved 5 lives through donations', icon: '💝', rarity: 'rare', earnedDate: '2024-02-20' },
  { id: '3', name: 'Marathon Donor', description: '10 donations milestone', icon: '🏃‍♂️', rarity: 'epic', earnedDate: '2024-03-10' },
  { id: '4', name: 'Emergency Hero', description: 'Responded to emergency call within 30 minutes', icon: '🚨', rarity: 'legendary', earnedDate: '2024-03-15' }
];

const mockDonor: DonorProfile = {
  id: 'donor-123',
  name: 'Arjun Patel',
  bloodType: 'O+',
  totalDonations: 12,
  level: 8,
  xp: 2450,
  xpToNextLevel: 550,
  badges: mockBadges,
  streakDays: 45,
  rank: 3,
  lifeSaved: 15,
  city: 'Mumbai',
  joinDate: '2024-01-15',
  avatar: '👨‍⚕️'
};

const mockChallenges: Challenge[] = [
  {
    id: 'c1',
    title: 'Monthly Hero',
    description: 'Make 2 donations this month',
    target: 2,
    current: 1,
    reward: { xp: 500, badge: { id: 'monthly', name: 'Monthly Hero', description: 'Completed monthly challenge', icon: '🗓️', rarity: 'rare', earnedDate: '' } },
    deadline: '2024-01-31',
    difficulty: 'medium'
  },
  {
    id: 'c2',
    title: 'Emergency Response',
    description: 'Respond to 3 emergency requests',
    target: 3,
    current: 2,
    reward: { xp: 1000 },
    deadline: '2024-01-25',
    difficulty: 'hard'
  },
  {
    id: 'c3',
    title: 'Community Builder',
    description: 'Refer 5 new donors',
    target: 5,
    current: 3,
    reward: { xp: 750, badge: { id: 'recruiter', name: 'Recruiter', description: 'Referred 5 new donors', icon: '👥', rarity: 'epic', earnedDate: '' } },
    deadline: '2024-02-15',
    difficulty: 'hard'
  }
];

const mockLeaderboard: Leaderboard[] = [
  { rank: 1, donor: { ...mockDonor, name: 'Priya Sharma', totalDonations: 25, xp: 5200, rank: 1 }, score: 5200, change: 2 },
  { rank: 2, donor: { ...mockDonor, name: 'Rahul Kumar', totalDonations: 22, xp: 4800, rank: 2 }, score: 4800, change: -1 },
  { rank: 3, donor: mockDonor, score: 2450, change: 1 },
  { rank: 4, donor: { ...mockDonor, name: 'Sneha Gupta', totalDonations: 18, xp: 3600, rank: 4 }, score: 3600, change: -2 },
  { rank: 5, donor: { ...mockDonor, name: 'Vikram Singh', totalDonations: 15, xp: 3200, rank: 5 }, score: 3200, change: 0 }
];

export default function GamificationDashboard() {
  const [activeTab, setActiveTab] = useState<'profile' | 'challenges' | 'leaderboard' | 'achievements'>('profile');
  const [donor, setDonor] = useState(mockDonor);
  const [challenges, setChallenges] = useState(mockChallenges);
  const [showReward, setShowReward] = useState(false);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600 bg-gray-100 border-gray-300';
      case 'rare': return 'text-blue-600 bg-blue-100 border-blue-300';
      case 'epic': return 'text-purple-600 bg-purple-100 border-purple-300';
      case 'legendary': return 'text-yellow-600 bg-yellow-100 border-yellow-300';
      default: return 'text-gray-600 bg-gray-100 border-gray-300';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const simulateReward = () => {
    setShowReward(true);
    setTimeout(() => setShowReward(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Trophy className="h-8 w-8 text-yellow-300" />
              <span className="ml-2 text-xl font-bold">BloodLink Champions</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-red-100">Welcome back,</p>
                <p className="font-semibold">{donor.name} {donor.avatar}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Reward Animation */}
      <AnimatePresence>
        {showReward && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: -100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -100 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
          >
            <div className="bg-white rounded-lg p-8 text-center shadow-2xl">
              <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Congratulations! 🎉</h2>
              <p className="text-gray-600 mb-4">You earned 250 XP and a new badge!</p>
              <div className="text-4xl mb-4">🏆</div>
              <p className="text-sm text-gray-500">Keep saving lives!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center">
              <Crown className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Current Rank</p>
                <p className="text-2xl font-bold text-gray-900">#{donor.rank}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center">
              <Star className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Level</p>
                <p className="text-2xl font-bold text-gray-900">{donor.level}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Lives Saved</p>
                <p className="text-2xl font-bold text-gray-900">{donor.lifeSaved}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center">
              <Zap className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Streak Days</p>
                <p className="text-2xl font-bold text-gray-900">{donor.streakDays}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {['profile', 'challenges', 'leaderboard', 'achievements'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                {/* User Profile Card */}
                <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="text-6xl mr-6">{donor.avatar}</div>
                      <div>
                        <h2 className="text-2xl font-bold">{donor.name}</h2>
                        <p className="text-red-100">Blood Type: {donor.bloodType}</p>
                        <p className="text-red-100">Member since: {new Date(donor.joinDate).toLocaleDateString()}</p>
                        <div className="flex items-center mt-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span className="text-red-100">{donor.city}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold">{donor.totalDonations}</p>
                      <p className="text-red-100">Total Donations</p>
                    </div>
                  </div>
                </div>

                {/* XP Progress */}
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Level Progress</h3>
                    <span className="text-sm text-gray-600">Level {donor.level}</span>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>{donor.xp} XP</span>
                      <span>{donor.xp + donor.xpToNextLevel} XP</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <motion.div 
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(donor.xp / (donor.xp + donor.xpToNextLevel)) * 100}%` }}
                        transition={{ duration: 1 }}
                      />
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600">
                    {donor.xpToNextLevel} XP needed to reach Level {donor.level + 1}
                  </p>
                </div>

                {/* Recent Achievements */}
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Achievements</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {donor.badges.slice(0, 4).map((badge, index) => (
                      <motion.div
                        key={badge.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`border-2 rounded-lg p-4 ${getRarityColor(badge.rarity)}`}
                      >
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">{badge.icon}</span>
                          <div>
                            <p className="font-semibold">{badge.name}</p>
                            <p className="text-sm opacity-75">{badge.description}</p>
                            <p className="text-xs mt-1">Earned: {new Date(badge.earnedDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Challenges Tab */}
            {activeTab === 'challenges' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Active Challenges</h3>
                  <button
                    onClick={simulateReward}
                    className="btn-primary flex items-center text-sm px-4 py-2"
                  >
                    <Gift className="h-4 w-4 mr-2" />
                    Simulate Reward
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {challenges.map((challenge, index) => (
                    <motion.div
                      key={challenge.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-semibold text-gray-900">{challenge.title}</h4>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                          {challenge.difficulty.toUpperCase()}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-4">{challenge.description}</p>

                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{challenge.current}/{challenge.target}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div 
                            className="bg-green-500 h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${(challenge.current / challenge.target) * 100}%` }}
                            transition={{ duration: 0.8 }}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Reward:</span>
                          <span className="font-medium text-purple-600">+{challenge.reward.xp} XP</span>
                        </div>
                        {challenge.reward.badge && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Badge:</span>
                            <span className="font-medium">{challenge.reward.badge.icon} {challenge.reward.badge.name}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Deadline:</span>
                          <span className="font-medium">{new Date(challenge.deadline).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Leaderboard Tab */}
            {activeTab === 'leaderboard' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Top Donors This Month</h3>

                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="divide-y divide-gray-200">
                    {mockLeaderboard.map((entry, index) => (
                      <motion.div
                        key={entry.donor.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-6 ${entry.donor.id === donor.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mr-4">
                              {entry.rank <= 3 ? (
                                <Trophy className={`h-6 w-6 ${
                                  entry.rank === 1 ? 'text-yellow-500' :
                                  entry.rank === 2 ? 'text-gray-400' :
                                  'text-yellow-600'
                                }`} />
                              ) : (
                                <span className="font-bold text-gray-600">#{entry.rank}</span>
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{entry.donor.name}</p>
                              <p className="text-sm text-gray-600">
                                {entry.donor.bloodType} • {entry.donor.totalDonations} donations
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="font-bold text-gray-900">{entry.score.toLocaleString()} XP</p>
                            <div className="flex items-center">
                              {entry.change > 0 ? (
                                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                              ) : entry.change < 0 ? (
                                <TrendingUp className="h-4 w-4 text-red-500 mr-1 transform rotate-180" />
                              ) : null}
                              <span className={`text-sm ${
                                entry.change > 0 ? 'text-green-600' :
                                entry.change < 0 ? 'text-red-600' :
                                'text-gray-600'
                              }`}>
                                {entry.change > 0 ? '+' : ''}{entry.change}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Achievements Tab */}
            {activeTab === 'achievements' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Badge Collection</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {donor.badges.map((badge, index) => (
                    <motion.div
                      key={badge.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={`border-2 rounded-lg p-6 text-center ${getRarityColor(badge.rarity)}`}
                    >
                      <div className="text-4xl mb-4">{badge.icon}</div>
                      <h4 className="font-bold text-lg mb-2">{badge.name}</h4>
                      <p className="text-sm opacity-75 mb-3">{badge.description}</p>
                      <div className="flex items-center justify-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span className="text-xs">
                          {new Date(badge.earnedDate).toLocaleDateString()}
                        </span>
                      </div>
                      <span className={`inline-block mt-3 px-2 py-1 rounded-full text-xs font-medium border ${getRarityColor(badge.rarity)}`}>
                        {badge.rarity.toUpperCase()}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* Achievement Stats */}
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-4">Collection Stats</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-600">4</p>
                      <p className="text-sm text-gray-500">Common</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">2</p>
                      <p className="text-sm text-gray-500">Rare</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">1</p>
                      <p className="text-sm text-gray-500">Epic</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-600">1</p>
                      <p className="text-sm text-gray-500">Legendary</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
