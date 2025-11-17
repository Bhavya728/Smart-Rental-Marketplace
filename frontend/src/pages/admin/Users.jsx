/**
 * Users Admin Page
 * Comprehensive user management interface
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import adminService from '../../services/adminService';
import UserTable from '../../components/admin/UserTable';
import StatCard from '../../components/ui/StatCard';

const Users = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [userStats, setUserStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Check admin permissions
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/unauthorized');
      return;
    }
    
    fetchUsers();
    fetchUserStats();
  }, [user, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getUsers();
      setUsers(response.data.users || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await adminService.getUserStats();
      setUserStats(response.data || {});
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handleRefresh = () => {
    fetchUsers();
    fetchUserStats();
  };

  const handleUserEdit = (userData) => {
    navigate(`/admin/users/${userData._id}/edit`);
  };

  const handleUserBlock = async (userData) => {
    try {
      const action = userData.status === 'blocked' ? 'unblock' : 'block';
      await adminService.updateUserStatus(userData._id, { 
        status: userData.status === 'blocked' ? 'active' : 'blocked' 
      });
      
      // Update local state
      setUsers(users.map(u => 
        u._id === userData._id 
          ? { ...u, status: userData.status === 'blocked' ? 'active' : 'blocked' }
          : u
      ));
      
      console.log(`User ${action}ed successfully`);
    } catch (error) {
      console.error(`Error ${userData.status === 'blocked' ? 'unblocking' : 'blocking'} user:`, error);
    }
  };

  const handleUserDelete = async (userData) => {
    if (window.confirm(`Are you sure you want to delete user "${userData.name}"? This action cannot be undone.`)) {
      try {
        await adminService.deleteUser(userData._id);
        setUsers(users.filter(u => u._id !== userData._id));
        console.log('User deleted successfully');
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleUserSelect = (selection) => {
    setSelectedUsers(selection);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Users</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                User Management
              </h1>
              <p className="text-gray-600 mt-2">
                Manage user accounts, roles, and permissions
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/users/create')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New User
              </button>
              
              <button
                onClick={() => navigate('/admin')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* User Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={userStats.total?.toLocaleString() || '0'}
            subtitle="All registered users"
            trend={userStats.growthRate > 0 ? 'up' : userStats.growthRate < 0 ? 'down' : 'neutral'}
            trendValue={`${Math.abs(userStats.growthRate || 0)}%`}
            trendLabel="growth rate"
            variant="default"
            loading={loading}
            icon={() => (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-1a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          />
          
          <StatCard
            title="Active Users"
            value={userStats.active?.toLocaleString() || '0'}
            subtitle="Currently active"
            trend="up"
            trendValue={userStats.activePercentage?.toFixed(1) || '0'}
            trendLabel="% of total"
            variant="success"
            loading={loading}
            icon={() => (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          />
          
          <StatCard
            title="New This Month"
            value={userStats.thisMonth?.toLocaleString() || '0'}
            subtitle="New registrations"
            trend={userStats.monthlyGrowth > 0 ? 'up' : 'down'}
            trendValue={`${Math.abs(userStats.monthlyGrowth || 0)}%`}
            trendLabel="vs last month"
            variant="info"
            loading={loading}
            icon={() => (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            )}
          />
          
          <StatCard
            title="Blocked Users"
            value={userStats.blocked?.toLocaleString() || '0'}
            subtitle="Suspended accounts"
            trend={userStats.blocked > 0 ? 'warning' : 'positive'}
            variant="warning"
            loading={loading}
            icon={() => (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
              </svg>
            )}
          />
        </div>

        {/* User Table */}
        <UserTable
          users={users}
          loading={loading}
          onUserSelect={handleUserSelect}
          onUserEdit={handleUserEdit}
          onUserBlock={handleUserBlock}
          onUserDelete={handleUserDelete}
          onRefresh={handleRefresh}
        />
      </div>
    </div>
  );
};

export default Users;