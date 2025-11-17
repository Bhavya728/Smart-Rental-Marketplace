/**
 * ListingTable Component
 * Enhanced table component for managing listings in admin panel
 */

import React, { useState, useMemo } from 'react';
import Table from '../ui/Table';
import { formatDate, formatCurrency } from '../../utils/formatters';

const ListingTable = ({ 
  listings = [],
  loading = false,
  onListingSelect,
  onListingEdit,
  onListingApprove,
  onListingReject,
  onListingDelete,
  onRefresh
}) => {
  const [selectedListings, setSelectedListings] = useState([]);

  // Table columns configuration
  const columns = useMemo(() => [
    {
      key: 'image',
      title: '',
      width: '80px',
      render: (listing) => (
        <div className="flex justify-center">
          {listing.images?.[0] ? (
            <img 
              src={listing.images[0]} 
              alt={listing.title}
              className="w-16 h-12 rounded-lg object-cover"
            />
          ) : (
            <div className="w-16 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'title',
      title: 'Listing',
      sortable: true,
      render: (listing) => (
        <div>
          <div className="font-semibold text-gray-900 line-clamp-1">{listing.title}</div>
          <div className="text-sm text-gray-500 line-clamp-1">{listing.location?.address}</div>
          <div className="text-xs text-gray-400 mt-1">
            ID: {listing._id?.slice(-8)}
          </div>
        </div>
      )
    },
    {
      key: 'host',
      title: 'Host',
      sortable: true,
      render: (listing) => (
        <div className="flex items-center space-x-2">
          {listing.host?.avatar ? (
            <img 
              src={listing.host.avatar} 
              alt={listing.host.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
              {listing.host?.name?.charAt(0).toUpperCase() || 'H'}
            </div>
          )}
          <div>
            <div className="font-medium text-gray-900 text-sm">{listing.host?.name}</div>
            <div className="text-xs text-gray-500">{listing.host?.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'category',
      title: 'Category',
      sortable: true,
      render: (listing) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {listing.category}
        </span>
      )
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (listing) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          listing.status === 'published'
            ? 'bg-green-100 text-green-800'
            : listing.status === 'draft'
            ? 'bg-gray-100 text-gray-800'
            : listing.status === 'pending'
            ? 'bg-yellow-100 text-yellow-800'
            : listing.status === 'rejected'
            ? 'bg-red-100 text-red-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {listing.status}
        </span>
      )
    },
    {
      key: 'pricing',
      title: 'Pricing',
      sortable: true,
      render: (listing) => (
        <div className="text-right">
          <div className="font-semibold text-gray-900">
            {formatCurrency(listing.pricing?.basePrice || 0)}
          </div>
          <div className="text-xs text-gray-500">
            per {listing.pricing?.unit || 'day'}
          </div>
        </div>
      )
    },
    {
      key: 'bookings',
      title: 'Bookings',
      sortable: true,
      render: (listing) => (
        <div className="text-center">
          <div className="font-semibold text-gray-900">{listing.bookingsCount || 0}</div>
          <div className="text-xs text-gray-500">
            {listing.activeBookings || 0} active
          </div>
        </div>
      )
    },
    {
      key: 'revenue',
      title: 'Revenue',
      sortable: true,
      render: (listing) => (
        <div className="text-right">
          <div className="font-semibold text-gray-900">
            {formatCurrency(listing.totalRevenue || 0)}
          </div>
          <div className="text-xs text-gray-500">
            total earned
          </div>
        </div>
      )
    },
    {
      key: 'rating',
      title: 'Rating',
      sortable: true,
      render: (listing) => (
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1">
            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="font-semibold">
              {listing.averageRating?.toFixed(1) || 'N/A'}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            {listing.reviewsCount || 0} reviews
          </div>
        </div>
      )
    },
    {
      key: 'created',
      title: 'Created',
      sortable: true,
      render: (listing) => (
        <div className="text-sm text-gray-600">
          {formatDate(listing.createdAt)}
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      width: '140px',
      render: (listing) => (
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onListingEdit?.(listing)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            title="Edit listing"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          
          {listing.status === 'pending' && (
            <>
              <button
                onClick={() => onListingApprove?.(listing)}
                className="p-1 text-green-600 hover:bg-green-50 rounded"
                title="Approve listing"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
              
              <button
                onClick={() => onListingReject?.(listing)}
                className="p-1 text-red-600 hover:bg-red-50 rounded"
                title="Reject listing"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </>
          )}
          
          <button
            onClick={() => onListingDelete?.(listing)}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
            title="Delete listing"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )
    }
  ], [onListingEdit, onListingApprove, onListingReject, onListingDelete]);

  // Handle selection changes
  const handleSelectionChange = (selection) => {
    setSelectedListings(selection);
    onListingSelect?.(selection);
  };

  // Bulk actions
  const bulkActions = [
    {
      label: 'Approve Selected',
      onClick: (selectedIds) => {
        selectedIds.forEach(id => {
          const listing = listings.find(l => l._id === id);
          if (listing && listing.status === 'pending') {
            onListingApprove?.(listing);
          }
        });
        setSelectedListings([]);
      },
      variant: 'success'
    },
    {
      label: 'Reject Selected',
      onClick: (selectedIds) => {
        selectedIds.forEach(id => {
          const listing = listings.find(l => l._id === id);
          if (listing && listing.status === 'pending') {
            onListingReject?.(listing);
          }
        });
        setSelectedListings([]);
      },
      variant: 'warning'
    },
    {
      label: 'Delete Selected',
      onClick: (selectedIds) => {
        if (window.confirm(`Are you sure you want to delete ${selectedIds.length} listing(s)?`)) {
          selectedIds.forEach(id => {
            const listing = listings.find(l => l._id === id);
            if (listing) {
              onListingDelete?.(listing);
            }
          });
          setSelectedListings([]);
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
          + "Title,Host,Category,Status,Price,Bookings,Revenue,Rating,Created\n"
          + listings.map(listing => 
            `"${listing.title}","${listing.host?.name}","${listing.category}","${listing.status}","${formatCurrency(listing.pricing?.basePrice || 0)}",${listing.bookingsCount || 0},"${formatCurrency(listing.totalRevenue || 0)}",${listing.averageRating || 0},"${formatDate(listing.createdAt)}"`
          ).join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `listings_${new Date().toISOString().split('T')[0]}.csv`);
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

  // Filter options for status
  const statusFilters = [
    { label: 'All', value: '' },
    { label: 'Published', value: 'published' },
    { label: 'Pending', value: 'pending' },
    { label: 'Draft', value: 'draft' },
    { label: 'Rejected', value: 'rejected' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Listings Management</h2>
            <p className="text-sm text-gray-600 mt-1">
              Review, approve, and manage all property listings on the platform
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
        data={listings}
        columns={columns}
        loading={loading}
        selectable={true}
        selectedRows={selectedListings}
        onSelectionChange={handleSelectionChange}
        bulkActions={bulkActions}
        searchable={true}
        searchFields={['title', 'host.name', 'category', 'location.address']}
        sortable={true}
        filterable={true}
        filters={[
          {
            key: 'status',
            label: 'Status',
            options: statusFilters
          }
        ]}
        pagination={{
          enabled: true,
          pageSize: 10,
          showSizeChanger: true
        }}
        emptyState={{
          title: 'No listings found',
          description: 'There are no listings to display at the moment.',
          action: {
            label: 'Refresh',
            onClick: onRefresh
          }
        }}
      />
    </div>
  );
};

export default ListingTable;