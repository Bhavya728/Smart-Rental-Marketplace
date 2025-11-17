import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bookmark, 
  Search, 
  Bell, 
  Edit2, 
  Trash2, 
  Plus, 
  Star,
  MapPin,
  DollarSign,
  Calendar,
  Settings
} from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { cn } from '../../utils/cn';
import { useAuth } from '../../contexts/AuthContext';

const SavedSearches = ({
  className = "",
  onSearchSelect,
  onCreateSearch,
  onEditSearch,
  onDeleteSearch,
  compact = false
}) => {
  const { user } = useAuth();
  const [savedSearches, setSavedSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSearch, setEditingSearch] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Mock saved searches data - in real app, this would come from API
  const mockSavedSearches = [
    {
      id: '1',
      name: 'Camera Equipment NYC',
      query: 'camera',
      filters: {
        category: 'electronics',
        location: 'New York, NY',
        maxPrice: 100,
        features: ['wifi']
      },
      alertsEnabled: true,
      matchCount: 23,
      lastChecked: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
      newMatches: 3
    },
    {
      id: '2',
      name: 'Weekend Tools',
      query: 'drill power tools',
      filters: {
        category: 'tools',
        location: 'Within 10 miles',
        availableWeekends: true,
        minRating: 4.0
      },
      alertsEnabled: false,
      matchCount: 15,
      lastChecked: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
      newMatches: 0
    },
    {
      id: '3',
      name: 'Budget Furniture',
      query: '',
      filters: {
        category: 'furniture',
        maxPrice: 50,
        deliveryAvailable: true
      },
      alertsEnabled: true,
      matchCount: 8,
      lastChecked: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      newMatches: 1
    }
  ];

  useEffect(() => {
    // Simulate loading saved searches
    const timer = setTimeout(() => {
      setSavedSearches(mockSavedSearches);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleSearchSelect = (search) => {
    onSearchSelect?.({
      query: search.query,
      filters: search.filters
    });
  };

  const handleToggleAlerts = (searchId) => {
    setSavedSearches(prev => 
      prev.map(search => 
        search.id === searchId 
          ? { ...search, alertsEnabled: !search.alertsEnabled }
          : search
      )
    );
  };

  const handleDeleteSearch = (searchId) => {
    setSavedSearches(prev => prev.filter(search => search.id !== searchId));
    onDeleteSearch?.(searchId);
  };

  const formatLastChecked = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  const formatFilters = (filters) => {
    const parts = [];
    if (filters.category) parts.push(filters.category);
    if (filters.location) parts.push(filters.location);
    if (filters.maxPrice) parts.push(`Under $${filters.maxPrice}`);
    if (filters.minRating) parts.push(`${filters.minRating}+ stars`);
    return parts.slice(0, 3); // Show only first 3 filters
  };

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse">
            <Card className="p-4">
              <div className="space-y-3">
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                <div className="flex space-x-2">
                  <div className="h-6 bg-gray-300 rounded w-16"></div>
                  <div className="h-6 bg-gray-300 rounded w-20"></div>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>
    );
  }

  if (compact) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">Saved Searches</h3>
          <Button size="sm" variant="ghost" onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        {savedSearches.slice(0, 3).map((search) => (
          <motion.button
            key={search.id}
            onClick={() => handleSearchSelect(search)}
            className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {search.name}
                </p>
                <p className="text-xs text-gray-500">
                  {search.matchCount} matches
                  {search.newMatches > 0 && (
                    <span className="ml-1 text-primary font-medium">
                      (+{search.newMatches} new)
                    </span>
                  )}
                </p>
              </div>
              {search.alertsEnabled && (
                <Bell className="w-4 h-4 text-primary flex-shrink-0" />
              )}
            </div>
          </motion.button>
        ))}

        {savedSearches.length > 3 && (
          <Button variant="ghost" size="sm" className="w-full">
            View all ({savedSearches.length})
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Saved Searches</h2>
          <p className="text-gray-600">
            Keep track of your searches and get alerts for new matches
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Search
        </Button>
      </div>

      {/* Saved Searches List */}
      <div className="space-y-4">
        <AnimatePresence>
          {savedSearches.map((search) => (
            <motion.div
              key={search.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="group"
            >
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {/* Search Name & Query */}
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {search.name}
                      </h3>
                      {search.newMatches > 0 && (
                        <Badge variant="primary">
                          {search.newMatches} new
                        </Badge>
                      )}
                    </div>
                    
                    {search.query && (
                      <div className="flex items-center text-sm text-gray-600 mb-3">
                        <Search className="w-4 h-4 mr-1" />
                        <span>"{search.query}"</span>
                      </div>
                    )}

                    {/* Filters */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {formatFilters(search.filters).map((filter, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                        >
                          {filter}
                        </span>
                      ))}
                      {Object.keys(search.filters).length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{Object.keys(search.filters).length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{search.matchCount} matches</span>
                      <span>•</span>
                      <span>Updated {formatLastChecked(search.lastChecked)}</span>
                      <span>•</span>
                      <span>Created {formatLastChecked(search.createdAt)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleToggleAlerts(search.id)}
                      className={cn(
                        search.alertsEnabled && "text-primary"
                      )}
                    >
                      <Bell className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingSearch(search)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteSearch(search.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    {search.alertsEnabled ? (
                      <div className="flex items-center text-sm text-green-600">
                        <Bell className="w-4 h-4 mr-1" />
                        Alerts enabled
                      </div>
                    ) : (
                      <div className="flex items-center text-sm text-gray-500">
                        <Bell className="w-4 h-4 mr-1 opacity-50" />
                        Alerts off
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSearchSelect(search)}
                    >
                      <Search className="w-4 h-4 mr-1" />
                      Search Again
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSearchSelect(search)}
                    >
                      View Results
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {savedSearches.length === 0 && (
          <Card className="p-8 text-center">
            <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No saved searches yet
            </h3>
            <p className="text-gray-600 mb-4">
              Save your searches to get alerts when new matching items are posted
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Search
            </Button>
          </Card>
        )}
      </div>

      {/* Create/Edit Form Modal would go here */}
      {(showCreateForm || editingSearch) && (
        <SearchFormModal
          search={editingSearch}
          onClose={() => {
            setShowCreateForm(false);
            setEditingSearch(null);
          }}
          onSave={(searchData) => {
            if (editingSearch) {
              setSavedSearches(prev => 
                prev.map(s => s.id === editingSearch.id ? { ...s, ...searchData } : s)
              );
            } else {
              const newSearch = {
                ...searchData,
                id: Date.now().toString(),
                matchCount: 0,
                lastChecked: new Date(),
                createdAt: new Date(),
                newMatches: 0
              };
              setSavedSearches(prev => [...prev, newSearch]);
            }
            setShowCreateForm(false);
            setEditingSearch(null);
          }}
        />
      )}
    </div>
  );
};

// Modal for creating/editing saved searches
const SearchFormModal = ({ search, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: search?.name || '',
    query: search?.query || '',
    alertsEnabled: search?.alertsEnabled ?? true,
    filters: search?.filters || {}
  });

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {search ? 'Edit Search' : 'Save Search'}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="e.g., Camera Equipment NYC"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Query
            </label>
            <input
              type="text"
              value={formData.query}
              onChange={(e) => setFormData(prev => ({ ...prev, query: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Optional search terms"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="alerts"
              checked={formData.alertsEnabled}
              onChange={(e) => setFormData(prev => ({ ...prev, alertsEnabled: e.target.checked }))}
              className="mr-2"
            />
            <label htmlFor="alerts" className="text-sm text-gray-700">
              Send me email alerts for new matches
            </label>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!formData.name.trim()}>
            {search ? 'Update' : 'Save'} Search
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default SavedSearches;