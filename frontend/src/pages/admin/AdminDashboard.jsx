/**
 * AdminDashboard Page
 * Main admin dashboard with comprehensive analytics and management tools
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import adminService from '../../services/adminService';
import DashboardStats from '../../components/admin/DashboardStats';
import RevenueChart from '../../components/admin/RevenueChart';
import ActivityChart from '../../components/admin/ActivityChart';
import QuickActions from '../../components/admin/QuickActions';
import Tabs, { TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [revenueData, setRevenueData] = useState({});
  const [activityData, setActivityData] = useState({});
  const [timeRange, setTimeRange] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState(null);

  // Check admin permissions
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/unauthorized');
      return;
    }
    
    fetchDashboardData();
  }, [user, navigate, timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock data for development since backend endpoints don't exist yet
      const mockStats = {
        users: {
          total: 1247,
          todaySignups: 12,
          active: 892,
          growth: 8.5
        },
        listings: {
          total: 567,
          todayCreated: 8,
          active: 423,
          growth: 12.3
        },
        bookings: {
          total: 2134,
          todayBookings: 23,
          pending: 45,
          growth: 15.7
        },
        revenue: {
          total: 45678,
          todayRevenue: 1234,
          monthly: 12500,
          growth: 22.1
        }
      };

      const mockRevenueData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        data: [1200, 1900, 3000, 5000, 2000, 3000, 4500],
        growth: 22.1
      };

      const mockActivityData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        users: [45, 78, 120, 89, 156, 234, 189],
        listings: [12, 23, 18, 34, 28, 45, 39],
        bookings: [8, 15, 22, 18, 31, 28, 25]
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      setStats(mockStats);
      setRevenueData(mockRevenueData);
      setActivityData(mockActivityData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  const handleTimeRangeChange = (newRange) => {
    setTimeRange(newRange);
  };

  // Quick action handlers
  const handleCreateUser = () => {
    navigate('/admin/users/create');
  };

  const handleCreateListing = () => {
    navigate('/admin/listings/create');
  };

  const handleViewReports = () => {
    navigate('/admin/analytics');
  };

  const handleSendNotification = () => {
    // Open notification modal or navigate to notifications page
    console.log('Send notification');
  };

  const handleBackupData = async () => {
    try {
      await adminService.createBackup();
      // Show success message
      console.log('Backup created successfully');
    } catch (error) {
      console.error('Error creating backup:', error);
    }
  };

  const handleSystemMaintenance = () => {
    navigate('/admin/system');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Dashboard Error</h3>
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
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Welcome back, {user?.name?.firstName || user?.firstName || user?.email || 'Admin'}. Here's what's happening with your platform.
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Time Range Selector */}
              <select
                value={timeRange}
                onChange={(e) => handleTimeRangeChange(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="12m">Last 12 Months</option>
              </select>
              
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <svg className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <Tabs value={activeTab} onChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border border-gray-200 shadow-sm">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="actions">Quick Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <DashboardStats 
              stats={stats} 
              loading={loading} 
            />

            {/* Charts Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <RevenueChart
                data={revenueData}
                loading={loading}
                timeRange={timeRange}
                onTimeRangeChange={handleTimeRangeChange}
              />
              
              <ActivityChart
                data={activityData}
                loading={loading}
                timeRange={timeRange}
                onTimeRangeChange={handleTimeRangeChange}
              />
            </div>

            {/* Quick Actions Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                {/* Additional content can go here */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="text-gray-500 text-center py-8">
                    Activity feed will be displayed here
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-1">
                <QuickActions
                  onCreateUser={handleCreateUser}
                  onCreateListing={handleCreateListing}
                  onViewReports={handleViewReports}
                  onSendNotification={handleSendNotification}
                  onBackupData={handleBackupData}
                  onSystemMaintenance={handleSystemMaintenance}
                  stats={stats}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <RevenueChart
                data={revenueData}
                loading={loading}
                timeRange={timeRange}
                onTimeRangeChange={handleTimeRangeChange}
              />
              
              <ActivityChart
                data={activityData}
                loading={loading}
                timeRange={timeRange}
                onTimeRangeChange={handleTimeRangeChange}
              />
            </div>
          </TabsContent>

          <TabsContent value="actions">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <QuickActions
                  onCreateUser={handleCreateUser}
                  onCreateListing={handleCreateListing}
                  onViewReports={handleViewReports}
                  onSendNotification={handleSendNotification}
                  onBackupData={handleBackupData}
                  onSystemMaintenance={handleSystemMaintenance}
                  stats={stats}
                />
              </div>
              
              <div className="space-y-6">
                {/* System Status */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Server Status</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Online
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Database</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Connected
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Storage</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        75% Used
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">New Users</span>
                      <span className="text-sm font-semibold text-gray-900">{stats.users?.todaySignups || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">New Listings</span>
                      <span className="text-sm font-semibold text-gray-900">{stats.listings?.todayCreated || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Bookings</span>
                      <span className="text-sm font-semibold text-gray-900">{stats.bookings?.todayBookings || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Revenue</span>
                      <span className="text-sm font-semibold text-green-600">
                        ${(stats.revenue?.todayRevenue || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;