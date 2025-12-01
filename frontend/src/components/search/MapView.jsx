import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Map as MapIcon, 
  Maximize, 
  Minimize, 
  Locate, 
  Filter, 
  List,
  Grid,
  Star,
  DollarSign
} from 'lucide-react';
import Button from '../ui/Button';
import ListingCard from '../ListingCard';
import { useGeolocation } from '../../hooks/useGeolocation';
import { cn } from '../../utils/cn';

// Mock map component - In a real implementation, you'd use Google Maps, Mapbox, etc.
const MapContainer = ({ 
  listings = [], 
  selectedListing = null, 
  onListingSelect, 
  userLocation = null,
  center = { lat: 40.7128, lng: -74.0060 }, // Default to NYC
  zoom = 12,
  className = ""
}) => {
  const mapRef = useRef(null);
  const [hoveredListing, setHoveredListing] = useState(null);

  // In a real implementation, you would initialize the map library here
  useEffect(() => {
    // Initialize map
    console.log('Map initialized with center:', center, 'zoom:', zoom);
  }, [center, zoom]);

  // Update map when listings change
  useEffect(() => {
    // Add markers for listings
    console.log('Adding markers for', listings.length, 'listings');
  }, [listings]);

  const MarkerPin = ({ listing, isSelected, isHovered, onClick }) => {
  const coords = listing.location?.coordinates;

  // SUPPORT BOTH FORMATS:
  // { lat: xx, lng: yy }  OR  [lng, lat]
  const lng = Array.isArray(coords) ? coords[0] : coords?.lng;
  const lat = Array.isArray(coords) ? coords[1] : coords?.lat;

  const safeLng = Number(lng) || 0;
  const safeLat = Number(lat) || 0;

  return (
    <motion.div
      className="absolute transform -translate-x-1/2 -translate-y-full cursor-pointer z-10"
      style={{
        left: `${((safeLng + 74.0060) / 0.2) * 100}%`,
        top: `${((40.7128 - safeLat) / 0.1) * 100}%`
      }}
      onClick={() => onClick(listing)}
    >
      <div className="min-w-16 px-2 py-1 rounded-full bg-white shadow">
        ${listing.price}
      </div>
    </motion.div>
  );
};


  return (
    <div ref={mapRef} className={cn("relative bg-gray-200 overflow-hidden", className)}>
      {/* Mock map background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100 opacity-50" />
      
      {/* Mock streets/grid overlay */}
      <div className="absolute inset-0" 
           style={{
             backgroundImage: `
               linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px),
               linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)
             `,
             backgroundSize: '50px 50px'
           }} 
      />
      
      {/* User location marker */}
      {userLocation && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
          style={{ 
            left: '50%', 
            top: '50%'
          }}
        >
          <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg" />
          <div className="absolute inset-0 w-4 h-4 bg-blue-500 rounded-full animate-ping opacity-75" />
        </motion.div>
      )}

      {/* Listing markers */}
      {listings.map((listing) => (
        <MarkerPin
          key={listing._id}
          listing={listing}
          isSelected={selectedListing?._id === listing._id}
          isHovered={hoveredListing === listing._id}
          onClick={onListingSelect}
        />
      ))}

      {/* Map controls would go here in a real implementation */}
      <div className="absolute bottom-4 right-4 space-y-2">
        <Button size="sm" variant="outline" className="bg-white">
          <Locate className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

const MapView = ({
  listings = [],
  selectedListing = null,
  onListingSelect,
  onClose,
  isFullscreen = false,
  onToggleFullscreen,
  filters = {},
  onFiltersChange,
  className = ""
}) => {
  const [viewMode, setViewMode] = useState('split'); // 'map', 'list', 'split'
  const { location: userLocation, loading: locationLoading, error: locationError } = useGeolocation();
  const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.0060 });
  const [mapZoom, setMapZoom] = useState(12);

  // Update map center based on user location or listings
  useEffect(() => {
    if (userLocation) {
      setMapCenter({ lat: userLocation.latitude, lng: userLocation.longitude });
    } else if (listings.length > 0) {
      // Calculate center from listings
      const avgLat = listings.reduce((sum, l) => sum + (l.location?.coordinates?.[1] || 0), 0) / listings.length;
      const avgLng = listings.reduce((sum, l) => sum + (l.location?.coordinates?.[0] || 0), 0) / listings.length;
      setMapCenter({ lat: avgLat, lng: avgLng });
    }
  }, [userLocation, listings]);

  const handleListingSelect = (listing) => {
    onListingSelect?.(listing);
    // Center map on selected listing
    if (listing.location?.coordinates) {
      setMapCenter({
        lat: listing.location.coordinates[1],
        lng: listing.location.coordinates[0]
      });
    }
  };

  return (
    <div className={cn(
      "bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden",
      isFullscreen && "fixed inset-0 z-50 rounded-none",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <MapIcon className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-gray-900">
            Map View
          </h3>
          <span className="text-sm text-gray-500">
            ({listings.length} listings)
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* View mode toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('map')}
              className={cn(
                "p-2 rounded-md transition-colors",
                viewMode === 'map' 
                  ? "bg-white shadow-sm text-primary" 
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <MapIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={cn(
                "p-2 rounded-md transition-colors",
                viewMode === 'split' 
                  ? "bg-white shadow-sm text-primary" 
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2 rounded-md transition-colors",
                viewMode === 'list' 
                  ? "bg-white shadow-sm text-primary" 
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Fullscreen toggle */}
          <Button
            onClick={onToggleFullscreen}
            size="sm"
            variant="outline"
          >
            {isFullscreen ? (
              <Minimize className="w-4 h-4" />
            ) : (
              <Maximize className="w-4 h-4" />
            )}
          </Button>

          {/* Close button */}
          {onClose && (
            <Button
              onClick={onClose}
              size="sm"
              variant="outline"
            >
              ×
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={cn(
        "flex",
        isFullscreen ? "h-screen" : "h-96"
      )}>
        {/* Map */}
        {(viewMode === 'map' || viewMode === 'split') && (
          <div className={cn(
            viewMode === 'map' ? "w-full" : "w-1/2 border-r border-gray-200"
          )}>
            <MapContainer
              listings={listings}
              selectedListing={selectedListing}
              onListingSelect={handleListingSelect}
              userLocation={userLocation}
              center={mapCenter}
              zoom={mapZoom}
              className="w-full h-full"
            />
          </div>
        )}

        {/* Listings List */}
        {(viewMode === 'list' || viewMode === 'split') && (
          <div className={cn(
            "overflow-y-auto",
            viewMode === 'list' ? "w-full" : "w-1/2"
          )}>
            {listings.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <MapIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No listings found in this area</p>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {listings.map((listing) => (
                  <motion.div
                    key={listing._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "cursor-pointer transition-all duration-200 rounded-lg",
                      selectedListing?._id === listing._id && "ring-2 ring-primary shadow-md"
                    )}
                    onClick={() => handleListingSelect(listing)}
                  >
                    <CompactListingCard 
                      listing={listing}
                      isSelected={selectedListing?._id === listing._id}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected listing details popup */}
      <AnimatePresence>
        {selectedListing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-30"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-lg font-semibold text-gray-900 truncate">
                {selectedListing.title}
              </h4>
              <button
                onClick={() => onListingSelect(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                {selectedListing.rating && (
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 mr-1" />
                    <span>{selectedListing.rating}</span>
                  </div>
                )}
                <span>•</span>
                <span>{selectedListing.category}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-gray-900">
                  ${selectedListing.price}/day
                </span>
                <Button size="sm">View Details</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Compact listing card for map view
const CompactListingCard = ({ listing, isSelected }) => (
  <div className={cn(
    "bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow",
    isSelected && "border-primary bg-primary-50"
  )}>
    <div className="flex space-x-3">
      <img
        src={listing.images?.[0] || '/placeholder-image.jpg'}
        alt={listing.title}
        className="w-16 h-16 object-cover rounded-lg"
      />
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 truncate">
          {listing.title}
        </h4>
        <p className="text-xs text-gray-600 truncate">
          {listing.location?.city}, {listing.location?.state}
        </p>
        <div className="flex items-center justify-between mt-1">
          {listing.rating && (
            <div className="flex items-center text-xs text-gray-600">
              <Star className="w-3 h-3 text-yellow-400 mr-1" />
              <span>{listing.rating}</span>
            </div>
          )}
          <span className="text-sm font-bold text-gray-900">
            ${listing.price}/day
          </span>
        </div>
      </div>
    </div>
  </div>
);

export default MapView;