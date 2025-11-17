/**
 * Analytics Admin Page
 * Comprehensive analytics and reporting interface
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import adminService from '../../services/adminService';
import RevenueChart from '../../components/admin/RevenueChart';
import ActivityChart from '../../components/admin/ActivityChart';
import AuditLog from '../../components/admin/AuditLog';
import StatCard from '../../components/ui/StatCard';
import Tabs, { TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';

const Analytics = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState({});
  const [activityData, setActivityData] = useState({});
  const [auditLogs, setAuditLogs] = useState([]);
  const [analyticsStats, setAnalyticsStats] = useState({});
  const [timeRange, setTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('revenue');
  const [error, setError] = useState(null);

  // Check admin permissions
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/unauthorized');
      return;
    }
    
    fetchAnalyticsData();
  }, [user, navigate, timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [revenueResponse, activityResponse, auditResponse, statsResponse] = await Promise.all([
        adminService.getRevenueAnalytics(timeRange),
        adminService.getActivityAnalytics(timeRange),
        adminService.getAuditLogs({ limit: 100 }),
        adminService.getAnalyticsStats(timeRange)
      ]);

      setRevenueData(revenueResponse.data);
      setActivityData(activityResponse.data);
      setAuditLogs(auditResponse.data.logs || []);
      setAnalyticsStats(statsResponse.data || {});
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchAnalyticsData();
  };

  const handleTimeRangeChange = (newRange) => {
    setTimeRange(newRange);
  };

  const handleExportReport = async (reportType) => {
    try {
      const response = await adminService.exportReport(reportType, timeRange);
      
      // Create download link
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}_report_${timeRange}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log(`${reportType} report exported successfully`);
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  const handleLogDetails = (log) => {
    // Open log details modal or navigate to detailed view
    console.log('View log details:', log);
  };

  const handleClearLogs = async (logIds) => {
    try {
      if (logIds) {
        // Clear specific logs
        await adminService.deleteAuditLogs(logIds);
      } else {
        // Clear all logs
        if (window.confirm('Are you sure you want to clear all audit logs? This action cannot be undone.')) {
          await adminService.clearAuditLogs();
        }
      }
      
      // Refresh audit logs
      const response = await adminService.getAuditLogs({ limit: 100 });
      setAuditLogs(response.data.logs || []);
      
      console.log('Audit logs cleared successfully');
    } catch (error) {
      console.error('Error clearing audit logs:', error);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Analytics Error</h3>
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
                Analytics & Reports
              </h1>
              <p className="text-gray-600 mt-2">
                Comprehensive insights into platform performance and user behavior
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Time Range Selector */}
              <select
                value={timeRange}
                onChange={(e) => handleTimeRangeChange(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="12m">Last 12 Months</option>
              </select>
              
              {/* Export Dropdown */}
              <div className="relative">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleExportReport(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="border border-gray-300 rounded-lg px-4 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  defaultValue=""
                >
                  <option value="" disabled>Export Report</option>
                  <option value="revenue">Revenue Report</option>
                  <option value="users">User Report</option>
                  <option value="listings">Listing Report</option>
                  <option value="bookings">Booking Report</option>
                  <option value="complete">Complete Report</option>
                </select>
              </div>
              
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

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Revenue"
            value={`$${(analyticsStats.totalRevenue || 0).toLocaleString()}`}
            subtitle={`For ${timeRange}`}
            trend={analyticsStats.revenueGrowth > 0 ? 'up' : analyticsStats.revenueGrowth < 0 ? 'down' : 'neutral'}
            trendValue={`${Math.abs(analyticsStats.revenueGrowth || 0)}%`}
            trendLabel="vs previous period"
            variant="success"
            loading={loading}
            icon={() => (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            )}
          />
          
          <StatCard
            title="Active Users"
            value={(analyticsStats.activeUsers || 0).toLocaleString()}
            subtitle="Unique active users"
            trend={analyticsStats.userGrowth > 0 ? 'up' : analyticsStats.userGrowth < 0 ? 'down' : 'neutral'}
            trendValue={`${Math.abs(analyticsStats.userGrowth || 0)}%`}
            trendLabel="user growth"
            variant="info"
            loading={loading}
            icon={() => (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-1a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          />
          
          <StatCard
            title="Conversion Rate"
            value={`${(analyticsStats.conversionRate || 0).toFixed(1)}%`}
            subtitle="Visitor to booking"
            trend={analyticsStats.conversionTrend > 0 ? 'up' : analyticsStats.conversionTrend < 0 ? 'down' : 'neutral'}
            trendValue={`${Math.abs(analyticsStats.conversionTrend || 0).toFixed(1)}%`}
            trendLabel="change"
            variant="warning"
            loading={loading}
            icon={() => (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            )}
          />
          
          <StatCard
            title="Platform Health"
            value={`${(analyticsStats.healthScore || 95).toFixed(1)}%`}
            subtitle="Overall system health"
            trend={analyticsStats.healthScore >= 95 ? 'up' : analyticsStats.healthScore >= 85 ? 'neutral' : 'down'}
            variant={analyticsStats.healthScore >= 95 ? 'success' : analyticsStats.healthScore >= 85 ? 'warning' : 'danger'}
            loading={loading}
            icon={() => (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          />
        </div>

        {/* Analytics Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border border-gray-200 shadow-sm">
            <TabsTrigger value="revenue">Revenue Analytics</TabsTrigger>
            <TabsTrigger value="activity">User Activity</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
            <TabsTrigger value="reports">Custom Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue">
            <RevenueChart
              data={revenueData}
              loading={loading}
              timeRange={timeRange}
              onTimeRangeChange={handleTimeRangeChange}
            />
          </TabsContent>

          <TabsContent value="activity">
            <ActivityChart
              data={activityData}
              loading={loading}
              timeRange={timeRange}
              onTimeRangeChange={handleTimeRangeChange}
            />
          </TabsContent>

          <TabsContent value="audit">
            <AuditLog
              logs={auditLogs}
              loading={loading}
              onRefresh={() => {
                adminService.getAuditLogs({ limit: 100 }).then(response => {
                  setAuditLogs(response.data.logs || []);
                });
              }}
              onLogDetails={handleLogDetails}
              onClearLogs={handleClearLogs}
            />
          </TabsContent>

          <TabsContent value="reports">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Custom Reports</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Revenue Reports */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Revenue Reports</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Detailed financial analytics and revenue breakdowns
                  </p>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleExportReport('revenue-detailed')}
                      className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded"
                    >
                      Detailed Revenue Report
                    </button>
                    <button
                      onClick={() => handleExportReport('revenue-by-category')}
                      className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded"
                    >
                      Revenue by Category
                    </button>
                    <button
                      onClick={() => handleExportReport('revenue-trends')}
                      className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded"
                    >
                      Revenue Trends
                    </button>
                  </div>
                </div>

                {/* User Reports */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">User Reports</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    User behavior and engagement analytics
                  </p>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleExportReport('user-activity')}
                      className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded"
                    >
                      User Activity Report
                    </button>
                    <button
                      onClick={() => handleExportReport('user-demographics')}
                      className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded"
                    >
                      User Demographics
                    </button>
                    <button
                      onClick={() => handleExportReport('user-retention')}
                      className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded"
                    >
                      Retention Analysis
                    </button>
                  </div>
                </div>

                {/* Performance Reports */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Performance Reports</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    System performance and operational metrics
                  </p>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleExportReport('system-performance')}
                      className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded"
                    >
                      System Performance
                    </button>
                    <button
                      onClick={() => handleExportReport('error-analysis')}
                      className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded"
                    >
                      Error Analysis
                    </button>
                    <button
                      onClick={() => handleExportReport('security-audit')}
                      className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded"
                    >
                      Security Audit
                    </button>
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

export default Analytics;