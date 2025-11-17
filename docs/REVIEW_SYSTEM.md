# Review and Rating System Documentation

## Overview

The Smart Rental platform includes a comprehensive review and rating system that allows users to share their experiences with properties and help others make informed decisions. This system includes rating submissions, image uploads, helpful voting, owner responses, filtering, and moderation features.

## Architecture

### Backend Components

#### 1. Review Model (`backend/models/Review.js`)
- **Purpose**: Data model for storing review information
- **Key Fields**:
  - `reviewer_id`: Reference to the user who wrote the review
  - `property_id`: Reference to the reviewed property  
  - `booking_id`: Reference to the associated booking
  - `rating`: Numerical rating (1-5 stars)
  - `title`: Review title/headline
  - `content`: Detailed review text
  - `images`: Array of uploaded images
  - `helpful_votes`: Array of user IDs who found review helpful
  - `unhelpful_votes`: Array of user IDs who found review unhelpful
  - `owner_response`: Optional response from property owner
  - `is_verified`: Whether the review is from a verified stay
  - `moderation_status`: Review moderation state
- **Validation**: Comprehensive validation for rating range, content length, and data integrity
- **Indexes**: Optimized for property lookups and sorting by date/rating

#### 2. Review Service (`backend/services/reviewService.js`)
- **Purpose**: Business logic layer for review operations
- **Key Functions**:
  - `createReview()`: Create new reviews with validation
  - `getReviews()`: Retrieve reviews with filtering and pagination
  - `updateReview()`: Update existing reviews
  - `deleteReview()`: Soft delete reviews
  - `voteHelpful()`: Handle helpful/unhelpful voting
  - `addOwnerResponse()`: Add property owner responses
  - `getReviewStats()`: Calculate review statistics
  - `moderateReview()`: Administrative review moderation

#### 3. Review Controller (`backend/controllers/reviewController.js`)
- **Purpose**: HTTP request handling for review endpoints
- **Key Endpoints**:
  - `POST /api/reviews`: Create a new review
  - `GET /api/reviews`: Get reviews with filtering
  - `PUT /api/reviews/:id`: Update a review
  - `DELETE /api/reviews/:id`: Delete a review
  - `POST /api/reviews/:id/vote`: Vote on review helpfulness
  - `POST /api/reviews/:id/response`: Add owner response
  - `POST /api/reviews/:id/flag`: Flag review for moderation
- **Features**: Image upload handling, authentication, validation, error handling

#### 4. Review Routes (`backend/routes/reviewRoutes.js`)
- **Purpose**: Route definitions and middleware integration
- **Middleware**: Authentication, validation, rate limiting
- **File Upload**: Multer configuration for image uploads

### Frontend Components

#### 1. RatingStars (`frontend/src/components/reviews/RatingStars.jsx`)
- **Purpose**: Interactive star rating component
- **Features**:
  - Multiple sizes (xs, sm, md, lg, xl)
  - Interactive and display-only modes
  - Half-star and decimal precision support
  - Color customization
  - Accessibility support
- **Usage**:
  ```jsx
  <RatingStars 
    rating={4.5} 
    size="md" 
    interactive={true}
    onChange={(rating) => setRating(rating)}
  />
  ```

#### 2. ReviewStats (`frontend/src/components/reviews/ReviewStats.jsx`)
- **Purpose**: Display review statistics and rating breakdown
- **Features**:
  - Overall rating display
  - Rating distribution bars
  - Total review count
  - Recent highlights
  - Loading and empty states
- **Usage**:
  ```jsx
  <ReviewStats 
    stats={reviewStats}
    className="custom-class"
  />
  ```

#### 3. ReviewCard (`frontend/src/components/reviews/ReviewCard.jsx`)
- **Purpose**: Individual review display component
- **Features**:
  - User information and avatars
  - Rating and timestamps
  - Image galleries with modal view
  - Helpful voting buttons
  - Owner response display
  - Edit/delete actions for owners
  - Flag/report functionality
- **Usage**:
  ```jsx
  <ReviewCard 
    review={reviewData}
    onVoteHelpful={handleVote}
    onEdit={handleEdit}
    onDelete={handleDelete}
    onFlag={handleFlag}
  />
  ```

#### 4. ReviewForm (`frontend/src/components/reviews/ReviewForm.jsx`)
- **Purpose**: Form for creating and editing reviews
- **Features**:
  - Interactive star rating
  - Title and content fields
  - Image upload with preview
  - Character counting
  - Validation and error handling
  - Auto-save functionality
- **Usage**:
  ```jsx
  <ReviewForm 
    property={propertyData}
    initialData={editData}
    onSubmit={handleSubmit}
    onCancel={handleCancel}
  />
  ```

#### 5. ReviewList (`frontend/src/components/reviews/ReviewList.jsx`)
- **Purpose**: List of reviews with filtering and pagination
- **Features**:
  - Search functionality
  - Rating filters
  - Sort options (date, rating, helpfulness)
  - Image filters
  - Infinite scroll or pagination
  - Load more functionality
- **Usage**:
  ```jsx
  <ReviewList 
    reviews={reviews}
    onLoadMore={handleLoadMore}
    onVoteHelpful={handleVote}
    showFilters={true}
  />
  ```

#### 6. ReviewWidget (`frontend/src/components/reviews/ReviewWidget.jsx`)
- **Purpose**: Compact review summary for property listings
- **Features**:
  - Average rating display
  - Review count
  - Rating breakdown bars
  - Links to full review page
  - Write review button
- **Usage**:
  ```jsx
  <ReviewWidget 
    propertyId={propertyId}
    stats={reviewStats}
    size="compact"
  />
  ```

#### 7. Reviews Page (`frontend/src/pages/Reviews.jsx`)
- **Purpose**: Dedicated page for viewing all reviews of a property
- **Features**:
  - Property information header
  - Review statistics sidebar
  - Comprehensive review list
  - Write review functionality
  - Mobile responsive design

### Frontend Service Layer

#### Review Service (`frontend/src/services/reviewService.js`)
- **Purpose**: API integration for review operations
- **Key Functions**:
  - `createReview()`: Submit new reviews
  - `getReviews()`: Fetch reviews with filters
  - `updateReview()`: Update existing reviews
  - `deleteReview()`: Delete reviews
  - `voteHelpful()`: Submit helpful votes
  - `replyToReview()`: Add owner responses
  - `flagReview()`: Flag inappropriate reviews
  - `uploadImages()`: Handle image uploads
- **Features**: Authentication integration, error handling, file upload support

## API Reference

### Authentication
All review operations require authentication except for viewing public reviews.

### Create Review
```http
POST /api/reviews
Content-Type: multipart/form-data

{
  "property_id": "string",
  "booking_id": "string", 
  "rating": "number (1-5)",
  "title": "string (optional)",
  "content": "string",
  "images": "file[] (optional)"
}
```

### Get Reviews
```http
GET /api/reviews?property_id={id}&page={n}&limit={n}&sort_by={field}&sort_order={1|-1}&rating={n}&search={query}
```

### Vote on Review
```http
POST /api/reviews/{reviewId}/vote

{
  "is_helpful": "boolean"
}
```

### Add Owner Response
```http
POST /api/reviews/{reviewId}/response

{
  "content": "string"
}
```

## Database Schema

### Review Document Structure
```javascript
{
  _id: ObjectId,
  reviewer_id: ObjectId, // User reference
  property_id: ObjectId, // Property reference  
  booking_id: ObjectId,  // Booking reference
  rating: Number,        // 1-5
  title: String,
  content: String,
  images: [String],      // Image URLs
  helpful_votes: [ObjectId], // User IDs
  unhelpful_votes: [ObjectId],
  helpful_count: Number,
  unhelpful_count: Number,
  owner_response: {
    content: String,
    created_at: Date,
    updated_at: Date
  },
  is_verified: Boolean,
  moderation_status: String, // 'pending', 'approved', 'rejected'
  created_at: Date,
  updated_at: Date
}
```

## Usage Examples

### Basic Review Display
```jsx
import ReviewWidget from '../components/reviews/ReviewWidget';

const PropertyCard = ({ property }) => {
  return (
    <div className="property-card">
      {/* Property details */}
      <ReviewWidget 
        propertyId={property._id}
        stats={property.reviewStats}
        size="compact"
      />
    </div>
  );
};
```

### Full Review Integration
```jsx
import { useState, useEffect } from 'react';
import { reviewService } from '../services/reviewService';
import ReviewList from '../components/reviews/ReviewList';

const PropertyReviews = ({ propertyId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, [propertyId]);

  const loadReviews = async () => {
    try {
      const response = await reviewService.getReviews({
        property_id: propertyId,
        limit: 10,
        sort_by: 'created_at',
        sort_order: -1
      });
      setReviews(response.reviews);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ReviewList 
      reviews={reviews}
      loading={loading}
      onVoteHelpful={handleVoteHelpful}
      showFilters={true}
    />
  );
};
```

## Configuration

### Environment Variables
```env
# File upload settings
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Review settings
MAX_REVIEW_IMAGES=5
MAX_REVIEW_CONTENT_LENGTH=2000
REVIEW_MODERATION_ENABLED=true
```

### CSS Customization
The review components use a comprehensive CSS file (`frontend/src/styles/reviews.css`) that includes:
- Responsive design for all screen sizes
- Dark theme support
- High contrast mode accessibility
- Print-friendly styles
- Reduced motion support
- Component-specific styling

## Security Considerations

### Input Validation
- All user inputs are validated on both client and server
- Content length limits prevent abuse
- Image upload size and type restrictions
- SQL injection prevention through parameterized queries

### Authentication & Authorization
- Reviews require authenticated users
- Users can only edit/delete their own reviews
- Property owners can respond to reviews
- Admins have full moderation capabilities

### Content Moderation
- Automated filtering for inappropriate content
- Manual review queue for flagged content
- Owner response monitoring
- Spam prevention measures

## Performance Optimization

### Database Optimization
- Indexed queries for fast lookups
- Aggregation pipelines for statistics
- Pagination for large result sets
- Caching for frequently accessed data

### Frontend Optimization
- Lazy loading for images
- Infinite scroll for review lists
- Optimistic updates for voting
- Local storage for draft reviews

## Testing Strategy

### Unit Tests
- Component rendering tests
- Service method tests
- Validation logic tests
- Error handling tests

### Integration Tests
- API endpoint tests
- Database operation tests
- File upload tests
- Authentication flow tests

### E2E Tests
- Complete review submission flow
- Review voting and interaction
- Owner response functionality
- Mobile responsiveness

## Deployment Considerations

### File Storage
- Images stored on Cloudinary CDN
- Fallback to local storage for development
- Image optimization and resizing
- Secure upload URLs

### Monitoring
- Review submission metrics
- Error rate monitoring
- Performance tracking
- User engagement analytics

## Future Enhancements

### Planned Features
1. **Advanced Filtering**: Location-based, time-based, and semantic search
2. **Review Analytics**: Sentiment analysis and trending topics
3. **Social Features**: Review sharing and follow reviewers
4. **Gamification**: Review badges and user reputation scores
5. **Multi-language Support**: Translation and localization
6. **Video Reviews**: Support for video testimonials
7. **AI Moderation**: Automated content analysis and classification

### API Versioning
The review system is designed to support API versioning for future enhancements while maintaining backward compatibility.

## Support and Maintenance

### Logging
- Comprehensive logging for all review operations
- Error tracking and alerting
- Performance monitoring
- User activity tracking

### Backup and Recovery
- Regular database backups
- Image backup strategies
- Disaster recovery procedures
- Data retention policies

For additional support or questions, please refer to the main project documentation or contact the development team.