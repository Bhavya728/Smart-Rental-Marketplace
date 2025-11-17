/**
 * Listings Admin Page
 * Comprehensive listing management interface
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import adminService from '../../services/adminService';
import ListingTable from '../../components/admin/ListingTable';
import StatCard from '../../components/ui/StatCard';

const Listings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [listingStats, setListingStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedListings, setSelectedListings] = useState([]);

  // Check admin permissions
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/unauthorized');
      return;
    }
    
    fetchListings();
    fetchListingStats();
  }, [user, navigate]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const response = await adminService.getListings();
      setListings(response.data.listings || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching listings:', error);
      setError('Failed to load listings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchListingStats = async () => {
    try {
      const response = await adminService.getListingStats();
      setListingStats(response.data || {});
    } catch (error) {
      console.error('Error fetching listing stats:', error);
    }
  };

  const handleRefresh = () => {
    fetchListings();
    fetchListingStats();
  };

  const handleListingEdit = (listingData) => {
    navigate(`/admin/listings/${listingData._id}/edit`);
  };

  const handleListingApprove = async (listingData) => {
    try {
      await adminService.updateListingStatus(listingData._id, { status: 'published' });
      
      // Update local state
      setListings(listings.map(l => 
        l._id === listingData._id 
          ? { ...l, status: 'published' }
          : l
      ));
      
      console.log('Listing approved successfully');
    } catch (error) {
      console.error('Error approving listing:', error);
    }
  };

  const handleListingReject = async (listingData) => {
    const reason = window.prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      await adminService.updateListingStatus(listingData._id, { 
        status: 'rejected',
        rejectionReason: reason
      });
      
      // Update local state
      setListings(listings.map(l => 
        l._id === listingData._id 
          ? { ...l, status: 'rejected', rejectionReason: reason }
          : l
      ));
      
      console.log('Listing rejected successfully');
    } catch (error) {
      console.error('Error rejecting listing:', error);
    }
  };

  const handleListingDelete = async (listingData) => {
    if (window.confirm(`Are you sure you want to delete listing "${listingData.title}"? This action cannot be undone.`)) {
      try {
        await adminService.deleteListing(listingData._id);
        setListings(listings.filter(l => l._id !== listingData._id));
        console.log('Listing deleted successfully');
      } catch (error) {
        console.error('Error deleting listing:', error);
      }
    }
  };

  const handleListingSelect = (selection) => {
    setSelectedListings(selection);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Listings</h3>
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
                Listing Management
              </h1>
              <p className="text-gray-600 mt-2">
                Review, approve, and manage all property listings
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/listings/create')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New Listing
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

        {/* Listing Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Listings"
            value={listingStats.total?.toLocaleString() || '0'}
            subtitle="All listings"
            trend={listingStats.growthRate > 0 ? 'up' : listingStats.growthRate < 0 ? 'down' : 'neutral'}
            trendValue={`${Math.abs(listingStats.growthRate || 0)}%`}
            trendLabel="growth rate"
            variant="default"
            loading={loading}
            icon={() => (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            )}
          />
          
          <StatCard
            title="Published"
            value={listingStats.published?.toLocaleString() || '0'}
            subtitle="Live listings"
            trend="up"
            trendValue={listingStats.publishedPercentage?.toFixed(1) || '0'}
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
            title="Pending Approval"
            value={listingStats.pending?.toLocaleString() || '0'}
            subtitle="Awaiting review"
            trend={listingStats.pending > 0 ? 'warning' : 'positive'}
            variant="warning"
            loading={loading}
            icon={() => (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          />
          
          <StatCard
            title="Total Revenue"
            value={`$${(listingStats.totalRevenue || 0).toLocaleString()}`}
            subtitle="From all listings"
            trend={listingStats.revenueGrowth > 0 ? 'up' : 'down'}
            trendValue={`${Math.abs(listingStats.revenueGrowth || 0)}%`}
            trendLabel="vs last month"
            variant="info"
            loading={loading}
            icon={() => (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            )}
          />
        </div>

        {/* Priority Actions */}
        {listingStats.pending > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-yellow-800">
                    {listingStats.pending} Listings Need Your Attention
                  </h3>
                  <p className="text-yellow-700">
                    Review and approve pending listings to help hosts get their properties listed faster.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  // Scroll to table and filter by pending
                  const table = document.querySelector('[data-testid="listing-table"]');
                  if (table) {
                    table.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Review Now
              </button>
            </div>
          </div>
        )}

        {/* Listing Table */}
        <div data-testid="listing-table">
          <ListingTable
            listings={listings}
            loading={loading}
            onListingSelect={handleListingSelect}
            onListingEdit={handleListingEdit}
            onListingApprove={handleListingApprove}
            onListingReject={handleListingReject}
            onListingDelete={handleListingDelete}
            onRefresh={handleRefresh}
          />
        </div>
      </div>
    </div>
  );
};

export default Listings;