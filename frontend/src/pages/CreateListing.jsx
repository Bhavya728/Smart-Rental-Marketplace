import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lightbulb } from 'lucide-react';
import ListingForm from '../components/listings/ListingForm';
import listingService from '../services/listingService';

const CreateListing = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      setError(null);

      // Transform the data first
      const transformedData = await listingService.transformListingData(formData);

      // Validate the transformed data
      const validation = listingService.validateListingData(transformedData);
      if (!validation.isValid) {
        setError('Please fix the following errors: ' + Object.values(validation.errors).join(', '));
        return;
      }

      // Create the listing with already transformed data
      const listing = await listingService.createListingDirect(transformedData);
      
      console.log('Listing creation response:', listing);
      
      // Extract listing ID from response (handle different possible structures)
      let listingId = null;
      
      // Try different possible paths to find the listing ID
      if (listing?._id) {
        listingId = listing._id;
      } else if (listing?.data?._id) {
        listingId = listing.data._id;
      } else if (listing?.data?.listing?._id) {
        listingId = listing.data.listing._id;
      } else if (listing?.data?.id) {
        listingId = listing.data.id;
      } else if (listing?.data?.listing?.id) {
        listingId = listing.data.listing.id;
      } else if (typeof listing?.data === 'string') {
        // Sometimes the ID might be returned as a string in data
        listingId = listing.data;
      } else if (listing?.data && typeof listing.data === 'object') {
        // Search through the data object for any field that looks like an ID
        const dataKeys = Object.keys(listing.data);
        const idField = dataKeys.find(key => 
          key.includes('id') || key.includes('Id') || key.includes('_id')
        );
        if (idField) {
          listingId = listing.data[idField];
        }
        
        // If still not found, check if data object itself might be the listing
        if (!listingId && listing.data._id) {
          listingId = listing.data._id;
        }
      }
      
      console.log('Extracted listing ID:', listingId);
      console.log('Available data keys:', listing?.data ? Object.keys(listing.data) : 'No data object');
      
      if (!listingId) {
        console.error('Could not extract listing ID from response:', listing);
        setError('Listing created successfully! Please check your listings page to find your new listing.');
        return;
      }

      // Try to upload images (non-blocking - listing is already created)
      let imageUploadSuccess = true;
      if (formData.images && formData.images.length > 0) {
        const imageFiles = formData.images
          .filter(img => img.file)
          .map(img => img.file);
        
        if (imageFiles.length > 0) {
          try {
            console.log(`Uploading ${imageFiles.length} images for listing ${listingId}`);
            await listingService.uploadListingImages(listingId, imageFiles);
            console.log('Images uploaded successfully');
          } catch (imageError) {
            console.error('Image upload failed:', imageError);
            imageUploadSuccess = false;
            
            // Show a warning but don't prevent navigation
            if (imageError.code === 'ECONNABORTED') {
              setError('Listing created successfully, but image upload timed out. You can add images later by editing your listing.');
            } else {
              setError('Listing created successfully, but some images failed to upload. You can add images later by editing your listing.');
            }
          }
        }
      }

      // Publish the listing to make it active
      try {
        console.log(`Publishing listing ${listingId}`);
        await listingService.publishListing(listingId);
        console.log('Listing published successfully');
      } catch (publishError) {
        console.error('Publish failed:', publishError);
        // Don't prevent navigation, but show a warning
        setError('Listing created successfully but could not be published automatically. You can publish it from your listings page.');
      }

      // Navigate to the listing detail page
      const successMessage = imageUploadSuccess 
        ? 'Your listing has been created and published successfully!' 
        : 'Your listing has been created and published successfully! Some images may still be uploading.';
        
      navigate(`/listings/${listingId}`, {
        state: { 
          message: successMessage,
          type: 'success'
        }
      });

    } catch (err) {
      console.error('Error creating listing:', err);
      console.error('Full error response:', err.response?.data);
      const errorMessage = err.response?.data?.message || 'Failed to create listing. Please try again.';
      const errors = err.response?.data?.errors;
      
      if (errors && Array.isArray(errors)) {
        const errorDetails = errors.map(e => e.msg).join(', ');
        setError(`${errorMessage}: ${errorDetails}`);
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Your progress will be lost.')) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">List Your Item</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Turn your unused items into income. It only takes a few minutes to create a listing.
            </p>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="max-w-4xl mx-auto mb-6">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="font-medium">Error creating listing</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="max-w-5xl mx-auto mb-12">
          <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-sm border border-blue-200/60 rounded-2xl p-8 shadow-lg shadow-blue-200/20">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-blue-900 mb-4 tracking-tight">Tips for a successful listing</h3>
                <ul className="text-blue-800 space-y-3 text-base font-medium">
                  <li className="flex items-start space-x-3">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Use clear, high-quality photos showing the item from multiple angles</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Write a detailed description including condition and what's included</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Set competitive prices by researching similar items in your area</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Be honest about any flaws or wear to build trust with renters</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Respond quickly to rental requests to increase your booking rate</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Listing Form */}
        <ListingForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
          isEditing={false}
        />
      </div>
    </div>
  );
};

export default CreateListing;