/**
 * UserTable Component
 * Enhanced table component for managing users in admin panel
 */

import React, { useState, useMemo } from 'react';
import Table from '../ui/Table';
import { formatDate, formatCurrency } from '../../utils/formatters';

const UserTable = ({ 
  users = [],
  loading = false,
  onUserSelect,
  onUserEdit,
  onUserBlock,
  onUserDelete,
  onRefresh
}) => {
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Table columns configuration
  const columns = useMemo(() => [
    {
      key: 'avatar',
      title: '',
      width: '60px',
      render: (user) => (
        <div className="flex justify-center">
          {user.avatar ? (
            <img 
              src={user.avatar} 
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'name',
      title: 'User',
      sortable: true,
      render: (user) => (
        <div>
          <div className="font-semibold text-gray-900">{user.name}</div>
          <div className="text-sm text-gray-500">{user.email}</div>
        </div>
      )
    },
    {
      key: 'role',
      title: 'Role',
      sortable: true,
      render: (user) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          user.role === 'admin' 
            ? 'bg-purple-100 text-purple-800'
            : user.role === 'host'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {user.role}
        </span>
      )
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (user) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          user.status === 'active'
            ? 'bg-green-100 text-green-800'
            : user.status === 'blocked'
            ? 'bg-red-100 text-red-800'
            : user.status === 'pending'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {user.status}
        </span>
      )
    },
    {
      key: 'listings',
      title: 'Listings',
      sortable: true,
      render: (user) => (
        <div className="text-center">
          <div className="font-semibold text-gray-900">{user.listingsCount || 0}</div>
          <div className="text-xs text-gray-500">
            {user.activeListings || 0} active
          </div>
        </div>
      )
    },
    {
      key: 'revenue',
      title: 'Revenue',
      sortable: true,
      render: (user) => (
        <div className="text-right">
          <div className="font-semibold text-gray-900">
            {formatCurrency(user.totalRevenue || 0)}
          </div>
          <div className="text-xs text-gray-500">
            {user.bookingsCount || 0} bookings
          </div>
        </div>
      )
    },
    {
      key: 'rating',
      title: 'Rating',
      sortable: true,
      render: (user) => (
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1">
            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="font-semibold">
              {user.averageRating?.toFixed(1) || 'N/A'}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            {user.reviewsCount || 0} reviews
          </div>
        </div>
      )
    },
    {
      key: 'joinDate',
      title: 'Join Date',
      sortable: true,
      render: (user) => (
        <div className="text-sm text-gray-600">
          {formatDate(user.createdAt)}
        </div>
      )
    },
    {
      key: 'lastActive',
      title: 'Last Active',
      sortable: true,
      render: (user) => (
        <div className="text-sm text-gray-600">
          {user.lastActive ? formatDate(user.lastActive) : 'Never'}
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      width: '120px',
      render: (user) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onUserEdit?.(user)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            title="Edit user"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          
          <button
            onClick={() => onUserBlock?.(user)}
            className={`p-1 rounded ${
              user.status === 'blocked' 
                ? 'text-green-600 hover:bg-green-50' 
                : 'text-red-600 hover:bg-red-50'
            }`}
            title={user.status === 'blocked' ? 'Unblock user' : 'Block user'}
          >
            {user.status === 'blocked' ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
              </svg>
            )}
          </button>
          
          <button
            onClick={() => onUserDelete?.(user)}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
            title="Delete user"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )
    }
  ], [onUserEdit, onUserBlock, onUserDelete]);

  // Handle selection changes
  const handleSelectionChange = (selection) => {
    setSelectedUsers(selection);
    onUserSelect?.(selection);
  };

  // Bulk actions
  const bulkActions = [
    {
      label: 'Block Selected',
      onClick: (selectedIds) => {
        selectedIds.forEach(id => {
          const user = users.find(u => u._id === id);
          if (user && user.status !== 'blocked') {
            onUserBlock?.(user);
          }
        });
        setSelectedUsers([]);
      },
      variant: 'warning'
    },
    {
      label: 'Delete Selected',
      onClick: (selectedIds) => {
        if (window.confirm(`Are you sure you want to delete ${selectedIds.length} user(s)?`)) {
          selectedIds.forEach(id => {
            const user = users.find(u => u._id === id);
            if (user) {
              onUserDelete?.(user);
            }
          });
          setSelectedUsers([]);
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
      label: 'Export',
      onClick: () => {
        // Export functionality
        const csvContent = "data:text/csv;charset=utf-8," 
          + "Name,Email,Role,Status,Listings,Revenue,Rating,Join Date\n"
          + users.map(user => 
            `"${user.name}","${user.email}","${user.role}","${user.status}",${user.listingsCount || 0},"${formatCurrency(user.totalRevenue || 0)}",${user.averageRating || 0},"${formatDate(user.createdAt)}"`
          ).join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `users_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Users Management</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage and monitor user accounts, roles, and activities
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {tableActions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {action.icon}
                <span className="ml-2">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <Table
        data={users}
        columns={columns}
        loading={loading}
        selectable={true}
        selectedRows={selectedUsers}
        onSelectionChange={handleSelectionChange}
        bulkActions={bulkActions}
        searchable={true}
        searchFields={['name', 'email', 'role']}
        sortable={true}
        pagination={{
          enabled: true,
          pageSize: 10,
          showSizeChanger: true
        }}
        emptyState={{
          title: 'No users found',
          description: 'There are no users to display at the moment.',
          action: {
            label: 'Refresh',
            onClick: onRefresh
          }
        }}
      />
    </div>
  );
};

export default UserTable;