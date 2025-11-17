import React from 'react';
import { motion } from 'framer-motion';
import { Star, Award, Calendar, TrendingUp, Users, Shield } from 'lucide-react';
import Card from '../ui/Card';

/**
 * ProfileStats Component
 * Displays user statistics in a grid layout
 */
const ProfileStats = ({
  user,
  stats,
  className = ''
}) => {
  // Calculate profile completion percentage
  const getProfileCompletion = () => {
    if (!user) return 0;
    
    let completed = 0;
    const total = 8;
    
    if (user.name?.firstName && user.name?.lastName) completed++;
    if (user.bio && user.bio.length > 10) completed++;
    if (user.profile_photo?.url) completed++;
    if (user.phone) completed++;
    if (user.location?.address?.city) completed++;
    if (user.verified_status?.email) completed++;
    if (user.socialLinks && Object.values(user.socialLinks).some(link => link)) completed++;
    if (user.preferences) completed++;
    
    return Math.round((completed / total) * 100);
  };

  const profileCompletion = getProfileCompletion();
  
  // Stats configuration
  const statsConfig = [
    {
      title: 'Rating',
      value: user?.rating_avg ? user.rating_avg.toFixed(1) : '0.0',
      subtitle: `${user?.rating_count || 0} reviews`,
      icon: Star,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      change: null
    },
    {
      title: 'Member Since',
      value: user?.createdAt ? new Date(user.createdAt).getFullYear() : new Date().getFullYear(),
      subtitle: user?.createdAt ? 
        `${Math.floor((Date.now() - new Date(user.createdAt)) / (365.25 * 24 * 60 * 60 * 1000))} years` :
        'New member',
      icon: Calendar,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      change: null
    },
    {
      title: 'Profile Complete',
      value: `${profileCompletion}%`,
      subtitle: profileCompletion === 100 ? 'Fully complete!' : 'In progress',
      icon: Award,
      color: profileCompletion >= 80 ? 'text-green-500' : profileCompletion >= 50 ? 'text-yellow-500' : 'text-red-500',
      bgColor: profileCompletion >= 80 ? 'bg-green-50' : profileCompletion >= 50 ? 'bg-yellow-50' : 'bg-red-50',
      change: null,
      progress: profileCompletion
    },
    {
      title: 'Verification Status',
      value: user?.verified_status?.email ? 'Verified' : 'Pending',
      subtitle: user?.verified_status?.identity ? 'ID Verified' : 'Basic verification',
      icon: Shield,
      color: user?.verified_status?.email ? 'text-green-500' : 'text-gray-500',
      bgColor: user?.verified_status?.email ? 'bg-green-50' : 'bg-gray-50',
      change: null
    },
    // Future stats (placeholders)
    {
      title: 'Active Listings',
      value: stats?.totalListings || 0,
      subtitle: 'Properties listed',
      icon: TrendingUp,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      change: null
    },
    {
      title: 'Total Bookings',
      value: stats?.totalBookings || 0,
      subtitle: stats?.completedBookings ? `${stats.completedBookings} completed` : 'No bookings yet',
      icon: Users,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50',
      change: null
    }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsConfig.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <stat.icon size={20} className={stat.color} />
                    </div>
                    <h3 className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </h3>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </span>
                      {stat.change && (
                        <span className={`text-sm font-medium ${
                          stat.change > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stat.change > 0 ? '+' : ''}{stat.change}%
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-500">
                      {stat.subtitle}
                    </p>
                  </div>

                  {/* Progress bar for profile completion */}
                  {stat.progress !== undefined && (
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                          className={`h-2 rounded-full ${
                            stat.progress >= 80 ? 'bg-green-500' : 
                            stat.progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${stat.progress}%` }}
                          transition={{ delay: 0.5, duration: 1 }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity Section (placeholder for future) */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Activity
        </h3>
        
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-sm">No recent activity to display</p>
          <p className="text-xs mt-1">Activity will appear here when you start using the platform</p>
        </div>
      </Card>

      {/* Achievement Badges (placeholder for future) */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Achievements
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Welcome Badge */}
          <div className="text-center p-4 bg-primary-50 rounded-lg border-2 border-primary-200">
            <div className="text-2xl mb-2">🎉</div>
            <div className="text-xs font-medium text-primary-700">Welcome!</div>
            <div className="text-xs text-primary-600 mt-1">Joined the platform</div>
          </div>

          {/* Profile Complete Badge */}
          {profileCompletion >= 80 && (
            <div className="text-center p-4 bg-green-50 rounded-lg border-2 border-green-200">
              <div className="text-2xl mb-2">✅</div>
              <div className="text-xs font-medium text-green-700">Complete Profile</div>
              <div className="text-xs text-green-600 mt-1">Profile {profileCompletion}% complete</div>
            </div>
          )}

          {/* Email Verified Badge */}
          {user?.verified_status?.email && (
            <div className="text-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
              <div className="text-2xl mb-2">📧</div>
              <div className="text-xs font-medium text-blue-700">Verified Email</div>
              <div className="text-xs text-blue-600 mt-1">Email confirmed</div>
            </div>
          )}

          {/* Placeholder badges */}
          <div className="text-center p-4 bg-gray-50 rounded-lg border-2 border-gray-200 opacity-50">
            <div className="text-2xl mb-2">🏆</div>
            <div className="text-xs font-medium text-gray-500">First Listing</div>
            <div className="text-xs text-gray-400 mt-1">Create your first listing</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProfileStats;