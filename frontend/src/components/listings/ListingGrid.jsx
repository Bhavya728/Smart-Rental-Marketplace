import React from 'react';
import ListingCard from './ListingCard';

const ListingGrid = ({ 
  listings = [], 
  loading = false,
  viewMode = 'grid',
  showOwnerActions = false,
  onFavorite,
  onEdit,
  onDelete,
  columns = 4,
  className = ""
}) => {
  if (loading) {
    return (
      <div className={`${className}`}>
        <div className={`${
          viewMode === 'grid' 
            ? `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(columns, 4)} gap-6`
            : 'space-y-6'
        }`}>
          {[...Array(8)].map((_, index) => (
            <div key={index} className="animate-pulse">
              {viewMode === 'grid' ? (
                <div className="bg-gray-300 h-80 rounded-lg"></div>
              ) : (
                <div className="bg-gray-300 h-48 rounded-lg"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!listings || listings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📦</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No listings found</h3>
        <p className="text-gray-600">
          {showOwnerActions 
            ? "You haven't created any listings yet." 
            : "No listings match your criteria."
          }
        </p>
      </div>
    );
  }

  const getGridClasses = () => {
    if (viewMode === 'list') {
      return 'space-y-6';
    }

    // Responsive grid based on columns prop
    const colClasses = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
      5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5',
      6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6'
    };

    return `grid ${colClasses[columns] || colClasses[4]} gap-6`;
  };

  return (
    <div className={className}>
      {/* Summary */}
      <div className="mb-4 text-sm text-gray-600">
        {listings.length} listing{listings.length !== 1 ? 's' : ''} found
      </div>

      {/* Grid/List */}
      <div className={getGridClasses()}>
        {listings.map((listing) => (
          <ListingCard
            key={listing._id || listing.id}
            listing={listing}
            viewMode={viewMode}
            showOwnerActions={showOwnerActions}
            onFavorite={onFavorite}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default ListingGrid;