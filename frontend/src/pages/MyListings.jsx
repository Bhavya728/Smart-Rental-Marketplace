import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Grid, List, Eye, Edit, Trash2, MoreVertical } from 'lucide-react';
import ListingGrid from '../components/listings/ListingGrid';
import { StatusTag, CategoryTag } from '../components/ui/Tag';
import Dropdown from '../components/ui/Dropdown';
import listingService from '../services/listingService';

const MyListings = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    draft: 0,
    rented: 0,
    paused: 0
  });

  useEffect(() => {
    loadListings();
    loadStats();
  }, [statusFilter, categoryFilter, sortBy, sortOrder]);

  const loadListings = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = {
        sortBy,
        sortOrder
      };

      if (statusFilter) {
        filters.status = statusFilter;
      }

      if (categoryFilter) {
        filters.category = categoryFilter;
      }

      if (searchQuery.trim()) {
        filters.search = searchQuery.trim();
      }

      const response = await listingService.getUserListings();
      
      let filteredListings = response.data || [];
      
      // Apply client-side filtering for search and other filters
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filteredListings = filteredListings.filter(listing => 
          listing.title?.toLowerCase().includes(query) ||
          listing.description?.toLowerCase().includes(query) ||
          listing.category?.toLowerCase().includes(query)
        );
      }

      if (statusFilter) {
        filteredListings = filteredListings.filter(listing => listing.status === statusFilter);
      }

      if (categoryFilter) {
        filteredListings = filteredListings.filter(listing => listing.category === categoryFilter);
      }

      // Sort listings
      filteredListings.sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];

        if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }

        if (sortOrder === 'desc') {
          return bValue > aValue ? 1 : -1;
        } else {
          return aValue > bValue ? 1 : -1;
        }
      });

      setListings(filteredListings);

    } catch (err) {
      console.error('Error loading listings:', err);
      setError('Failed to load your listings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await listingService.getUserStats();
      setStats(response.data || stats);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadListings();
  };

  const handleEdit = (listingId) => {
    navigate(`/listings/${listingId}/edit`);
  };

  const handleDelete = async (listingId) => {
    try {
      await listingService.deleteListing(listingId);
      setListings(listings.filter(listing => listing._id !== listingId));
      loadStats(); // Refresh stats
    } catch (err) {
      console.error('Error deleting listing:', err);
      alert('Failed to delete listing. Please try again.');
    }
  };

  const handleStatusChange = async (listingId, newStatus) => {
    try {
      if (newStatus === 'active') {
        await listingService.publishListing(listingId);
      } else {
        await listingService.updateListing(listingId, { status: newStatus });
      }
      
      // Update local state
      setListings(listings.map(listing => 
        listing._id === listingId 
          ? { ...listing, status: newStatus }
          : listing
      ));
      
      loadStats(); // Refresh stats
    } catch (err) {
      console.error('Error updating listing status:', err);
      alert('Failed to update listing status. Please try again.');
    }
  };

  const categories = listingService.getAllCategoriesFlat();

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'active', label: 'Active' },
    { value: 'rented', label: 'Rented' },
    { value: 'paused', label: 'Paused' },
    { value: 'archived', label: 'Archived' }
  ];

  const sortOptions = [
    { value: 'createdAt-desc', label: 'Newest First' },
    { value: 'createdAt-asc', label: 'Oldest First' },
    { value: 'updatedAt-desc', label: 'Recently Updated' },
    { value: 'title-asc', label: 'Name A-Z' },
    { value: 'title-desc', label: 'Name Z-A' },
    { value: 'dailyRate-desc', label: 'Price: High to Low' },
    { value: 'dailyRate-asc', label: 'Price: Low to High' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Listings</h1>
          <p className="text-gray-600">Manage your rental items and track performance</p>
        </div>
        
        <Link
          to="/create-listing"
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Create Listing</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Listings</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          <div className="text-sm text-gray-600">Active</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.rented}</div>
          <div className="text-sm text-gray-600">Rented</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="text-2xl font-bold text-gray-600">{stats.draft}</div>
          <div className="text-sm text-gray-600">Drafts</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="text-2xl font-bold text-yellow-600">{stats.paused}</div>
          <div className="text-sm text-gray-600">Paused</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/40 border border-gray-200/60 p-8 mb-10">
        {/* Search */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-6 h-6" />
              <input
                type="text"
                placeholder="Search your listings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-4 border-2 border-gray-300/70 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-lg font-medium bg-white/80 backdrop-blur-sm shadow-inner"
              />
            </div>
            <button
              type="submit"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 flex items-center gap-3 font-semibold transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl"
            >
              <Search className="w-5 h-5" />
              Search
            </button>
          </div>
        </form>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Dropdown
            options={statusOptions}
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="Filter by status"
          />
          
          <Dropdown
            options={[
              { value: '', label: 'All Categories' },
              ...categories.map(cat => ({ value: cat.value, label: cat.label }))
            ]}
            value={categoryFilter}
            onChange={setCategoryFilter}
            placeholder="Filter by category"
          />
          
          <Dropdown
            options={sortOptions}
            value={`${sortBy}-${sortOrder}`}
            onChange={(value) => {
              const [field, order] = value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
          />
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {listings.length} listing{listings.length !== 1 ? 's' : ''}
            </span>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Listings */}
      {loading ? (
        <ListingGrid loading={true} viewMode={viewMode} />
      ) : (
        <>
          {listings.length > 0 ? (
            <ListingGrid
              listings={listings}
              viewMode={viewMode}
              showOwnerActions={true}
              onEdit={handleEdit}
              onDelete={handleDelete}
              className="mb-8"
            />
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No listings found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || statusFilter || categoryFilter
                  ? "No listings match your current filters."
                  : "You haven't created any listings yet. Start earning by listing your first item!"
                }
              </p>
              
              {!searchQuery && !statusFilter && !categoryFilter ? (
                <Link
                  to="/create-listing"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Your First Listing</span>
                </Link>
              ) : (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('');
                    setCategoryFilter('');
                    setSortBy('createdAt');
                    setSortOrder('desc');
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* Quick Actions Help */}
      {listings.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Quick Actions:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Click the edit icon to modify your listing details</li>
            <li>• Use the status dropdown to activate, pause, or archive listings</li>
            <li>• View listing performance and booking history in the detail view</li>
            <li>• Keep your photos and descriptions up to date for better visibility</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default MyListings;