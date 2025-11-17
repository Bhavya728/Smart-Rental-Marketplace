import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Upload, X, Plus } from 'lucide-react';

const ImageUploader = ({
  images = [],
  onImagesChange,
  maxImages = 10,
  maxSizePerImage = 5 * 1024 * 1024, // 5MB
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  className = ""
}) => {
  const [draggedImageIndex, setDraggedImageIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState([]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    processFiles(files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const processFiles = (files) => {
    const newErrors = [];
    const validFiles = [];

    files.forEach((file, index) => {
      // Check file type
      if (!acceptedTypes.includes(file.type)) {
        newErrors.push(`File ${file.name}: Invalid file type. Please upload JPEG, PNG, or WebP images.`);
        return;
      }

      // Check file size
      if (file.size > maxSizePerImage) {
        newErrors.push(`File ${file.name}: File size too large. Maximum size is ${maxSizePerImage / (1024 * 1024)}MB.`);
        return;
      }

      validFiles.push(file);
    });

    // Check total images limit
    if (images.length + validFiles.length > maxImages) {
      newErrors.push(`Cannot upload ${validFiles.length} images. Maximum ${maxImages} images allowed (currently have ${images.length}).`);
      setErrors(newErrors);
      return;
    }

    setErrors(newErrors);

    if (validFiles.length > 0) {
      const newImages = validFiles.map((file) => {
        const url = URL.createObjectURL(file);
        return {
          file,
          url,
          id: Date.now() + Math.random(),
          isNew: true
        };
      });

      onImagesChange([...images, ...newImages]);
    }
  };

  const removeImage = (imageIndex) => {
    const newImages = images.filter((_, index) => index !== imageIndex);
    
    // Revoke object URL to prevent memory leaks
    const imageToRemove = images[imageIndex];
    if (imageToRemove.url && imageToRemove.isNew) {
      URL.revokeObjectURL(imageToRemove.url);
    }

    onImagesChange(newImages);
  };

  const moveImage = (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;

    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);

    onImagesChange(newImages);
  };

  const handleDragStart = (e, index) => {
    setDraggedImageIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    if (draggedImageIndex !== null && dragOverIndex !== null) {
      moveImage(draggedImageIndex, dragOverIndex);
    }
    setDraggedImageIndex(null);
    setDragOverIndex(null);
  };

  const setPrimaryImage = (index) => {
    const newImages = images.map((image, idx) => ({
      ...image,
      isPrimary: idx === index
    }));
    onImagesChange(newImages);
  };

  const getImageUrl = (image) => {
    return image.url || image.secureUrl;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload area */}
      <div
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 overflow-hidden ${
          isDragging 
            ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 scale-[1.02] shadow-lg shadow-blue-500/20' 
            : 'border-gray-300 hover:border-blue-400 bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-lg'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-4 right-4 w-16 h-16 rounded-full bg-gradient-to-br from-blue-400/10 to-purple-600/10 blur-2xl"></div>
          <div className="absolute bottom-4 left-4 w-20 h-20 rounded-full bg-gradient-to-tr from-pink-400/10 to-orange-600/10 blur-2xl"></div>
        </div>
        
        <div className="relative">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Upload className="w-8 h-8 text-white" />
          </div>
          <p className="text-lg font-bold text-gray-800 mb-3">
            Drag and drop images here, or{' '}
            <label className="text-blue-600 cursor-pointer hover:text-purple-600 transition-colors duration-300 underline decoration-2 underline-offset-4">
              browse files
              <input
                type="file"
                multiple
                accept={acceptedTypes.join(',')}
                onChange={handleFileSelect}
                className="hidden"
                disabled={images.length >= maxImages}
              />
            </label>
          </p>
          <div className="flex items-center justify-center space-x-4 mb-3">
            <div className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg border border-blue-200/50">
              <span className="text-sm font-bold text-blue-700">{images.length}/{maxImages} images</span>
            </div>
            <div className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg border border-gray-200/50">
              <span className="text-sm font-bold text-gray-700">Max {maxSizePerImage / (1024 * 1024)}MB per image</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 font-medium">
            Supported formats: <span className="text-blue-600 font-bold">JPEG, PNG, WebP</span>
          </p>
        </div>
      </div>

      {/* Error messages */}
      {errors.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mr-3">
              <span className="text-white font-bold text-sm">!</span>
            </div>
            <h4 className="text-lg font-bold text-red-800">Upload Errors</h4>
          </div>
          <ul className="text-sm text-red-700 space-y-2">
            {errors.map((error, index) => (
              <li key={index} className="flex items-start">
                <span className="w-2 h-2 rounded-full bg-red-500 mr-3 mt-2 flex-shrink-0"></span>
                <span className="font-medium">{error}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Image preview grid */}
      {images.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Uploaded Images</h4>
            <div className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg border border-blue-200/50">
              <p className="text-sm font-bold text-blue-700">
                Drag to reorder • First image will be the main photo
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {images.map((image, index) => (
              <div
                key={image.id || index}
                className={`relative group border-2 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 cursor-move ${
                  index === 0 
                    ? 'border-blue-500 ring-4 ring-blue-200/50 shadow-lg shadow-blue-500/20' 
                    : 'border-gray-200 hover:border-blue-300 hover:shadow-lg'
                } ${
                  draggedImageIndex === index ? 'opacity-50 scale-95' : ''
                } ${
                  dragOverIndex === index ? 'border-blue-500 scale-105 shadow-xl shadow-blue-500/30' : ''
                }`}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
              >
                <div className="aspect-w-1 aspect-h-1">
                  <img
                    src={getImageUrl(image)}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-32 object-cover"
                  />
                </div>

                {/* Primary badge */}
                {index === 0 && (
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg backdrop-blur-sm border border-white/20">
                      ⭐ Main Photo
                    </span>
                  </div>
                )}

                {/* Actions overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center space-x-3">
                  {index !== 0 && (
                    <button
                      onClick={() => setPrimaryImage(index)}
                      className="px-3 py-2 bg-white/95 backdrop-blur-sm hover:bg-white text-gray-700 hover:text-blue-600 rounded-xl transition-all duration-300 text-xs font-bold border border-white/20 shadow-lg hover:scale-105"
                      title="Set as main photo"
                    >
                      Set Main
                    </button>
                  )}
                  
                  <button
                    onClick={() => removeImage(index)}
                    className="p-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all duration-300 shadow-lg hover:scale-105"
                    title="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Order indicator */}
                <div className="absolute bottom-3 right-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-white/95 backdrop-blur-sm text-gray-700 rounded-xl text-xs font-black shadow-lg border border-white/20">
                    {index + 1}
                  </span>
                </div>
              </div>
            ))}

            {/* Add more button */}
            {images.length < maxImages && (
              <label className="group aspect-w-1 aspect-h-1 border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center cursor-pointer hover:border-blue-400 transition-all duration-300 h-32 hover:scale-105 hover:shadow-lg">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-bold text-gray-600 group-hover:text-blue-600 transition-colors duration-300">Add More</span>
                </div>
                <input
                  type="file"
                  multiple
                  accept={acceptedTypes.join(',')}
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200/50 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-3">
            <span className="text-white font-bold text-lg">📷</span>
          </div>
          <h4 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Photo Tips</h4>
        </div>
        <ul className="text-sm text-blue-800 space-y-3">
          <li className="flex items-start">
            <span className="w-2 h-2 rounded-full bg-blue-500 mr-3 mt-2 flex-shrink-0"></span>
            <span className="font-medium">Take clear, well-lit photos from multiple angles</span>
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 rounded-full bg-purple-500 mr-3 mt-2 flex-shrink-0"></span>
            <span className="font-medium">The first photo will be shown as the main image</span>
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 rounded-full bg-blue-500 mr-3 mt-2 flex-shrink-0"></span>
            <span className="font-medium">Show the item's condition and important features</span>
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 rounded-full bg-purple-500 mr-3 mt-2 flex-shrink-0"></span>
            <span className="font-medium">Avoid blurry or dark images</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ImageUploader;