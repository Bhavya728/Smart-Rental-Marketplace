import React, { useState } from 'react';
import { X, Upload, Star, Camera, AlertCircle } from 'lucide-react';
import RatingStars from './RatingStars';
import { reviewService } from '../../services/reviewService';

const ReviewForm = ({ 
  property, 
  booking, 
  onSubmit, 
  onCancel, 
  isEdit = false,
  existingReview = null,
  className = "" 
}) => {
  const [formData, setFormData] = useState({
    rating: existingReview?.rating || 0,
    title: existingReview?.title || '',
    content: existingReview?.content || '',
    detailed_ratings: existingReview?.detailed_ratings || {
      cleanliness: null,
      communication: null,
      location: null,
      value: null,
      amenities: null,
      checkin: null
    },
    is_anonymous: existingReview?.is_anonymous || false
  });

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const detailedRatingLabels = {
    cleanliness: { 
      label: 'Cleanliness', 
      description: 'How clean was the property?' 
    },
    communication: { 
      label: 'Communication', 
      description: 'How was the host\'s communication?' 
    },
    location: { 
      label: 'Location', 
      description: 'How was the location?' 
    },
    value: { 
      label: 'Value', 
      description: 'Was it good value for money?' 
    },
    amenities: { 
      label: 'Amenities', 
      description: 'How were the amenities?' 
    },
    checkin: { 
      label: 'Check-in', 
      description: 'How was the check-in process?' 
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleDetailedRatingChange = (category, rating) => {
    setFormData(prev => ({
      ...prev,
      detailed_ratings: {
        ...prev.detailed_ratings,
        [category]: rating
      }
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (images.length + files.length > 5) {
      alert('You can upload a maximum of 5 images');
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large. Maximum size is 5MB.`);
        return false;
      }
      return true;
    });

    const newImages = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      caption: ''
    }));

    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index) => {
    setImages(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const updateImageCaption = (index, caption) => {
    setImages(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], caption };
      return updated;
    });
  };

  const validateForm = () => {
    const validation = reviewService.validateReview({
      ...formData,
      property_id: property._id,
      booking_id: booking._id
    });

    if (!validation.isValid) {
      const errorMap = {};
      validation.errors.forEach(error => {
        if (error.includes('Rating')) errorMap.rating = error;
        else if (error.includes('Title')) errorMap.title = error;
        else if (error.includes('content')) errorMap.content = error;
      });
      setErrors(errorMap);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const reviewData = {
        ...formData,
        property_id: property._id,
        booking_id: booking._id
      };

      if (isEdit) {
        await onSubmit(reviewData);
      } else {
        await onSubmit(reviewData, images);
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const characterCount = formData.content.length;
  const maxCharacters = 2000;

  return (
    <div className={`review-form-container ${className}`}>
      <div className="review-form-overlay" onClick={onCancel} />
      
      <div className="review-form">
        {/* Header */}
        <div className="form-header">
          <div className="header-content">
            <h2>{isEdit ? 'Edit Review' : 'Write a Review'}</h2>
            <p>Share your experience at {property.title}</p>
          </div>
          <button 
            onClick={onCancel}
            className="close-button"
            aria-label="Close form"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form-content">
          {/* Overall Rating */}
          <div className="form-section">
            <label className="section-label">
              Overall Rating *
            </label>
            <div className="rating-input">
              <RatingStars
                rating={formData.rating}
                size="lg"
                interactive={true}
                showNumber={false}
                onChange={(rating) => handleInputChange('rating', rating)}
              />
              <span className="rating-text">
                {formData.rating > 0 ? `${formData.rating} star${formData.rating !== 1 ? 's' : ''}` : 'Select rating'}
              </span>
            </div>
            {errors.rating && (
              <div className="error-message">
                <AlertCircle size={16} />
                {errors.rating}
              </div>
            )}
          </div>

          {/* Review Title */}
          <div className="form-section">
            <label className="section-label" htmlFor="review-title">
              Review Title *
            </label>
            <input
              id="review-title"
              type="text"
              placeholder="Summarize your experience"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`text-input ${errors.title ? 'error' : ''}`}
              maxLength={100}
            />
            <div className="input-info">
              {formData.title.length}/100 characters
            </div>
            {errors.title && (
              <div className="error-message">
                <AlertCircle size={16} />
                {errors.title}
              </div>
            )}
          </div>

          {/* Review Content */}
          <div className="form-section">
            <label className="section-label" htmlFor="review-content">
              Your Review *
            </label>
            <textarea
              id="review-content"
              placeholder="Tell others about your experience..."
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              className={`textarea-input ${errors.content ? 'error' : ''}`}
              rows={6}
              maxLength={maxCharacters}
            />
            <div className={`input-info ${characterCount > maxCharacters * 0.9 ? 'warning' : ''}`}>
              {characterCount}/{maxCharacters} characters
            </div>
            {errors.content && (
              <div className="error-message">
                <AlertCircle size={16} />
                {errors.content}
              </div>
            )}
          </div>

          {/* Detailed Ratings */}
          <div className="form-section">
            <label className="section-label">
              Detailed Ratings (Optional)
            </label>
            <div className="detailed-ratings-grid">
              {Object.entries(detailedRatingLabels).map(([category, info]) => (
                <div key={category} className="detailed-rating-item">
                  <div className="rating-category">
                    <span className="category-name">{info.label}</span>
                    <span className="category-description">{info.description}</span>
                  </div>
                  <RatingStars
                    rating={formData.detailed_ratings[category] || 0}
                    size="sm"
                    interactive={true}
                    showNumber={false}
                    onChange={(rating) => handleDetailedRatingChange(category, rating)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Image Upload */}
          {!isEdit && (
            <div className="form-section">
              <label className="section-label">
                Add Photos (Optional)
              </label>
              <div className="image-upload-section">
                {images.length < 5 && (
                  <label className="image-upload-button">
                    <Camera size={24} />
                    <span>Add Photos</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden-file-input"
                    />
                  </label>
                )}
                
                {images.length > 0 && (
                  <div className="uploaded-images">
                    {images.map((image, index) => (
                      <div key={index} className="uploaded-image">
                        <img src={image.preview} alt={`Upload ${index + 1}`} />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="remove-image"
                        >
                          <X size={16} />
                        </button>
                        <input
                          type="text"
                          placeholder="Add caption..."
                          value={image.caption}
                          onChange={(e) => updateImageCaption(index, e.target.value)}
                          className="image-caption"
                        />
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="upload-info">
                  <p>Add up to 5 photos (max 5MB each)</p>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Options */}
          <div className="form-section">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.is_anonymous}
                onChange={(e) => handleInputChange('is_anonymous', e.target.checked)}
                className="checkbox-input"
              />
              <span className="checkbox-text">
                Post anonymously
              </span>
            </label>
            <p className="privacy-note">
              Your review will be published without your name
            </p>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={onCancel}
              className="cancel-button"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={loading || !formData.rating || !formData.title.trim() || !formData.content.trim()}
            >
              {loading ? (
                <>
                  <div className="spinner" />
                  {isEdit ? 'Updating...' : 'Publishing...'}
                </>
              ) : (
                isEdit ? 'Update Review' : 'Publish Review'
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .review-form-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }

        .review-form-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
        }

        .review-form {
          position: relative;
          background: white;
          border-radius: 1rem;
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          overflow: hidden;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
        }

        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
          background: #f9fafb;
        }

        .header-content h2 {
          margin: 0 0 0.25rem 0;
          font-size: 1.5rem;
          font-weight: 600;
          color: #111827;
        }

        .header-content p {
          margin: 0;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .close-button {
          border: none;
          background: none;
          cursor: pointer;
          color: #6b7280;
          padding: 0.5rem;
          border-radius: 0.375rem;
          transition: all 0.2s ease;
        }

        .close-button:hover {
          background: #e5e7eb;
          color: #374151;
        }

        .form-content {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
        }

        .form-section {
          margin-bottom: 2rem;
        }

        .section-label {
          display: block;
          font-weight: 600;
          color: #111827;
          margin-bottom: 0.75rem;
          font-size: 0.875rem;
        }

        .rating-input {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.5rem;
        }

        .rating-text {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
        }

        .text-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          transition: all 0.2s ease;
        }

        .text-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .text-input.error {
          border-color: #dc2626;
        }

        .textarea-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          resize: vertical;
          min-height: 120px;
          font-family: inherit;
          transition: all 0.2s ease;
        }

        .textarea-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .textarea-input.error {
          border-color: #dc2626;
        }

        .input-info {
          font-size: 0.75rem;
          color: #6b7280;
          margin-top: 0.25rem;
          text-align: right;
        }

        .input-info.warning {
          color: #f59e0b;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #dc2626;
          font-size: 0.75rem;
          margin-top: 0.5rem;
        }

        .detailed-ratings-grid {
          display: grid;
          gap: 1rem;
        }

        .detailed-rating-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 0.5rem;
          border: 1px solid #e5e7eb;
        }

        .rating-category {
          flex: 1;
        }

        .category-name {
          display: block;
          font-weight: 500;
          color: #111827;
          font-size: 0.875rem;
        }

        .category-description {
          display: block;
          font-size: 0.75rem;
          color: #6b7280;
          margin-top: 0.125rem;
        }

        .image-upload-section {
          border: 2px dashed #d1d5db;
          border-radius: 0.75rem;
          padding: 2rem;
          text-align: center;
          transition: all 0.2s ease;
        }

        .image-upload-section:hover {
          border-color: #3b82f6;
          background: #f8faff;
        }

        .image-upload-button {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 2rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          cursor: pointer;
          background: white;
          color: #6b7280;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .image-upload-button:hover {
          border-color: #3b82f6;
          color: #3b82f6;
        }

        .hidden-file-input {
          display: none;
        }

        .uploaded-images {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }

        .uploaded-image {
          position: relative;
          border-radius: 0.5rem;
          overflow: hidden;
          border: 1px solid #e5e7eb;
        }

        .uploaded-image img {
          width: 100%;
          height: 120px;
          object-fit: cover;
        }

        .remove-image {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .image-caption {
          width: 100%;
          padding: 0.5rem;
          border: none;
          border-top: 1px solid #e5e7eb;
          font-size: 0.75rem;
          background: white;
        }

        .image-caption:focus {
          outline: none;
          background: #f9fafb;
        }

        .upload-info {
          margin-top: 1rem;
        }

        .upload-info p {
          margin: 0;
          font-size: 0.75rem;
          color: #6b7280;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
        }

        .checkbox-input {
          width: 16px;
          height: 16px;
        }

        .checkbox-text {
          font-size: 0.875rem;
          color: #374151;
        }

        .privacy-note {
          margin: 0.5rem 0 0 0;
          font-size: 0.75rem;
          color: #6b7280;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          padding: 1.5rem;
          border-top: 1px solid #e5e7eb;
          background: #f9fafb;
        }

        .cancel-button {
          padding: 0.75rem 1.5rem;
          border: 1px solid #d1d5db;
          background: white;
          border-radius: 0.5rem;
          font-weight: 500;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .cancel-button:hover:not(:disabled) {
          background: #f3f4f6;
        }

        .cancel-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .submit-button {
          padding: 0.75rem 1.5rem;
          border: none;
          background: #3b82f6;
          color: white;
          border-radius: 0.5rem;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
        }

        .submit-button:hover:not(:disabled) {
          background: #2563eb;
        }

        .submit-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Dark theme support */
        @media (prefers-color-scheme: dark) {
          .review-form {
            background: #1f2937;
          }

          .form-header {
            background: #374151;
            border-bottom-color: #4b5563;
          }

          .header-content h2 {
            color: #f9fafb;
          }

          .header-content p {
            color: #9ca3af;
          }

          .section-label {
            color: #f9fafb;
          }

          .text-input,
          .textarea-input {
            background: #374151;
            border-color: #4b5563;
            color: #f9fafb;
          }

          .text-input:focus,
          .textarea-input:focus {
            border-color: #60a5fa;
            box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
          }

          .detailed-rating-item {
            background: #374151;
            border-color: #4b5563;
          }

          .category-name {
            color: #f9fafb;
          }

          .category-description {
            color: #9ca3af;
          }

          .image-upload-section {
            border-color: #4b5563;
            background: #374151;
          }

          .image-upload-section:hover {
            border-color: #60a5fa;
            background: #1e40af;
          }

          .image-upload-button {
            background: #374151;
            border-color: #4b5563;
            color: #9ca3af;
          }

          .image-upload-button:hover {
            border-color: #60a5fa;
            color: #60a5fa;
          }

          .form-actions {
            background: #374151;
            border-top-color: #4b5563;
          }

          .cancel-button {
            background: #374151;
            border-color: #4b5563;
            color: #e5e7eb;
          }

          .cancel-button:hover:not(:disabled) {
            background: #4b5563;
          }
        }

        /* Mobile responsiveness */
        @media (max-width: 640px) {
          .review-form-container {
            padding: 0.5rem;
          }

          .review-form {
            max-height: 95vh;
          }

          .form-header {
            padding: 1rem;
          }

          .header-content h2 {
            font-size: 1.25rem;
          }

          .form-content {
            padding: 1rem;
          }

          .detailed-rating-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
          }

          .uploaded-images {
            grid-template-columns: repeat(2, 1fr);
          }

          .form-actions {
            padding: 1rem;
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default ReviewForm;