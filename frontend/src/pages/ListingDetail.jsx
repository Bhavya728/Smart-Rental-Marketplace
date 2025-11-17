import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Star, Heart, Share2, Edit, Eye, MessageCircle, Shield, Clock, DollarSign, User, Phone, Mail, ChevronRight } from 'lucide-react';
import ImageGallery from '../components/ui/ImageGallery';
import Carousel from '../components/ui/Carousel';
import { StatusTag, CategoryTag, FeatureTag, PriceTag } from '../components/ui/Tag';
import RatingStars from '../components/reviews/RatingStars';
import { reviewService } from '../services/reviewService';
import listingService from '../services/listingService';
import BookingWidget from '../components/booking/BookingWidget';

const ListingDetail = () => {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [reviewStats, setReviewStats] = useState(null);
  const [recentReviews, setRecentReviews] = useState([]);

  useEffect(() => {
    console.log('ListingDetail - Received ID:', listingId, 'Type:', typeof listingId);
    if (listingId && listingId !== 'undefined') {
      loadListing();
      loadReviewData();
    } else if (!listingId) {
      setError('Listing ID is required');
      setLoading(false);
    } else if (listingId === 'undefined') {
      setError('Invalid listing ID');
      setLoading(false);
    }
  }, [listingId]);

  const loadListing = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading listing with ID:', listingId);
      console.log('Making API call to:', `http://localhost:5000/api/listings/${listingId}`);

      const response = await listingService.getListingById(listingId);
      console.log('API Response:', response);
      
      if (response && response.data) {
        setListing(response.data);
        console.log('Listing loaded successfully:', response.data.title);
      } else {
        throw new Error('Invalid response structure');
      }

    } catch (err) {
      console.error('Error loading listing:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data
      });
      setError(err.response?.data?.message || err.message || 'Failed to load listing');
    } finally {
      setLoading(false);
    }
  };

  const loadReviewData = async () => {
    try {
      // Load review statistics and recent reviews in parallel
      const [reviewStatsResponse, reviewsResponse] = await Promise.all([
        reviewService.getPropertyReviewStats(listingId),
        reviewService.getPropertyReviews(listingId, {
          limit: 3,
          sort_by: 'created_at',
          sort_order: -1
        })
      ]);
      
      setReviewStats(reviewStatsResponse);
      setRecentReviews(reviewsResponse.reviews || reviewsResponse);
    } catch (err) {
      console.error('Error loading review data:', err);
      // Don't set error for reviews, just fail silently
    }
  };

  const handleImageClick = (index) => {
    setCurrentImageIndex(index);
    setShowImageGallery(true);
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    // TODO: Implement actual favorite API call
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing.title,
          text: listing.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleContact = () => {
    setShowContactInfo(true);
    // TODO: Implement contact/booking functionality
  };

  const formatLocation = () => {
    if (listing?.location?.address) {
      const { street, city, state, zipCode } = listing.location.address;
      return `${street}, ${city}, ${state} ${zipCode}`;
    }
    return 'Location not specified';
  };

  const getAvailabilityText = () => {
    if (listing?.status === 'rented') {
      return 'Currently Rented';
    }
    
    if (listing?.availability?.availableFrom) {
      const availableDate = new Date(listing.availability.availableFrom);
      const today = new Date();
      
      if (availableDate > today) {
        return `Available from ${availableDate.toLocaleDateString()}`;
      }
    }
    
    return 'Available Now';
  };

  const getPriceBreakdown = () => {
    if (!listing) return {};
    
    const breakdown = {};
    
    if (listing.dailyRate) {
      breakdown.daily = listing.dailyRate;
    }
    
    if (listing.weeklyRate) {
      breakdown.weekly = {
        total: listing.weeklyRate,
        perDay: Math.round((listing.weeklyRate / 7) * 100) / 100,
        savings: listing.dailyRate * 7 - listing.weeklyRate
      };
    }
    
    if (listing.monthlyRate) {
      breakdown.monthly = {
        total: listing.monthlyRate,
        perDay: Math.round((listing.monthlyRate / 30) * 100) / 100,
        savings: listing.dailyRate * 30 - listing.monthlyRate
      };
    }
    
    return breakdown;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading listing...</p>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Listing Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The listing you\'re looking for doesn\'t exist.'}</p>
          <button
            onClick={() => navigate('/listings')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse All Listings
          </button>
        </div>
      </div>
    );
  }

  const priceBreakdown = getPriceBreakdown();
  const isOwner = false; // TODO: Check if current user owns this listing

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      {/* Background Decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-600/20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-tr from-pink-400/20 to-orange-600/20 blur-3xl"></div>
      </div>
      
      {/* Image Gallery Modal */}
      <ImageGallery
        images={listing.images || []}
        isOpen={showImageGallery}
        onClose={() => setShowImageGallery(false)}
        initialIndex={currentImageIndex}
      />

      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md shadow-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6 px-4 py-2 rounded-xl hover:bg-white/80 backdrop-blur-sm border border-transparent hover:border-white/20 hover:shadow-lg transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="font-semibold">Back</span>
          </button>

          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <StatusTag status={listing.status} />
                <CategoryTag category={listing.category} />
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 leading-tight">{listing.title}</h1>
              
              <div className="flex items-center space-x-6 text-gray-700">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-semibold">{formatLocation()}</span>
                </div>
                
                {reviewStats && reviewStats.total_reviews > 0 && (
                  <div className="flex items-center space-x-1">
                    <RatingStars 
                      rating={reviewStats.average_rating} 
                      size="sm" 
                      showNumber={true}
                    />
                    <span>({reviewStats.total_reviews} reviews)</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {isOwner && (
                <Link
                  to={`/listings/${listing._id}/edit`}
                  className="group flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 hover:scale-105"
                >
                  <Edit className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                  <span className="font-semibold">Edit</span>
                </Link>
              )}
              
              <button
                onClick={handleFavorite}
                className={`p-3 border-2 rounded-xl transition-all duration-300 hover:scale-110 ${
                  isFavorited 
                    ? 'bg-gradient-to-r from-red-50 to-pink-50 border-red-300 text-red-600 shadow-lg shadow-red-500/20' 
                    : 'border-gray-300 hover:border-red-300 bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-lg'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
              
              <button
                onClick={handleShare}
                className="p-3 border-2 border-gray-300 rounded-xl hover:border-blue-400 bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300 hover:scale-110 hover:shadow-lg"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur opacity-60"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                {listing.images && listing.images.length > 0 ? (
                  listing.images.length === 1 ? (
                    <img
                      src={listing.images[0].secureUrl || listing.images[0].url}
                      alt={listing.title}
                      className="w-full h-[500px] object-cover cursor-pointer hover:scale-105 transition-transform duration-500"
                      onClick={() => handleImageClick(0)}
                    />
                ) : (
                  <Carousel
                    showDots={true}
                    showArrows={true}
                    autoplay={false}
                    className="h-96"
                  >
                    {listing.images.map((image, index) => (
                      <img
                        key={index}
                        src={image.secureUrl || image.url}
                        alt={`${listing.title} - Image ${index + 1}`}
                        className="w-full h-96 object-cover cursor-pointer"
                        onClick={() => handleImageClick(index)}
                      />
                    ))}
                  </Carousel>
                )
              ) : (
                <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">No images available</span>
                </div>
              )}

              {/* Image thumbnails */}
              {listing.images && listing.images.length > 1 && (
                <div className="p-4 border-t">
                  <div className="flex space-x-2 overflow-x-auto">
                    {listing.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => handleImageClick(index)}
                        className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition-colors"
                      >
                        <img
                          src={image.secureUrl || image.url}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
              <div className="prose prose-gray max-w-none">
                <p className="whitespace-pre-wrap">{listing.description}</p>
              </div>
            </div>

            {/* Features */}
            {listing.features && listing.features.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Features</h2>
                <div className="flex flex-wrap gap-2">
                  {listing.features.map((feature, index) => (
                    <FeatureTag key={index} feature={feature} />
                  ))}
                </div>
              </div>
            )}

            {/* Rules */}
            {listing.rules && listing.rules.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Rules & Restrictions</h2>
                <ul className="space-y-2">
                  {listing.rules.map((rule, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-red-500 font-bold">•</span>
                      <span className="text-gray-700">{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Location */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>
              <div className="flex items-center space-x-2 text-gray-600">
                <MapPin className="w-5 h-5" />
                <span>{formatLocation()}</span>
              </div>
              
              {/* TODO: Add map component */}
              <div className="mt-4 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">Map will be shown here</span>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Reviews</h2>
                
                {reviewStats && reviewStats.total_reviews > 0 && (
                  <Link
                    to={`/listings/${listingId}/reviews`}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <span>View all {reviewStats.total_reviews} reviews</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>

              {reviewStats && reviewStats.total_reviews > 0 ? (
                <div className="space-y-6">
                  {/* Review Summary */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900">
                          {reviewStats.average_rating.toFixed(1)}
                        </div>
                        <RatingStars 
                          rating={reviewStats.average_rating} 
                          size="sm" 
                          showNumber={false}
                        />
                        <div className="text-sm text-gray-600 mt-1">
                          {reviewStats.total_reviews} review{reviewStats.total_reviews !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 ml-8">
                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map(rating => {
                          const count = reviewStats.rating_breakdown[rating] || 0;
                          const percentage = reviewStats.total_reviews > 0 
                            ? (count / reviewStats.total_reviews) * 100 
                            : 0;
                          
                          return (
                            <div key={rating} className="flex items-center space-x-2 text-sm">
                              <span className="w-3">{rating}</span>
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="w-8 text-gray-600">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Recent Reviews */}
                  {recentReviews.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-medium text-gray-900">Recent Reviews</h3>
                      {recentReviews.map((review) => (
                        <div key={review._id} className="border-b border-gray-200 pb-4 last:border-b-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                {review.reviewer_id?.first_name?.charAt(0) || 'R'}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {review.reviewer_id?.first_name} {review.reviewer_id?.last_name}
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RatingStars 
                                    rating={review.rating} 
                                    size="xs" 
                                    showNumber={false}
                                  />
                                  <span className="text-sm text-gray-600">
                                    {new Date(review.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {review.title && (
                            <h4 className="font-medium text-gray-900 mb-1">{review.title}</h4>
                          )}
                          
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {review.content.length > 150
                              ? `${review.content.substring(0, 150)}...`
                              : review.content
                            }
                          </p>
                          
                          {review.images && review.images.length > 0 && (
                            <div className="flex space-x-2 mt-2">
                              {review.images.slice(0, 3).map((image, index) => (
                                <div key={index} className="w-12 h-12 rounded-md overflow-hidden">
                                  <img 
                                    src={image} 
                                    alt={`Review image ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                              {review.images.length > 3 && (
                                <div className="w-12 h-12 rounded-md bg-gray-200 flex items-center justify-center text-xs text-gray-600">
                                  +{review.images.length - 3}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="font-medium text-gray-900 mb-2">No reviews yet</h3>
                  <p className="text-gray-600 mb-4">Be the first to share your experience with this listing!</p>
                  <Link
                    to={`/listings/${listingId}/reviews?write=true`}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Write a Review
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Booking Widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Booking Widget */}
              {!isOwner && listing.status === 'active' && (
                <BookingWidget listing={listing} />
              )}
              
              {/* Contact Button for Active Listings */}
              {!isOwner && listing.status === 'active' && (
                <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
                  <button
                    onClick={handleContact}
                    className="w-full px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
                  >
                    Contact Owner
                  </button>
                </div>
              )}

              {listing.status !== 'active' && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">This item is currently not available for rent</p>
                  </div>
                </div>
              )}

              {/* Owner Info */}
              {listing.owner && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Owner Information</h3>
                  
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {listing.owner.profile?.firstName} {listing.owner.profile?.lastName}
                      </p>
                      <p className="text-sm text-gray-600">
                        Member since {new Date(listing.owner.createdAt).getFullYear()}
                      </p>
                    </div>
                  </div>

                  {showContactInfo && (
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span>{listing.owner.email}</span>
                      </div>
                      
                      {listing.owner.profile?.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span>{listing.owner.profile.phone}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => setShowContactInfo(!showContactInfo)}
                    className="w-full mt-4 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    {showContactInfo ? 'Hide Contact Info' : 'Show Contact Info'}
                  </button>
                </div>
              )}

              {/* Safety Tips */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Safety Tips</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Meet in a public place for pickup/return</li>
                  <li>• Inspect the item before renting</li>
                  <li>• Keep all communication on platform</li>
                  <li>• Report any issues immediately</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default ListingDetail;