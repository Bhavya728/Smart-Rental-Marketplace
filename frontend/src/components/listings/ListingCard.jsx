import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Star, Heart, Share2, Eye } from 'lucide-react';
import listingService from '../../services/listingService';

const ListingCard = ({ listing, onFavorite, onShare, showOwnerActions = false, onEdit, onDelete }) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorited(!isFavorited);
    if (onFavorite) {
      onFavorite(listing._id || listing.id, !isFavorited);
    }
  };

  const handleShareClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowShareMenu(!showShareMenu);
  };

  const handleEditClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit) {
      onEdit(listing._id || listing.id);
    }
  };

  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete && window.confirm('Are you sure you want to delete this listing?')) {
      onDelete(listing._id || listing.id);
    }
  };

  const getStatusBadge = () => {
    const statusConfig = {
      draft: { 
        gradient: 'bg-gradient-to-r from-gray-500 to-gray-600', 
        text: 'Draft',
        shadow: 'shadow-gray-500/25'
      },
      active: { 
        gradient: 'bg-gradient-to-r from-green-500 to-emerald-600', 
        text: 'Active',
        shadow: 'shadow-green-500/25'
      },
      rented: { 
        gradient: 'bg-gradient-to-r from-blue-500 to-blue-600', 
        text: 'Rented',
        shadow: 'shadow-blue-500/25'
      },
      paused: { 
        gradient: 'bg-gradient-to-r from-yellow-500 to-orange-500', 
        text: 'Paused',
        shadow: 'shadow-yellow-500/25'
      },
      archived: { 
        gradient: 'bg-gradient-to-r from-red-500 to-red-600', 
        text: 'Archived',
        shadow: 'shadow-red-500/25'
      }
    };

    const config = statusConfig[listing.status] || statusConfig.active;
    
    return (
      <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold text-white backdrop-blur-sm border border-white/20 shadow-lg ${config.gradient} ${config.shadow}`}>
        {config.text}
      </span>
    );
  };

  const getAvailabilityText = () => {
    if (listing.status === 'rented') {
      return 'Currently Rented';
    }
    
    if (listing.availability?.availableFrom) {
      const availableDate = new Date(listing.availability.availableFrom);
      const today = new Date();
      
      if (availableDate > today) {
        return `Available from ${availableDate.toLocaleDateString()}`;
      }
    }
    
    return 'Available Now';
  };

  const getPriceDisplay = () => {
    const prices = [];
    
    if (listing.dailyRate) {
      prices.push(`${listingService.formatPrice(listing.dailyRate, 'day')}`);
    }
    
    if (listing.weeklyRate) {
      prices.push(`${listingService.formatPrice(listing.weeklyRate, 'week')}`);
    }
    
    if (listing.monthlyRate) {
      prices.push(`${listingService.formatPrice(listing.monthlyRate, 'month')}`);
    }
    
    return prices.join(' • ');
  };

  const getImageUrl = () => {
    if (listing.images && listing.images.length > 0) {
      const primaryImage = listing.images.find(img => img.isPrimary) || listing.images[0];
      return primaryImage.secureUrl || primaryImage.url;
    }
    
    // Placeholder based on category
    const categoryIcon = listingService.getCategoryIcon(listing.category);
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="48" text-anchor="middle" dy="0.3em">${categoryIcon}</text>
      </svg>
    `)}`;
  };

  const formatLocation = () => {
    if (listing.location?.address) {
      const { city, state } = listing.location.address;
      return `${city}, ${state}`;
    }
    return 'Location not specified';
  };

  return (
    <div className="group relative">
      {/* Card Background with Gradient Border */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden group-hover:scale-[1.02]">
        <div className="relative">
          {/* Image Container with Enhanced Styling */}
          <div className="relative overflow-hidden">
            <div className="aspect-w-16 aspect-h-10 relative">
              <img
                src={getImageUrl()}
                alt={listing.title}
                className="w-full h-52 object-cover group-hover:scale-110 transition-transform duration-500"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            
            {/* Enhanced Overlay Actions with Better Touch Targets */}
            <div className="absolute top-3 right-3 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <button
                onClick={handleFavoriteClick}
                className={`p-3 sm:p-2.5 rounded-xl backdrop-blur-md border border-white/20 shadow-lg transition-all duration-300 hover:scale-110 min-w-[44px] min-h-[44px] sm:min-w-auto sm:min-h-auto flex items-center justify-center ${
                  isFavorited 
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-red-500/25' 
                    : 'bg-white/90 hover:bg-white text-gray-600 hover:text-red-500 shadow-black/10'
                }`}
              >
                <Heart className={`w-5 h-5 sm:w-4 sm:h-4 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
              
              <div className="relative">
                <button
                  onClick={handleShareClick}
                  className="p-3 sm:p-2.5 rounded-xl bg-white/90 backdrop-blur-md border border-white/20 hover:bg-white text-gray-600 hover:text-blue-500 transition-all duration-300 hover:scale-110 shadow-lg shadow-black/10 min-w-[44px] min-h-[44px] sm:min-w-auto sm:min-h-auto flex items-center justify-center"
                >
                  <Share2 className="w-5 h-5 sm:w-4 sm:h-4" />
                </button>
                
                {/* Enhanced Share Menu */}
                {showShareMenu && (
                  <div className="absolute top-full right-0 mt-2 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-white/20 py-2 z-20 min-w-[140px] animate-in slide-in-from-top-2 duration-200">
                    <button
                      onClick={() => {
                        if (listing._id || listing.id) {
                          navigator.clipboard.writeText(window.location.origin + `/listings/${listing._id || listing.id}`);
                        }
                        setShowShareMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-left hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 text-sm font-medium text-gray-700 hover:text-gray-900 transition-all duration-200"
                    >
                      Copy Link
                    </button>
                    <button
                      onClick={() => {
                        if (navigator.share && (listing._id || listing.id)) {
                          navigator.share({
                            title: listing.title,
                            url: window.location.origin + `/listings/${listing._id || listing.id}`
                          });
                        }
                        setShowShareMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-left hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 text-sm font-medium text-gray-700 hover:text-gray-900 transition-all duration-200"
                    >
                      Share
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Status Badge */}
            <div className="absolute top-3 left-3">
              {getStatusBadge()}
            </div>

            {/* Enhanced Category Badge */}
            <div className="absolute bottom-3 left-3">
              <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/95 backdrop-blur-sm text-gray-800 shadow-lg border border-white/20">
                <span className="mr-1.5 text-sm">{listingService.getCategoryIcon(listing.category)}</span>
                {listing.category}
              </span>
            </div>

            {/* Enhanced Owner Actions */}
            {showOwnerActions && (
              <div className="absolute bottom-3 right-3 flex space-x-2">
                <button
                  onClick={handleEditClick}
                  className="p-2.5 rounded-xl bg-white/95 backdrop-blur-md border border-white/20 hover:bg-white text-gray-600 hover:text-blue-500 transition-all duration-300 hover:scale-110 shadow-lg shadow-black/10"
                  title="Edit listing"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDeleteClick}
                  className="p-2.5 rounded-xl bg-white/95 backdrop-blur-md border border-white/20 hover:bg-white text-gray-600 hover:text-red-500 transition-all duration-300 hover:scale-110 shadow-lg shadow-black/10"
                  title="Delete listing"
                >
                  <span className="w-4 h-4 flex items-center justify-center font-bold text-sm">×</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {listing && (listing._id || listing.id) ? (
          <Link to={`/listings/${listing._id || listing.id}`} className="block">
            <div className="p-6">
              {/* Enhanced Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300 leading-tight">
                {listing.title}
              </h3>

              {/* Enhanced Location */}
              <div className="flex items-center text-gray-600 mb-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 mr-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium">{formatLocation()}</span>
              </div>

              {/* Enhanced Description */}
              <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                {listing.description}
              </p>

              {/* Enhanced Features */}
              {listing.features && listing.features.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {listing.features.slice(0, 3).map((feature, index) => (
                    <span
                      key={`${listing._id || listing.id}-feature-${index}-${feature}`}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border border-blue-200/50 hover:from-blue-200 hover:to-purple-200 transition-colors duration-200"
                    >
                      {feature}
                    </span>
                  ))}
                  {listing.features.length > 3 && (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-300/50">
                      +{listing.features.length - 3} more
                    </span>
                  )}
                </div>
              )}

              {/* Enhanced Rating */}
              {listing.rating && listing.rating.average > 0 && (
                <div className="flex items-center mb-3">
                  <div className="flex items-center bg-gradient-to-r from-yellow-100 to-orange-100 px-3 py-1.5 rounded-lg border border-yellow-200/50">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="ml-1.5 text-sm font-bold text-yellow-700">
                      {listing.rating.average.toFixed(1)}
                    </span>
                    <span className="text-yellow-600 text-sm ml-1 font-medium">
                      ({listing.rating.count} review{listing.rating.count !== 1 ? 's' : ''})
                    </span>
                  </div>
                </div>
              )}

              {/* Enhanced Availability */}
              <div className="flex items-center text-sm mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-green-100 to-emerald-100 mr-2">
                  <Calendar className="w-4 h-4 text-green-600" />
                </div>
                <span className="font-medium text-gray-700">{getAvailabilityText()}</span>
              </div>

              {/* Enhanced Price Section */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="text-xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {getPriceDisplay()}
                </div>
                
                {listing.depositsRequired && (
                  <div className="text-sm font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
                    Deposit: {listingService.formatPrice(listing.depositsRequired.security, '')}
                  </div>
                )}
              </div>
            </div>
          </Link>
        ) : (
          <div className="p-6">
            <div className="text-center text-gray-500 py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <span className="text-3xl">📦</span>
              </div>
              <p className="font-bold text-lg text-gray-700 mb-2">Listing Unavailable</p>
              <p className="text-sm text-gray-500 leading-relaxed">This listing is temporarily unavailable or contains invalid data.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(ListingCard);