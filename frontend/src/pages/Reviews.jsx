import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { reviewService } from '../services/reviewService';
import { listingService } from '../services/listingService';
import { bookingService } from '../services/bookingService';
import ReviewStats from '../components/reviews/ReviewStats';
import ReviewList from '../components/reviews/ReviewList';
import ReviewForm from '../components/reviews/ReviewForm';
import RatingStars from '../components/reviews/RatingStars';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { 
  Star, 
  Plus, 
  ArrowLeft, 
  MapPin, 
  Calendar,
  Users,
  Bed,
  Bath,
  Car,
  Wifi,
  Camera,
  AlertTriangle
} from 'lucide-react';

const Reviews = () => {
  const { propertyId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  
  const [property, setProperty] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [error, setError] = useState(null);
  
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const reviewsPerPage = 10;
  
  // Check if user can write a review
  const [canWriteReview, setCanWriteReview] = useState(false);
  const [userBookings, setUserBookings] = useState([]);

  // Load initial data
  useEffect(() => {
    if (propertyId) {
      loadPropertyData();
      loadReviews(true);
      if (user) {
        checkReviewEligibility();
      }
    }
  }, [propertyId, user]);

  // Handle search params for opening review form
  useEffect(() => {
    const showForm = searchParams.get('write');
    if (showForm === 'true' && user && canWriteReview) {
      setShowReviewForm(true);
      // Clear the search param
      searchParams.delete('write');
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams, user, canWriteReview]);

  const loadPropertyData = async () => {
    try {
      setError(null);
      const response = await listingService.getListingById(propertyId);
      setProperty(response.data);
    } catch (err) {
      console.error('Error loading property:', err);
      setError('Failed to load property information');
    }
  };

  const loadReviews = async (reset = false) => {
    try {
      setLoadingReviews(true);
      setError(null);
      
      const page = reset ? 1 : currentPage;
      const response = await reviewService.getPropertyReviews(propertyId, {
        page,
        limit: reviewsPerPage,
        sort_by: 'created_at',
        sort_order: -1
      });

      if (reset) {
        setReviews(response.reviews);
        setCurrentPage(1);
      } else {
        setReviews(prev => [...prev, ...response.reviews]);
      }
      
      setReviewStats(response.stats);
      setHasMore(response.reviews.length === reviewsPerPage);
      setCurrentPage(prev => reset ? 2 : prev + 1);
      
    } catch (err) {
      console.error('Error loading reviews:', err);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
      setLoadingReviews(false);
    }
  };

  const checkReviewEligibility = async () => {
    try {
      if (!user) return;
      
      // Get user's bookings for this property
      const userBookings = await bookingService.getUserBookings();
      const propertyBookings = userBookings.filter(booking => booking.listing_id === propertyId);
      
      // Check for completed bookings
      const completedBookings = propertyBookings.filter(
        booking => booking.status === 'completed' || 
        (booking.status === 'confirmed' && new Date(booking.end_date) < new Date())
      );
      
      setUserBookings(completedBookings);
      
      // Check if user already has a review
      const existingReviews = await reviewService.getPropertyReviews(propertyId, {
        reviewer_id: user._id
      });
      
      setCanWriteReview(completedBookings.length > 0 && existingReviews.reviews.length === 0);
      
    } catch (err) {
      console.error('Error checking review eligibility:', err);
      // If there's an error, allow reviews for authenticated users
      setCanWriteReview(user && true);
    }
  };

  const handleLoadMore = useCallback(() => {
    if (!loadingReviews && hasMore) {
      loadReviews(false);
    }
  }, [loadingReviews, hasMore, currentPage]);

  const handleVoteHelpful = async (reviewId, isHelpful) => {
    if (!user) return;
    
    try {
      await reviewService.voteHelpful(reviewId, isHelpful);
      
      // Update review in state
      setReviews(prev => prev.map(review => {
        if (review._id === reviewId) {
          const wasHelpful = review.helpful_votes?.includes(user._id);
          const wasUnhelpful = review.unhelpful_votes?.includes(user._id);
          
          let helpful_count = review.helpful_count || 0;
          let unhelpful_count = review.unhelpful_count || 0;
          let helpful_votes = review.helpful_votes || [];
          let unhelpful_votes = review.unhelpful_votes || [];
          
          if (isHelpful) {
            if (wasHelpful) {
              // Remove helpful vote
              helpful_count--;
              helpful_votes = helpful_votes.filter(id => id !== user._id);
            } else {
              // Add helpful vote
              helpful_count++;
              helpful_votes.push(user._id);
              // Remove unhelpful vote if exists
              if (wasUnhelpful) {
                unhelpful_count--;
                unhelpful_votes = unhelpful_votes.filter(id => id !== user._id);
              }
            }
          } else {
            if (wasUnhelpful) {
              // Remove unhelpful vote
              unhelpful_count--;
              unhelpful_votes = unhelpful_votes.filter(id => id !== user._id);
            } else {
              // Add unhelpful vote
              unhelpful_count++;
              unhelpful_votes.push(user._id);
              // Remove helpful vote if exists
              if (wasHelpful) {
                helpful_count--;
                helpful_votes = helpful_votes.filter(id => id !== user._id);
              }
            }
          }
          
          return {
            ...review,
            helpful_count,
            unhelpful_count,
            helpful_votes,
            unhelpful_votes
          };
        }
        return review;
      }));
      
    } catch (err) {
      console.error('Error voting on review:', err);
    }
  };

  const handleReply = async (reviewId, content) => {
    if (!user) return;
    
    try {
      await reviewService.replyToReview(reviewId, { content });
      
      // Reload reviews to get the updated review with reply
      loadReviews(true);
      
    } catch (err) {
      console.error('Error replying to review:', err);
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }
    
    try {
      await reviewService.deleteReview(reviewId);
      
      // Remove review from state
      setReviews(prev => prev.filter(review => review._id !== reviewId));
      
      // Reload stats
      loadReviews(true);
      
    } catch (err) {
      console.error('Error deleting review:', err);
    }
  };

  const handleFlagReview = async (reviewId, reason) => {
    if (!user) return;
    
    try {
      await reviewService.flagReview(reviewId, { reason });
      
      // Show success message or update UI
      alert('Review has been flagged for moderation');
      
    } catch (err) {
      console.error('Error flagging review:', err);
    }
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      if (editingReview) {
        await reviewService.updateReview(editingReview._id, reviewData);
      } else {
        await reviewService.createReview({
          ...reviewData,
          property_id: propertyId
        });
      }
      
      // Close form and reload reviews
      setShowReviewForm(false);
      setEditingReview(null);
      loadReviews(true);
      
      // Update eligibility
      if (!editingReview) {
        setCanWriteReview(false);
      }
      
    } catch (err) {
      console.error('Error submitting review:', err);
      throw err;
    }
  };

  const propertyFeatures = property ? [
    { icon: Users, label: `${property.max_guests} guests` },
    { icon: Bed, label: `${property.bedrooms} bedrooms` },
    { icon: Bath, label: `${property.bathrooms} bathrooms` },
    ...(property.parking_spaces ? [{ icon: Car, label: `${property.parking_spaces} parking` }] : []),
    ...(property.amenities?.includes('wifi') ? [{ icon: Wifi, label: 'Free WiFi' }] : [])
  ].slice(0, 4) : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading reviews...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-8">
        <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20 text-center max-w-md">
          <AlertTriangle size={48} className="mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Reviews</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 via-blue-400/10 to-indigo-400/10" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-300/20 to-pink-300/20 rounded-full -translate-x-48 -translate-y-48 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-blue-300/20 to-indigo-300/20 rounded-full translate-x-48 translate-y-48 blur-3xl" />
      
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-lg border-b border-white/20 p-8 relative z-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[auto,1fr,auto] gap-8 items-start">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="self-start mt-2 bg-white/60 border-white/30 hover:bg-white/80 hover:shadow-lg transition-all duration-300"
          >
            <ArrowLeft size={20} />
            Back
          </Button>

          <div className="min-w-0">
            {property && (
              <>
                <div className="mb-4">
                  <h1 className="text-3xl font-black bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2 leading-tight">
                    {property.title}
                  </h1>
                  <div className="flex items-center gap-2 text-gray-600 bg-white/50 px-3 py-1 rounded-full w-fit">
                    <MapPin size={16} />
                    <span className="font-medium">{property.location?.city}, {property.location?.country}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <RatingStars 
                      rating={reviewStats?.average_rating || 0} 
                      size="sm" 
                    />
                    <span className="text-gray-600 text-sm bg-white/50 px-2 py-1 rounded-full">
                      ({reviewStats?.total_reviews || 0} review{(reviewStats?.total_reviews || 0) !== 1 ? 's' : ''})
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {propertyFeatures.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-gray-600 text-sm bg-white/50 px-3 py-1 rounded-full border border-white/30">
                        <feature.icon size={16} />
                        <span className="font-medium">{feature.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Property Image */}
          {property?.images?.[0] && (
            <div className="relative w-full lg:w-48 h-36 lg:h-32 rounded-2xl overflow-hidden shadow-xl border border-white/20">
              <img 
                src={property.images[0]} 
                alt={property.title}
                className="w-full h-full object-cover"
              />
              {property.images.length > 1 && (
                <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/70 text-white px-2 py-1 rounded-lg text-xs">
                  <Camera size={12} />
                  <span>{property.images.length}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Write Review Button */}
        {user && canWriteReview && (
          <div className="max-w-6xl mx-auto mt-6 text-center">
            <Button
              onClick={() => setShowReviewForm(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-8 py-3 font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Plus size={16} className="mr-2" />
              Write a Review
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-[300px,1fr] gap-8 items-start relative z-10">
        {/* Stats Section */}
        {reviewStats && (
          <div className="lg:sticky lg:top-8">
            <ReviewStats 
              stats={reviewStats}
              className="bg-white/60 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl"
            />
          </div>
        )}

        {/* Reviews List */}
        <div className="min-h-[600px] bg-white/60 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-white/20">
          <ReviewList
            reviews={reviews}
            loading={loadingReviews}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
            onVoteHelpful={handleVoteHelpful}
            onReply={user ? handleReply : null}
            onEdit={user ? handleEditReview : null}
            onDelete={user ? handleDeleteReview : null}
            onFlag={user ? handleFlagReview : null}
            showFilters={true}
            showProperty={false}
          />
        </div>
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <Modal
          isOpen={showReviewForm}
          onClose={() => {
            setShowReviewForm(false);
            setEditingReview(null);
          }}
          title={editingReview ? 'Edit Review' : 'Write a Review'}
          size="lg"
        >
          <ReviewForm
            property={property}
            bookings={userBookings}
            initialData={editingReview}
            onSubmit={handleReviewSubmit}
            onCancel={() => {
              setShowReviewForm(false);
              setEditingReview(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
};

export default Reviews;