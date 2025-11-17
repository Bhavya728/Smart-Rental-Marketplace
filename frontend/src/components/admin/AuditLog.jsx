/**
 * AuditLog Component
 * Display and manage system audit logs
 */

import React, { useState, useMemo } from 'react';
import Table from '../ui/Table';
import { formatDate } from '../../utils/formatters';

const AuditLog = ({ 
  logs = [],
  loading = false,
  onRefresh,
  onLogDetails,
  onClearLogs
}) => {
  const [selectedLogs, setSelectedLogs] = useState([]);
  const [filterLevel, setFilterLevel] = useState('');
  const [filterAction, setFilterAction] = useState('');

  // Log level colors and icons
  const getLevelConfig = (level) => {
    const configs = {
      info: {
        color: 'bg-blue-100 text-blue-800',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      },
      warning: {
        color: 'bg-yellow-100 text-yellow-800',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        )
      },
      error: {
        color: 'bg-red-100 text-red-800',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      },
      success: {
        color: 'bg-green-100 text-green-800',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      }
    };
    return configs[level] || configs.info;
  };

  // Table columns configuration
  const columns = useMemo(() => [
    {
      key: 'level',
      title: 'Level',
      width: '100px',
      sortable: true,
      render: (log) => {
        const config = getLevelConfig(log.level);
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
            {config.icon}
            <span className="ml-1 capitalize">{log.level}</span>
          </span>
        );
      }
    },
    {
      key: 'timestamp',
      title: 'Timestamp',
      sortable: true,
      width: '180px',
      render: (log) => (
        <div className="text-sm text-gray-600">
          {formatDate(log.timestamp, { includeTime: true })}
        </div>
      )
    },
    {
      key: 'action',
      title: 'Action',
      sortable: true,
      render: (log) => (
        <div>
          <div className="font-medium text-gray-900">{log.action}</div>
          <div className="text-xs text-gray-500">{log.resource}</div>
        </div>
      )
    },
    {
      key: 'user',
      title: 'User',
      sortable: true,
      render: (log) => (
        <div className="flex items-center space-x-2">
          {log.user?.avatar ? (
            <img 
              src={log.user.avatar} 
              alt={log.user.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
              {log.user?.name?.charAt(0).toUpperCase() || 'S'}
            </div>
          )}
          <div>
            <div className="font-medium text-gray-900 text-sm">
              {log.user?.name || 'System'}
            </div>
            <div className="text-xs text-gray-500">
              {log.user?.email || log.ipAddress}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'details',
      title: 'Details',
      render: (log) => (
        <div className="max-w-xs">
          <div className="text-sm text-gray-900 truncate">
            {log.details || log.message}
          </div>
          {log.metadata && (
            <div className="text-xs text-gray-500 mt-1">
              {Object.keys(log.metadata).length} metadata fields
            </div>
          )}
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (log) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          log.status === 'success'
            ? 'bg-green-100 text-green-800'
            : log.status === 'failed'
            ? 'bg-red-100 text-red-800'
            : log.status === 'pending'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {log.status || 'completed'}
        </span>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      width: '80px',
      render: (log) => (
        <button
          onClick={() => onLogDetails?.(log)}
          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
          title="View details"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
      )
    }
  ], [onLogDetails]);

  // Filter options
  const levelOptions = [
    { label: 'All Levels', value: '' },
    { label: 'Info', value: 'info' },
    { label: 'Warning', value: 'warning' },
    { label: 'Error', value: 'error' },
    { label: 'Success', value: 'success' }
  ];

  const actionOptions = [
    { label: 'All Actions', value: '' },
    { label: 'User Login', value: 'user.login' },
    { label: 'User Logout', value: 'user.logout' },
    { label: 'Listing Created', value: 'listing.create' },
    { label: 'Listing Updated', value: 'listing.update' },
    { label: 'Listing Deleted', value: 'listing.delete' },
    { label: 'Booking Created', value: 'booking.create' },
    { label: 'Booking Cancelled', value: 'booking.cancel' },
    { label: 'Payment Processed', value: 'payment.process' },
    { label: 'Admin Action', value: 'admin.action' }
  ];

  // Bulk actions
  const bulkActions = [
    {
      label: 'Export Selected',
      onClick: (selectedIds) => {
        const selectedLogs = logs.filter(log => selectedIds.includes(log._id));
        const csvContent = "data:text/csv;charset=utf-8," 
          + "Timestamp,Level,Action,User,Details,Status\n"
          + selectedLogs.map(log => 
            `"${formatDate(log.timestamp)}","${log.level}","${log.action}","${log.user?.name || 'System'}","${log.details || log.message}","${log.status || 'completed'}"`
          ).join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setSelectedLogs([]);
      },
      variant: 'primary'
    },
    {
      label: 'Clear Selected',
      onClick: (selectedIds) => {
        if (window.confirm(`Are you sure you want to delete ${selectedIds.length} log entries? This action cannot be undone.`)) {
          // Call API to delete selected logs
          onClearLogs?.(selectedIds);
          setSelectedLogs([]);
        }
      },
      variant: 'danger'
    }
  ];

  const tableActions = [
    {
      label: 'Refresh',
      onClick: onRefresh,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      )
    },
    {
      label: 'Export All',
      onClick: () => {
        const csvContent = "data:text/csv;charset=utf-8," 
          + "Timestamp,Level,Action,User,Details,Status\n"
          + logs.map(log => 
            `"${formatDate(log.timestamp)}","${log.level}","${log.action}","${log.user?.name || 'System'}","${log.details || log.message}","${log.status || 'completed'}"`
          ).join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      label: 'Clear All',
      onClick: () => {
        if (window.confirm('Are you sure you want to clear all audit logs? This action cannot be undone.')) {
          onClearLogs?.();
        }
      },
      variant: 'danger',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      )
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Audit Logs</h2>
            <p className="text-sm text-gray-600 mt-1">
              Monitor system activities, user actions, and security events
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {/* Filters */}
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {levelOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {actionOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            {/* Actions */}
            {tableActions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className={`inline-flex items-center px-3 py-2 border shadow-sm text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  action.variant === 'danger'
                    ? 'border-red-300 text-red-700 bg-white hover:bg-red-50'
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                {action.icon}
                <span className="ml-2">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <Table
        data={logs}
        columns={columns}
        loading={loading}
        selectable={true}
        selectedRows={selectedLogs}
        onSelectionChange={setSelectedLogs}
        bulkActions={bulkActions}
        searchable={true}
        searchFields={['action', 'user.name', 'user.email', 'details', 'message']}
        sortable={true}
        defaultSort={{ key: 'timestamp', direction: 'desc' }}
        filterable={true}
        filters={[
          {
            key: 'level',
            label: 'Level',
            options: levelOptions.slice(1), // Exclude "All Levels"
            value: filterLevel
          },
          {
            key: 'action',
            label: 'Action',
            options: actionOptions.slice(1), // Exclude "All Actions"
            value: filterAction
          }
        ]}
        pagination={{
          enabled: true,
          pageSize: 25,
          showSizeChanger: true,
          pageSizeOptions: [25, 50, 100]
        }}
        emptyState={{
          title: 'No audit logs found',
          description: 'No system activities have been recorded yet.',
          action: {
            label: 'Refresh',
            onClick: onRefresh
          }
        }}
      />
    </div>
  );
};

export default AuditLog;