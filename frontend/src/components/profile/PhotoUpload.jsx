import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Camera, Image, CheckCircle, AlertCircle, Crop } from 'lucide-react';
import FileUpload from '../ui/FileUpload';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

/**
 * PhotoUpload Component
 * Modern photo upload with preview, cropping, and progress indication
 */
const PhotoUpload = ({
  currentPhoto,
  onUpload,
  onDelete,
  isUploading = false,
  uploadProgress = 0,
  maxSize = 5 * 1024 * 1024, // 5MB
  aspectRatio = 1, // 1:1 for square
  showCropper = false,
  className = ''
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // Handle file selection
  const handleFileSelect = useCallback((file) => {
    if (file) {
      setSelectedFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setShowUploadModal(true);
      setUploadError(null);
    }
  }, []);

  // Handle upload confirmation
  const handleUploadConfirm = useCallback(async () => {
    if (!selectedFile) return;

    try {
      await onUpload(selectedFile);
      handleUploadCancel();
    } catch (error) {
      setUploadError(error.message || 'Upload failed. Please try again.');
    }
  }, [selectedFile, onUpload]);

  // Handle upload cancellation
  const handleUploadCancel = useCallback(() => {
    setShowUploadModal(false);
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setUploadError(null);
  }, [previewUrl]);

  // Handle delete
  const handleDelete = useCallback(() => {
    if (onDelete) {
      onDelete();
    }
  }, [onDelete]);

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Photo Display */}
      {currentPhoto && !isUploading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative group"
        >
          <div className="relative overflow-hidden rounded-xl bg-gray-100">
            <img
              src={currentPhoto}
              alt="Current photo"
              className="w-full h-64 object-cover"
            />
            
            {/* Overlay with actions */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUploadModal(true)}
                  className="bg-white text-gray-700 hover:bg-gray-50"
                >
                  <Camera size={16} className="mr-1" />
                  Change
                </Button>
                
                {onDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDelete}
                    className="bg-white text-red-600 hover:bg-red-50 border-red-200"
                  >
                    <X size={16} className="mr-1" />
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Uploading photo...</span>
            <span className="font-medium text-gray-900">{Math.round(uploadProgress)}%</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-primary-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${uploadProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>
      )}

      {/* Upload Area */}
      {!currentPhoto && !isUploading && (
        <FileUpload
          onFileSelect={handleFileSelect}
          accept="image/*"
          maxSize={maxSize}
          variant="default"
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary-400 transition-colors"
        >
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <Upload size={24} className="text-primary-600" />
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Upload a photo
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Choose a high-quality photo that represents you well
              </p>
              
              <div className="text-xs text-gray-500">
                Supports: JPEG, PNG, WebP • Max size: {formatFileSize(maxSize)}
                {aspectRatio && <> • Recommended: Square (1:1) aspect ratio</>}
              </div>
            </div>
            
            <Button variant="outline" size="sm">
              <Camera size={16} className="mr-2" />
              Choose Photo
            </Button>
          </div>
        </FileUpload>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <Modal
            isOpen={showUploadModal}
            onClose={handleUploadCancel}
            title="Upload Photo"
            size="lg"
          >
            <div className="space-y-6">
              {/* Preview */}
              {previewUrl && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Preview</h4>
                  
                  <div className="relative mx-auto max-w-md">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    
                    {showCropper && (
                      <div className="absolute inset-0 border-2 border-primary-500 rounded-lg flex items-center justify-center bg-black bg-opacity-10">
                        <div className="bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                          <Crop size={14} className="inline mr-1" />
                          Crop tool coming soon
                        </div>
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  {selectedFile && (
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">File name:</span>
                        <span className="font-medium text-gray-900 truncate ml-2">
                          {selectedFile.name}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">File size:</span>
                        <span className="font-medium text-gray-900">
                          {formatFileSize(selectedFile.size)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">File type:</span>
                        <span className="font-medium text-gray-900">
                          {selectedFile.type}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Upload Error */}
              {uploadError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700"
                >
                  <AlertCircle size={16} />
                  <span className="text-sm">{uploadError}</span>
                </motion.div>
              )}

              {/* Upload Guidelines */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="font-medium text-blue-900 mb-2">Photo Guidelines</h5>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Use a clear, recent photo of yourself</li>
                  <li>• Ensure good lighting and image quality</li>
                  <li>• Square photos work best for profile pictures</li>
                  <li>• Avoid group photos or images with text</li>
                  <li>• Keep it professional and appropriate</li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={handleUploadCancel}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                
                <Button
                  onClick={handleUploadConfirm}
                  loading={isUploading}
                  disabled={!selectedFile}
                >
                  <Upload size={16} className="mr-2" />
                  Upload Photo
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Photo Gallery Component (for future use with multiple photos)
 */
export const PhotoGallery = ({
  photos = [],
  onAdd,
  onRemove,
  onReorder,
  maxPhotos = 10,
  isUploading = false,
  className = ''
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">
          Photos ({photos.length}/{maxPhotos})
        </h4>
        
        {photos.length < maxPhotos && (
          <Button
            variant="outline"
            size="sm"
            onClick={onAdd}
            disabled={isUploading}
          >
            <Upload size={16} className="mr-1" />
            Add Photo
          </Button>
        )}
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo, index) => (
          <motion.div
            key={photo.id || index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden"
          >
            <img
              src={photo.url}
              alt={`Photo ${index + 1}`}
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => setSelectedPhoto(photo)}
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
              <button
                onClick={() => onRemove(photo.id || index)}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <X size={16} />
              </button>
            </div>

            {/* Primary Photo Indicator */}
            {index === 0 && (
              <div className="absolute top-2 left-2 px-2 py-1 bg-primary-500 text-white text-xs font-medium rounded">
                Primary
              </div>
            )}
          </motion.div>
        ))}

        {/* Add Photo Placeholder */}
        {photos.length < maxPhotos && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary-400 transition-colors"
            onClick={onAdd}
          >
            <div className="text-center">
              <Upload size={24} className="mx-auto text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">Add Photo</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Photo Lightbox Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <Modal
            isOpen={!!selectedPhoto}
            onClose={() => setSelectedPhoto(null)}
            title="Photo Preview"
            size="xl"
          >
            <div className="space-y-4">
              <img
                src={selectedPhoto.url}
                alt="Full size preview"
                className="w-full h-auto max-h-96 object-contain rounded-lg"
              />
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {selectedPhoto.name || `Photo ${photos.indexOf(selectedPhoto) + 1}`}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRemove(selectedPhoto.id)}
                >
                  <X size={16} className="mr-1" />
                  Remove
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PhotoUpload;