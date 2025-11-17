/**
 * Listing Model
 * Represents rental property listings in the marketplace
 */

const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  // Auto-generated fields
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true
  },

  // Required: Owner reference
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner is required'],
    index: true
  },

  // Required: Basic listing info
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [10, 'Title must be at least 10 characters'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },

  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [50, 'Description must be at least 50 characters'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },

  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: [
        // Property & Spaces
        'apartment',
        'house',
        'condo',
        'studio',
        'room',
        'office',
        'warehouse',
        'commercial',
        'land',
        'parking',
        'storage',
        'event-space',
        'coworking',
        
        // Electronics & Technology
        'laptop',
        'desktop',
        'tablet',
        'smartphone',
        'camera',
        'audio-equipment',
        'gaming-console',
        'tv-monitor',
        'projector',
        'drone',
        'vr-headset',
        'smart-device',
        
        // Furniture & Home
        'sofa',
        'chair',
        'table',
        'bed',
        'wardrobe',
        'appliance',
        'home-decor',
        'lighting',
        'kitchen-equipment',
        'cleaning-equipment',
        
        // Vehicles & Transportation  
        'car',
        'motorcycle',
        'bicycle',
        'scooter',
        'boat',
        'rv-camper',
        'truck',
        'trailer',
        'parking-spot',
        
        // Sports & Recreation
        'fitness-equipment',
        'sports-gear',
        'outdoor-gear',
        'camping-equipment',
        'water-sports',
        'winter-sports',
        'musical-instrument',
        'hobby-equipment',
        
        // Tools & Equipment
        'construction-tools',
        'garden-tools',
        'power-tools',
        'machinery',
        'professional-equipment',
        'safety-equipment',
        
        // Fashion & Accessories
        'clothing',
        'shoes',
        'jewelry',
        'bags',
        'watches',
        'formal-wear',
        
        // Events & Services
        'party-supplies',
        'wedding-equipment',
        'catering-equipment',
        'decoration',
        'entertainment',
        
        // Books & Education
        'books',
        'textbooks',
        'educational-materials',
        'art-supplies',
        
        // Baby & Kids
        'baby-gear',
        'toys',
        'kids-furniture',
        'stroller',
        'car-seat',
        
        // Health & Beauty
        'medical-equipment',
        'beauty-equipment',
        'wellness-products',
        
        // Other
        'other'
      ],
      message: 'Please select a valid category'
    },
    index: true
  },

  // Required: Pricing
  dailyRate: {
    type: Number,
    required: [true, 'Daily rate is required'],
    min: [1, 'Daily rate must be at least $1'],
    max: [10000, 'Daily rate cannot exceed $10,000']
  },

  // Optional: Additional pricing
  weeklyRate: {
    type: Number,
    min: [1, 'Weekly rate must be at least $1'],
    max: [50000, 'Weekly rate cannot exceed $50,000'],
    validate: {
      validator: function(value) {
        return !value || value >= this.dailyRate * 6; // Should be at least 6 days worth
      },
      message: 'Weekly rate should be at least 6 times the daily rate'
    }
  },

  monthlyRate: {
    type: Number,
    min: [1, 'Monthly rate must be at least $1'],
    max: [200000, 'Monthly rate cannot exceed $200,000'],
    validate: {
      validator: function(value) {
        return !value || value >= this.dailyRate * 25; // Should be at least 25 days worth
      },
      message: 'Monthly rate should be at least 25 times the daily rate'
    }
  },

  // Required: Location
  location: {
    // Address information
    address: {
      street: {
        type: String,
        required: [true, 'Street address is required'],
        trim: true,
        maxlength: [200, 'Street address cannot exceed 200 characters']
      },
      city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
        maxlength: [100, 'City name cannot exceed 100 characters']
      },
      state: {
        type: String,
        required: [true, 'State is required'],
        trim: true,
        maxlength: [50, 'State name cannot exceed 50 characters']
      },
      zipCode: {
        type: String,
        required: [true, 'ZIP code is required'],
        trim: true,
        match: [/^[A-Za-z0-9\s\-]{3,10}$/, 'Please enter a valid ZIP code']
      },
      country: {
        type: String,
        required: [true, 'Country is required'],
        trim: true,
        maxlength: [50, 'Country name cannot exceed 50 characters'],
        default: 'US'
      }
    },
    
    // Coordinates for mapping (GeoJSON format for MongoDB geospatial indexing)
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        required: [true, 'Coordinates type is required'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: [true, 'Coordinates array is required'],
        validate: {
          validator: function(coords) {
            return coords.length === 2 && 
                   coords[0] >= -180 && coords[0] <= 180 && // longitude
                   coords[1] >= -90 && coords[1] <= 90;    // latitude
          },
          message: 'Coordinates must be [longitude, latitude] with valid ranges'
        }
      }
    },

    // Helper fields for easier access (virtual fields will provide these)
    latitude: {
      type: Number,
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90']
    },
    longitude: {
      type: Number,
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180']
    },

    // Searchable location string
    displayAddress: {
      type: String,
      trim: true
    }
  },

  // Required: Images (minimum 1, maximum 10)
  images: [{
    url: {
      type: String,
      required: [true, 'Image URL is required']
    },
    publicId: {
      type: String, // Cloudinary public ID for deletion
      required: [true, 'Image public ID is required']
    },
    caption: {
      type: String,
      trim: true,
      maxlength: [100, 'Image caption cannot exceed 100 characters']
    },
    isPrimary: {
      type: Boolean,
      default: false
    },
    order: {
      type: Number,
      default: 0
    }
  }],

  // Item/Property details (flexible for all types)
  details: {
    // For properties/spaces
    bedrooms: {
      type: Number,
      min: [0, 'Bedrooms cannot be negative'],
      max: [20, 'Bedrooms cannot exceed 20']
    },
    bathrooms: {
      type: Number,
      min: [0, 'Bathrooms cannot be negative'],
      max: [20, 'Bathrooms cannot exceed 20']
    },
    area: {
      type: Number,
      min: [1, 'Area must be at least 1'],
      max: [50000, 'Area cannot exceed 50,000']
    },
    areaUnit: {
      type: String,
      enum: ['sqft', 'sqm', 'cm', 'inches', 'meters'],
      default: 'sqft'
    },
    maxOccupancy: {
      type: Number,
      min: [1, 'Max occupancy must be at least 1'],
      max: [50, 'Max occupancy cannot exceed 50']
    },
    
    // General item specifications
    brand: {
      type: String,
      trim: true,
      maxlength: [100, 'Brand name cannot exceed 100 characters']
    },
    model: {
      type: String,
      trim: true,
      maxlength: [100, 'Model name cannot exceed 100 characters']
    },
    year: {
      type: Number,
      min: [1900, 'Year cannot be before 1900'],
      max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
    },
    condition: {
      type: String,
      enum: ['new', 'excellent', 'good', 'fair', 'poor'],
      default: 'good'
    },
    color: {
      type: String,
      trim: true,
      maxlength: [50, 'Color description cannot exceed 50 characters']
    },
    size: {
      type: String,
      trim: true,
      maxlength: [50, 'Size description cannot exceed 50 characters']
    },
    weight: {
      type: Number,
      min: [0, 'Weight cannot be negative']
    },
    weightUnit: {
      type: String,
      enum: ['kg', 'lbs', 'oz', 'grams'],
      default: 'kg'
    },
    
    // Electronics specific
    storage: {
      type: String,
      trim: true,
      maxlength: [50, 'Storage description cannot exceed 50 characters']
    },
    screenSize: {
      type: String,
      trim: true,
      maxlength: [20, 'Screen size cannot exceed 20 characters']
    },
    battery: {
      type: String,
      trim: true,
      maxlength: [50, 'Battery description cannot exceed 50 characters']
    },
    
    // Vehicle specific
    mileage: {
      type: Number,
      min: [0, 'Mileage cannot be negative']
    },
    fuelType: {
      type: String,
      enum: ['gasoline', 'diesel', 'electric', 'hybrid', 'other']
    },
    transmission: {
      type: String,
      enum: ['manual', 'automatic', 'cvt']
    },
    seats: {
      type: Number,
      min: [1, 'Seats must be at least 1'],
      max: [50, 'Seats cannot exceed 50']
    },
    
    // Fashion specific
    material: {
      type: String,
      trim: true,
      maxlength: [100, 'Material description cannot exceed 100 characters']
    },
    
    // General specifications
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: {
        type: String,
        enum: ['cm', 'inches', 'meters', 'feet'],
        default: 'cm'
      }
    },
    
    // Additional custom specifications
    specifications: [{
      name: {
        type: String,
        required: true,
        trim: true,
        maxlength: [50, 'Specification name cannot exceed 50 characters']
      },
      value: {
        type: String,
        required: true,
        trim: true,
        maxlength: [100, 'Specification value cannot exceed 100 characters']
      }
    }]
  },

  // Features and amenities (applicable to all item types)
  features: [{
    type: String,
    enum: [
      // General Features
      'new-condition',
      'excellent-condition', 
      'good-condition',
      'fair-condition',
      'vintage',
      'certified',
      'warranty-included',
      'insurance-included',
      'delivery-available',
      'pickup-available',
      'installation-included',
      'manual-included',
      'accessories-included',
      'batteries-included',
      'charging-cable-included',
      
      // Property-specific (for spaces)
      'wifi',
      'parking',
      'kitchen',
      'laundry',
      'ac',
      'heating',
      'pool',
      'gym',
      'balcony',
      'garden',
      'pet-friendly',
      'smoking-allowed',
      'wheelchair-accessible',
      'security',
      'elevator',
      'storage',
      'furnished',
      'utilities-included',
      
      // Electronics-specific
      'latest-model',
      'unlocked',
      'water-resistant',
      'wireless',
      'bluetooth',
      'touchscreen',
      'high-resolution',
      '4k-support',
      'vr-compatible',
      
      // Vehicle-specific
      'automatic',
      'manual',
      'electric',
      'hybrid',
      'gps-included',
      'insurance-covered',
      'fuel-included',
      
      // Tools & Equipment
      'professional-grade',
      'heavy-duty',
      'portable',
      'cordless',
      'safety-certified',
      
      // Fashion & Accessories
      'designer',
      'authentic',
      'dry-cleaned',
      'size-guide-available',
      
      // General Service Features
      '24-7-support',
      'flexible-pickup',
      'same-day-delivery',
      'contactless-delivery',
      'sanitized',
      'eco-friendly'
    ]
  }],

  // Availability calendar (optional - default: always available)
  availability: {
    calendar: [{
      date: {
        type: Date,
        required: true
      },
      status: {
        type: String,
        enum: ['available', 'booked', 'blocked'],
        default: 'available'
      },
      price: {
        type: Number,
        min: [0, 'Price cannot be negative']
      }
    }],
    
    // Booking rules
    minimumStay: {
      type: Number,
      min: [1, 'Minimum stay must be at least 1 day'],
      max: [365, 'Minimum stay cannot exceed 365 days'],
      default: 1
    },
    
    maximumStay: {
      type: Number,
      min: [1, 'Maximum stay must be at least 1 day'],
      max: [365, 'Maximum stay cannot exceed 365 days'],
      default: 365
    },
    
    advanceNotice: {
      type: Number,
      min: [0, 'Advance notice cannot be negative'],
      max: [365, 'Advance notice cannot exceed 365 days'],
      default: 0
    }
  },

  // Rules and policies
  rules: {
    checkIn: {
      type: String,
      trim: true,
      maxlength: [500, 'Check-in rules cannot exceed 500 characters']
    },
    checkOut: {
      type: String,
      trim: true,
      maxlength: [500, 'Check-out rules cannot exceed 500 characters']
    },
    houseRules: [{
      type: String,
      trim: true,
      maxlength: [200, 'House rule cannot exceed 200 characters']
    }],
    cancellationPolicy: {
      type: String,
      enum: ['flexible', 'moderate', 'strict', 'super-strict'],
      default: 'moderate'
    }
  },

  // Status (auto-set, default: active)
  status: {
    type: String,
    enum: {
      values: ['draft', 'active', 'inactive', 'deleted', 'suspended'],
      message: 'Please select a valid status'
    },
    default: 'draft',
    index: true
  },

  // Performance metrics
  metrics: {
    views: {
      type: Number,
      default: 0,
      min: [0, 'Views cannot be negative']
    },
    favorites: {
      type: Number,
      default: 0,
      min: [0, 'Favorites cannot be negative']
    },
    bookings: {
      type: Number,
      default: 0,
      min: [0, 'Bookings cannot be negative']
    },
    rating: {
      average: {
        type: Number,
        min: [0, 'Rating cannot be negative'],
        max: [5, 'Rating cannot exceed 5'],
        default: 0
      },
      count: {
        type: Number,
        min: [0, 'Rating count cannot be negative'],
        default: 0
      }
    }
  },

  // SEO and search optimization
  seo: {
    slug: {
      type: String,
      unique: true,
      sparse: true, // Allow null values but ensure uniqueness when present
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
    },
    keywords: [{
      type: String,
      trim: true,
      lowercase: true
    }]
  },

  // Timestamps (auto-generated)
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true, // Automatically manage createdAt and updatedAt
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Indexes for performance
listingSchema.index({ owner: 1, status: 1 });
listingSchema.index({ category: 1, status: 1 });
listingSchema.index({ 'location.coordinates': '2dsphere' }); // Geospatial index for location-based searches
listingSchema.index({ dailyRate: 1 });
listingSchema.index({ createdAt: -1 });
listingSchema.index({ 'metrics.rating.average': -1 });
listingSchema.index({ status: 1, createdAt: -1 });

// Virtual for full address
listingSchema.virtual('fullAddress').get(function() {
  if (!this.location?.address) return '';
  
  const addr = this.location.address;
  return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}, ${addr.country}`;
});

// Virtual for primary image
listingSchema.virtual('primaryImage').get(function() {
  if (!this.images || this.images.length === 0) return null;
  
  const primary = this.images.find(img => img.isPrimary);
  return primary || this.images[0];
});

// Virtual fields for easier access to coordinates
listingSchema.virtual('location.lat').get(function() {
  return this.location?.coordinates?.coordinates?.[1] || this.latitude;
});

listingSchema.virtual('location.lng').get(function() {
  return this.location?.coordinates?.coordinates?.[0] || this.longitude;
});

// Virtual field for backward compatibility
listingSchema.virtual('location.coordinates.lat').get(function() {
  return this.location?.coordinates?.coordinates?.[1] || this.latitude;
});

listingSchema.virtual('location.coordinates.lng').get(function() {
  return this.location?.coordinates?.coordinates?.[0] || this.longitude;
});

// Virtual for price per period
listingSchema.virtual('priceDisplay').get(function() {
  return {
    daily: this.dailyRate,
    weekly: this.weeklyRate || this.dailyRate * 7,
    monthly: this.monthlyRate || this.dailyRate * 30
  };
});

// Pre-save middleware
listingSchema.pre('save', function(next) {
  // Update the updatedAt field
  this.updatedAt = new Date();
  
  // Convert lat/lng format to GeoJSON format for geospatial indexing
  if (this.location?.coordinates) {
    const coords = this.location.coordinates;
    
    // If coordinates are in old {lat, lng} format, convert to GeoJSON
    if (coords.lat !== undefined && coords.lng !== undefined && !coords.type) {
      this.location.coordinates = {
        type: 'Point',
        coordinates: [coords.lng, coords.lat] // GeoJSON format: [longitude, latitude]
      };
      // Store individual values for easier access
      this.latitude = coords.lat;
      this.longitude = coords.lng;
    }
    // If coordinates are already in GeoJSON format, extract lat/lng for easier access
    else if (coords.type === 'Point' && Array.isArray(coords.coordinates)) {
      this.longitude = coords.coordinates[0];
      this.latitude = coords.coordinates[1];
    }
  }
  
  // Generate display address
  if (this.location?.address) {
    const addr = this.location.address;
    this.location.displayAddress = `${addr.city}, ${addr.state}`;
  }
  
  // Generate SEO slug if not provided
  if (!this.seo?.slug && this.title) {
    this.seo = this.seo || {};
    this.seo.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim('-'); // Remove leading/trailing hyphens
  }
  
  // Validate images array
  if (this.images && this.images.length > 10) {
    return next(new Error('Cannot have more than 10 images'));
  }
  
  // Temporarily disabled for testing - in production this ensures quality
  // if (this.images && this.images.length === 0 && this.status === 'active') {
  //   return next(new Error('Active listings must have at least one image'));
  // }
  
  // Ensure only one primary image
  if (this.images) {
    const primaryImages = this.images.filter(img => img.isPrimary);
    if (primaryImages.length > 1) {
      // Keep first primary, set others to false
      let foundFirst = false;
      this.images.forEach(img => {
        if (img.isPrimary && foundFirst) {
          img.isPrimary = false;
        } else if (img.isPrimary) {
          foundFirst = true;
        }
      });
    }
  }
  
  next();
});

// Static methods
listingSchema.statics.findByOwner = function(ownerId, status = 'active') {
  return this.find({ owner: ownerId, status }).populate('owner', 'name email profile.avatar');
};

listingSchema.statics.findByCategory = function(category, status = 'active') {
  return this.find({ category, status }).populate('owner', 'name profile.avatar');
};

listingSchema.statics.findNearby = function(lat, lng, maxDistance = 10000, status = 'active') {
  return this.find({
    status,
    'location.coordinates': {
      $near: {
        $geometry: { type: 'Point', coordinates: [lng, lat] },
        $maxDistance: maxDistance
      }
    }
  }).populate('owner', 'name profile.avatar');
};

// Instance methods
listingSchema.methods.updateViews = function() {
  this.metrics.views += 1;
  return this.save();
};

listingSchema.methods.addToFavorites = function() {
  this.metrics.favorites += 1;
  return this.save();
};

listingSchema.methods.removeFromFavorites = function() {
  if (this.metrics.favorites > 0) {
    this.metrics.favorites -= 1;
  }
  return this.save();
};

listingSchema.methods.updateRating = function(newRating, totalRatings) {
  this.metrics.rating.average = newRating;
  this.metrics.rating.count = totalRatings;
  return this.save();
};

const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;