import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader } from 'lucide-react';
import ListingForm from '../components/listings/ListingForm';
import listingService from '../services/listingService';

const EditListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadListing();
  }, [id]);

  const loadListing = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await listingService.getListingById(id);
      setListing(response.data);

    } catch (err) {
      console.error('Error loading listing:', err);
      setError(err.response?.data?.message || 'Failed to load listing');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);
      setError(null);

      // Validate the data
      const validation = listingService.validateListingData(formData);
      if (!validation.isValid) {
        setError('Please fix the following errors: ' + Object.values(validation.errors).join(', '));
        return;
      }

      // Update the listing
      const updatedListing = await listingService.updateListing(id, formData);

      // Handle image uploads for new images
      if (formData.images && formData.images.length > 0) {
        const newImages = formData.images.filter(img => img.file && img.isNew);
        
        if (newImages.length > 0) {
          const imageFiles = newImages.map(img => img.file);
          await listingService.uploadListingImages(id, imageFiles);
        }
      }

      // Navigate to the listing detail page
      navigate(`/listings/${id}`, {
        state: { 
          message: 'Your listing has been updated successfully!',
          type: 'success'
        }
      });

    } catch (err) {
      console.error('Error updating listing:', err);
      setError(err.response?.data?.message || 'Failed to update listing. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Your changes will be lost.')) {
      navigate(`/listings/${id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading listing...</p>
        </div>
      </div>
    );
  }

  if (error && !listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Listing</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/my-listings')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to My Listings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/listings/${id}`)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Listing</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Edit Your Listing</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Update your listing details to keep it current and attractive to renters.
            </p>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="max-w-4xl mx-auto mb-6">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="font-medium">Error updating listing</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Listing Form */}
        {listing && (
          <ListingForm
            listing={listing}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={submitting}
            isEditing={true}
          />
        )}
      </div>
    </div>
  );
};

export default EditListing;