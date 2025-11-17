/**
 * QuickActions Component
 * Quick access buttons for common admin tasks
 */

import React from 'react';

const QuickActions = ({ 
  onCreateUser,
  onCreateListing,
  onViewReports,
  onSendNotification,
  onBackupData,
  onSystemMaintenance,
  stats = {}
}) => {
  const actions = [
    {
      id: 'create-user',
      title: 'Add New User',
      description: 'Create a new user account',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: onCreateUser
    },
    {
      id: 'create-listing',
      title: 'Add Listing',
      description: 'Create a new property listing',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      color: 'bg-green-500 hover:bg-green-600',
      onClick: onCreateListing
    },
    {
      id: 'view-reports',
      title: 'Generate Report',
      description: 'Create analytics reports',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'bg-purple-500 hover:bg-purple-600',
      onClick: onViewReports
    },
    {
      id: 'send-notification',
      title: 'Send Notification',
      description: 'Broadcast message to users',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM12 5v10l5-5-5-5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7v10a2 2 0 002 2h4m-6-12a2 2 0 012-2h4a2 2 0 012 2v4" />
        </svg>
      ),
      color: 'bg-yellow-500 hover:bg-yellow-600',
      onClick: onSendNotification
    },
    {
      id: 'backup-data',
      title: 'Backup Data',
      description: 'Create system backup',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
        </svg>
      ),
      color: 'bg-indigo-500 hover:bg-indigo-600',
      onClick: onBackupData
    },
    {
      id: 'maintenance',
      title: 'Maintenance Mode',
      description: 'Toggle system maintenance',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: 'bg-red-500 hover:bg-red-600',
      onClick: onSystemMaintenance
    }
  ];

  const systemStatus = {
    pendingApprovals: stats.pendingListings || 0,
    activeIssues: stats.activeIssues || 0,
    systemHealth: stats.systemHealth || 'good'
  };

  return (
    <div className="space-y-6">
      {/* System Status Alerts */}
      {(systemStatus.pendingApprovals > 0 || systemStatus.activeIssues > 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-yellow-800">Attention Required</h4>
              <div className="mt-2 space-y-1">
                {systemStatus.pendingApprovals > 0 && (
                  <p className="text-sm text-yellow-700">
                    <span className="font-medium">{systemStatus.pendingApprovals}</span> listings pending approval
                  </p>
                )}
                {systemStatus.activeIssues > 0 && (
                  <p className="text-sm text-yellow-700">
                    <span className="font-medium">{systemStatus.activeIssues}</span> active system issues
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* System Health Status */}
      <div className={`rounded-xl p-4 border ${
        systemStatus.systemHealth === 'good' 
          ? 'bg-green-50 border-green-200'
          : systemStatus.systemHealth === 'warning'
          ? 'bg-yellow-50 border-yellow-200'
          : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              systemStatus.systemHealth === 'good' 
                ? 'bg-green-500'
                : systemStatus.systemHealth === 'warning'
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}></div>
            <span className={`text-sm font-medium ${
              systemStatus.systemHealth === 'good' 
                ? 'text-green-800'
                : systemStatus.systemHealth === 'warning'
                ? 'text-yellow-800'
                : 'text-red-800'
            }`}>
              System Status: {systemStatus.systemHealth === 'good' ? 'All Systems Operational' : 
                           systemStatus.systemHealth === 'warning' ? 'Minor Issues Detected' : 
                           'Critical Issues Detected'}
            </span>
          </div>
          <button
            onClick={onSystemMaintenance}
            className="text-xs px-3 py-1 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            View Details
          </button>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            <p className="text-sm text-gray-600">Frequently used administrative functions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={action.onClick}
              className={`${action.color} text-white rounded-xl p-4 transition-all duration-200 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 rounded-lg p-2">
                  {action.icon}
                </div>
                <div className="text-left">
                  <div className="font-semibold text-sm">{action.title}</div>
                  <div className="text-xs opacity-90">{action.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-700">New user registration</span>
            </div>
            <span className="text-xs text-gray-500">2 min ago</span>
          </div>
          
          <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Listing approved</span>
            </div>
            <span className="text-xs text-gray-500">5 min ago</span>
          </div>
          
          <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Payment processed</span>
            </div>
            <span className="text-xs text-gray-500">8 min ago</span>
          </div>
          
          <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Booking confirmation</span>
            </div>
            <span className="text-xs text-gray-500">12 min ago</span>
          </div>
          
          <div className="pt-3">
            <button 
              onClick={onViewReports}
              className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View all activity →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;