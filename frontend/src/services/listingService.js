/**
 * Listing Service
 * Handles all API calls related to listings
 */

import api from './api';

class ListingService {
  /**
   * Get all listings with optional filters
   */
  async getAllListings(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      // Add filters to query params
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          if (Array.isArray(filters[key])) {
            filters[key].forEach(value => params.append(key, value));
          } else {
            params.append(key, filters[key]);
          }
        }
      });
      
      const queryString = params.toString();
      const url = queryString ? `/listings?${queryString}` : '/listings';
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching listings:', error);
      throw error;
    }
  }

  /**
   * Search listings with advanced filters
   */
  async searchListings(searchParams = {}) {
    try {
      const params = new URLSearchParams();
      
      // Add search parameters
      Object.keys(searchParams).forEach(key => {
        if (searchParams[key] !== undefined && searchParams[key] !== null && searchParams[key] !== '') {
          if (Array.isArray(searchParams[key])) {
            searchParams[key].forEach(value => params.append(key, value));
          } else {
            params.append(key, searchParams[key]);
          }
        }
      });
      
      const response = await api.get(`/listings/search?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error searching listings:', error);
      throw error;
    }
  }

  /**
   * Get listing by ID
   */
  async getListingById(id) {
    try {
      const response = await api.get(`/listings/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching listing:', error);
      throw error;
    }
  }

  /**
   * Get featured listings
   */
  async getFeaturedListings(limit = 6) {
    try {
      const response = await api.get(`/listings/featured?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching featured listings:', error);
      throw error;
    }
  }

  /**
   * Get listings by category
   */
  async getListingsByCategory(category, page = 1, limit = 20) {
    try {
      const response = await api.get(`/listings/category/${category}?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching listings by category:', error);
      throw error;
    }
  }

  /**
   * Get nearby listings
   */
  async getNearbyListings(lat, lng, radius = 10000, limit = 20) {
    try {
      const response = await api.get(`/listings/nearby?lat=${lat}&lng=${lng}&radius=${radius}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching nearby listings:', error);
      throw error;
    }
  }

  /**
   * Get user's listings (requires authentication)
   */
  async getUserListings(status = null) {
    try {
      const url = status ? `/listings/user/me?status=${status}` : '/listings/user/me';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching user listings:', error);
      throw error;
    }
  }

  /**
   * Get user's listing statistics
   */
  async getUserStats() {
    try {
      const response = await api.get('/listings/user/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }

  /**
   * Create a new listing
   */
  async createListing(listingData) {
    try {
      // Transform the data to match backend expectations
      const transformedData = await this.transformListingData(listingData);
      const response = await api.post('/listings', transformedData);
      return response.data;
    } catch (error) {
      console.error('Error creating listing:', error);
      throw error;
    }
  }

  /**
   * Create listing with already transformed data (used internally)
   */
  async createListingDirect(transformedData) {
    try {
      const response = await api.post('/listings', transformedData);
      return response.data;
    } catch (error) {
      console.error('Error creating listing:', error);
      throw error;
    }
  }

  /**
   * Update listing
   */
  async updateListing(id, listingData) {
    try {
      const response = await api.put(`/listings/${id}`, listingData);
      return response.data;
    } catch (error) {
      console.error('Error updating listing:', error);
      throw error;
    }
  }

  /**
   * Delete listing
   */
  async deleteListing(id) {
    try {
      const response = await api.delete(`/listings/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting listing:', error);
      throw error;
    }
  }

  /**
   * Publish listing (change from draft to active)
   */
  async publishListing(id) {
    try {
      const response = await api.put(`/listings/${id}/publish`);
      return response.data;
    } catch (error) {
      console.error('Error publishing listing:', error);
      throw error;
    }
  }

  /**
   * Upload listing images
   */
  async uploadListingImages(id, files) {
    try {
      const formData = new FormData();
      
      // Add files to form data
      if (Array.isArray(files)) {
        files.forEach(file => {
          formData.append('listingPhotos', file);
        });
      } else {
        formData.append('listingPhotos', files);
      }

      const response = await api.post(`/listings/${id}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000, // Increase timeout to 2 minutes for large image uploads
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload progress: ${percentCompleted}%`);
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error uploading listing images:', error);
      throw error;
    }
  }

  /**
   * Delete listing image
   */
  async deleteListingImage(id, publicId) {
    try {
      const encodedPublicId = encodeURIComponent(publicId);
      const response = await api.delete(`/listings/${id}/images/${encodedPublicId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting listing image:', error);
      throw error;
    }
  }

  /**
   * Set primary image
   */
  async setPrimaryImage(id, publicId) {
    try {
      const encodedPublicId = encodeURIComponent(publicId);
      const response = await api.put(`/listings/${id}/images/${encodedPublicId}/primary`);
      return response.data;
    } catch (error) {
      console.error('Error setting primary image:', error);
      throw error;
    }
  }

  /**
   * Transform listing data to match backend expectations
   */
  async transformListingData(listingData) {
    const transformed = { ...listingData };

    // Flatten pricing structure
    if (listingData.pricing) {
      transformed.dailyRate = listingData.pricing.dailyRate;
      transformed.weeklyRate = listingData.pricing.weeklyRate;
      transformed.monthlyRate = listingData.pricing.monthlyRate;
      transformed.securityDeposit = listingData.pricing.depositsRequired?.security;
      transformed.cleaningDeposit = listingData.pricing.depositsRequired?.cleaning;
      
      // Remove the nested pricing object
      delete transformed.pricing;
    }

    // Remove images from initial creation - they'll be uploaded separately
    // The backend expects uploaded images with real URLs and publicIds
    delete transformed.images;

    // Ensure unique title to prevent slug conflicts (for development/testing)
    if (process.env.NODE_ENV !== 'production') {
      const uniqueSuffix = Math.random().toString(36).substr(2, 4);
      transformed.title = `${transformed.title} ${uniqueSuffix}`;
    }

    // Ensure coordinates are always present and in correct GeoJSON format
    if (!transformed.location) transformed.location = {};
    
    let lat, lng;
    
    // Get coordinates from existing data or geocode the address
    if (listingData.location?.coordinates?.lat && listingData.location?.coordinates?.lng) {
      lat = Number(listingData.location.coordinates.lat);
      lng = Number(listingData.location.coordinates.lng);
    } else if (listingData.location?.address) {
      // Try to geocode the full address
      const address = `${listingData.location.address.street}, ${listingData.location.address.city}, ${listingData.location.address.state} ${listingData.location.address.zipCode}`;
      console.log('Geocoding address:', address);
      
      const geocoded = await this.geocodeAddress(address);
      
      if (geocoded) {
        lat = geocoded.lat;
        lng = geocoded.lng;
        console.log('Geocoded coordinates:', { lat, lng });
      } else {
        // Fall back to state coordinates
        const stateCoordinates = this.getStateCoordinates(listingData.location.address.state || 'Default');
        lat = Number(stateCoordinates.lat);
        lng = Number(stateCoordinates.lng);
        console.log('Using fallback state coordinates:', { lat, lng });
      }
    } else {
      // Default fallback
      const defaultCoords = this.getStateCoordinates('Default');
      lat = Number(defaultCoords.lat);
      lng = Number(defaultCoords.lng);
    }
    
    // Set coordinates in both formats to satisfy both route validation and model validation
    transformed.location.coordinates = {
      lat: lat,
      lng: lng,
      // Also include GeoJSON format for model validation
      type: 'Point',
      coordinates: [lng, lat]  // GeoJSON format: [longitude, latitude]
    };

    console.log('Final coordinates (hybrid format):', transformed.location.coordinates);

    return transformed;
  }

  /**
   * Geocode address using OpenStreetMap Nominatim (free service)
   */
  async geocodeAddress(address) {
    try {
      const encodedAddress = encodeURIComponent(address);
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'RentalMarketplace/1.0' // Required by Nominatim
        }
      });
      
      if (!response.ok) {
        throw new Error('Geocoding request failed');
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
      }
      
      return null;
    } catch (error) {
      console.warn('Geocoding failed:', error);
      return null;
    }
  }

  /**
   * Get approximate coordinates for a state (fallback when geocoding fails)
   */
  getStateCoordinates(state) {
    const stateCoords = {
      'California': { lat: 36.7783, lng: -119.4179 },
      'Texas': { lat: 31.9686, lng: -99.9018 },
      'Florida': { lat: 27.6648, lng: -81.5158 },
      'New York': { lat: 42.1657, lng: -74.9481 },
      'Pennsylvania': { lat: 41.2033, lng: -77.1945 },
      'Illinois': { lat: 40.3363, lng: -89.0022 },
      'Ohio': { lat: 40.3888, lng: -82.7649 },
      'Georgia': { lat: 33.0406, lng: -83.6431 },
      'North Carolina': { lat: 35.5397, lng: -79.8431 },
      'Michigan': { lat: 43.3266, lng: -84.5361 },
      'Washington': { lat: 47.7511, lng: -120.7401 },
      'Oregon': { lat: 43.8041, lng: -120.5542 },
      'Colorado': { lat: 39.0598, lng: -105.3111 },
      'Arizona': { lat: 34.0489, lng: -111.0937 },
      'Nevada': { lat: 38.3135, lng: -117.0554 }
      // Add more states as needed
    };
    
    return stateCoords[state] || { lat: 39.8283, lng: -98.5795 }; // Default to center of US
  }

  /**
   * Validate listing data before submission
   */
  validateListingData(listingData) {
    const errors = {};

    // Required fields validation
    if (!listingData.title?.trim()) {
      errors.title = 'Title is required';
    } else if (listingData.title.length < 10) {
      errors.title = 'Title must be at least 10 characters';
    } else if (listingData.title.length > 100) {
      errors.title = 'Title cannot exceed 100 characters';
    }

    if (!listingData.description?.trim()) {
      errors.description = 'Description is required';
    } else if (listingData.description.length < 50) {
      errors.description = 'Description must be at least 50 characters';
    } else if (listingData.description.length > 2000) {
      errors.description = 'Description cannot exceed 2000 characters';
    }

    if (!listingData.category) {
      errors.category = 'Category is required';
    }

    // Check both possible locations for dailyRate (direct or nested in pricing)
    const dailyRate = listingData.dailyRate || listingData.pricing?.dailyRate;
    if (!dailyRate || dailyRate <= 0) {
      errors.dailyRate = 'Daily rate is required and must be greater than 0';
    } else if (dailyRate > 10000) {
      errors.dailyRate = 'Daily rate cannot exceed $10,000';
    }

    // Location validation
    if (!listingData.location?.address?.street?.trim()) {
      errors['location.address.street'] = 'Street address is required';
    }

    if (!listingData.location?.address?.city?.trim()) {
      errors['location.address.city'] = 'City is required';
    }

    if (!listingData.location?.address?.state?.trim()) {
      errors['location.address.state'] = 'State is required';
    }

    if (!listingData.location?.address?.zipCode?.trim()) {
      errors['location.address.zipCode'] = 'ZIP code is required';
    }

    // Check for GeoJSON Point format or lat/lng object format
    const coords = listingData.location?.coordinates;
    const isGeoJSON = coords?.type === 'Point' && Array.isArray(coords.coordinates) && coords.coordinates.length === 2;
    const isLatLng = typeof coords?.lat === 'number' && typeof coords?.lng === 'number';
    
    if (!isGeoJSON && !isLatLng) {
      errors['location.coordinates'] = 'Location coordinates are required';
    }

    // Optional rate validations
    const weeklyRate = listingData.weeklyRate || listingData.pricing?.weeklyRate;
    const monthlyRate = listingData.monthlyRate || listingData.pricing?.monthlyRate;
    
    if (weeklyRate && weeklyRate < dailyRate * 6) {
      errors.weeklyRate = 'Weekly rate should be at least 6 times the daily rate';
    }

    if (monthlyRate && monthlyRate < dailyRate * 25) {
      errors.monthlyRate = 'Monthly rate should be at least 25 times the daily rate';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Get all available categories
   */
  getCategories() {
    return {
      'Property & Spaces': [
        { value: 'apartment', label: 'Apartment' },
        { value: 'house', label: 'House' },
        { value: 'condo', label: 'Condo' },
        { value: 'studio', label: 'Studio' },
        { value: 'room', label: 'Room' },
        { value: 'office', label: 'Office' },
        { value: 'warehouse', label: 'Warehouse' },
        { value: 'commercial', label: 'Commercial Space' },
        { value: 'land', label: 'Land' },
        { value: 'parking', label: 'Parking' },
        { value: 'storage', label: 'Storage' },
        { value: 'event-space', label: 'Event Space' },
        { value: 'coworking', label: 'Coworking Space' }
      ],
      'Electronics & Technology': [
        { value: 'laptop', label: 'Laptop' },
        { value: 'desktop', label: 'Desktop Computer' },
        { value: 'tablet', label: 'Tablet' },
        { value: 'smartphone', label: 'Smartphone' },
        { value: 'camera', label: 'Camera' },
        { value: 'audio-equipment', label: 'Audio Equipment' },
        { value: 'gaming-console', label: 'Gaming Console' },
        { value: 'tv-monitor', label: 'TV/Monitor' },
        { value: 'projector', label: 'Projector' },
        { value: 'drone', label: 'Drone' },
        { value: 'vr-headset', label: 'VR Headset' },
        { value: 'smart-device', label: 'Smart Device' }
      ],
      'Furniture & Home': [
        { value: 'sofa', label: 'Sofa' },
        { value: 'chair', label: 'Chair' },
        { value: 'table', label: 'Table' },
        { value: 'bed', label: 'Bed' },
        { value: 'wardrobe', label: 'Wardrobe' },
        { value: 'appliance', label: 'Home Appliance' },
        { value: 'home-decor', label: 'Home Decor' },
        { value: 'lighting', label: 'Lighting' },
        { value: 'kitchen-equipment', label: 'Kitchen Equipment' },
        { value: 'cleaning-equipment', label: 'Cleaning Equipment' }
      ],
      'Vehicles & Transportation': [
        { value: 'car', label: 'Car' },
        { value: 'motorcycle', label: 'Motorcycle' },
        { value: 'bicycle', label: 'Bicycle' },
        { value: 'scooter', label: 'Scooter' },
        { value: 'boat', label: 'Boat' },
        { value: 'rv-camper', label: 'RV/Camper' },
        { value: 'truck', label: 'Truck' },
        { value: 'trailer', label: 'Trailer' },
        { value: 'parking-spot', label: 'Parking Spot' }
      ],
      'Sports & Recreation': [
        { value: 'fitness-equipment', label: 'Fitness Equipment' },
        { value: 'sports-gear', label: 'Sports Gear' },
        { value: 'outdoor-gear', label: 'Outdoor Gear' },
        { value: 'camping-equipment', label: 'Camping Equipment' },
        { value: 'water-sports', label: 'Water Sports' },
        { value: 'winter-sports', label: 'Winter Sports' },
        { value: 'musical-instrument', label: 'Musical Instrument' },
        { value: 'hobby-equipment', label: 'Hobby Equipment' }
      ],
      'Tools & Equipment': [
        { value: 'construction-tools', label: 'Construction Tools' },
        { value: 'garden-tools', label: 'Garden Tools' },
        { value: 'power-tools', label: 'Power Tools' },
        { value: 'machinery', label: 'Machinery' },
        { value: 'professional-equipment', label: 'Professional Equipment' },
        { value: 'safety-equipment', label: 'Safety Equipment' }
      ],
      'Fashion & Accessories': [
        { value: 'clothing', label: 'Clothing' },
        { value: 'shoes', label: 'Shoes' },
        { value: 'jewelry', label: 'Jewelry' },
        { value: 'bags', label: 'Bags' },
        { value: 'watches', label: 'Watches' },
        { value: 'formal-wear', label: 'Formal Wear' }
      ],
      'Events & Services': [
        { value: 'party-supplies', label: 'Party Supplies' },
        { value: 'wedding-equipment', label: 'Wedding Equipment' },
        { value: 'catering-equipment', label: 'Catering Equipment' },
        { value: 'decoration', label: 'Decoration' },
        { value: 'entertainment', label: 'Entertainment' }
      ],
      'Books & Education': [
        { value: 'books', label: 'Books' },
        { value: 'textbooks', label: 'Textbooks' },
        { value: 'educational-materials', label: 'Educational Materials' },
        { value: 'art-supplies', label: 'Art Supplies' }
      ],
      'Baby & Kids': [
        { value: 'baby-gear', label: 'Baby Gear' },
        { value: 'toys', label: 'Toys' },
        { value: 'kids-furniture', label: 'Kids Furniture' },
        { value: 'stroller', label: 'Stroller' },
        { value: 'car-seat', label: 'Car Seat' }
      ],
      'Health & Beauty': [
        { value: 'medical-equipment', label: 'Medical Equipment' },
        { value: 'beauty-equipment', label: 'Beauty Equipment' },
        { value: 'wellness-products', label: 'Wellness Products' }
      ],
      'Other': [
        { value: 'other', label: 'Other' }
      ]
    };
  }

  /**
   * Get flat array of all categories
   */
  getAllCategoriesFlat() {
    const categoryGroups = this.getCategories();
    return Object.values(categoryGroups).flat();
  }

  /**
   * Format price for display
   */
  formatPrice(price, period = 'day') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price) + `/${period}`;
  }

  /**
   * Get category icon/emoji
   */
  getCategoryIcon(category) {
    const icons = {
      // Properties
      'apartment': '🏢', 'house': '🏠', 'condo': '🏙️', 'studio': '🏠', 'room': '🛏️',
      'office': '🏢', 'warehouse': '🏭', 'commercial': '🏪', 'land': '🌍', 
      'parking': '🅿️', 'storage': '📦', 'event-space': '🎪', 'coworking': '💼',
      
      // Electronics
      'laptop': '💻', 'desktop': '🖥️', 'tablet': '📱', 'smartphone': '📱',
      'camera': '📷', 'audio-equipment': '🎧', 'gaming-console': '🎮', 'tv-monitor': '📺',
      'projector': '📽️', 'drone': '🚁', 'vr-headset': '🥽', 'smart-device': '📱',
      
      // Furniture
      'sofa': '🛋️', 'chair': '🪑', 'table': '🪑', 'bed': '🛏️', 'wardrobe': '👗',
      'appliance': '🏠', 'home-decor': '🎨', 'lighting': '💡', 'kitchen-equipment': '🍽️',
      'cleaning-equipment': '🧹',
      
      // Vehicles
      'car': '🚗', 'motorcycle': '🏍️', 'bicycle': '🚴', 'scooter': '🛴',
      'boat': '⛵', 'rv-camper': '🚐', 'truck': '🚚', 'trailer': '🚛', 'parking-spot': '🅿️',
      
      // Sports
      'fitness-equipment': '🏋️', 'sports-gear': '⚽', 'outdoor-gear': '🎒',
      'camping-equipment': '⛺', 'water-sports': '🏄', 'winter-sports': '⛷️',
      'musical-instrument': '🎸', 'hobby-equipment': '🎨',
      
      // Tools
      'construction-tools': '🔨', 'garden-tools': '🌱', 'power-tools': '🔧',
      'machinery': '⚙️', 'professional-equipment': '🛠️', 'safety-equipment': '🦺',
      
      // Fashion
      'clothing': '👕', 'shoes': '👟', 'jewelry': '💎', 'bags': '👜',
      'watches': '⌚', 'formal-wear': '🤵',
      
      // Events
      'party-supplies': '🎉', 'wedding-equipment': '💒', 'catering-equipment': '🍽️',
      'decoration': '🎨', 'entertainment': '🎪',
      
      // Books & Education
      'books': '📚', 'textbooks': '📖', 'educational-materials': '📝', 'art-supplies': '🎨',
      
      // Baby & Kids
      'baby-gear': '👶', 'toys': '🧸', 'kids-furniture': '🪑', 'stroller': '👶', 'car-seat': '🚗',
      
      // Health & Beauty
      'medical-equipment': '🏥', 'beauty-equipment': '💄', 'wellness-products': '🧘',
      
      // Other
      'other': '📦'
    };

    return icons[category] || '📦';
  }
}

const listingService = new ListingService();
export { listingService };
export default listingService;