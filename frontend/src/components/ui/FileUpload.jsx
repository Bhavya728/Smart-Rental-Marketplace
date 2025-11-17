import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image, File, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * FileUpload Component
 * Drag & drop file upload with preview and validation
 */
const FileUpload = ({
  onFileSelect,
  accept = 'image/*',
  multiple = false,
  maxSize = 5 * 1024 * 1024, // 5MB
  maxFiles = 5,
  className = '',
  children,
  disabled = false,
  showPreview = true,
  variant = 'default' // default, compact, button
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState([]);
  const fileInputRef = useRef(null);

  // Validate files
  const validateFiles = useCallback((fileList) => {
    const validFiles = [];
    const newErrors = [];

    Array.from(fileList).forEach((file, index) => {
      // Check file size
      if (file.size > maxSize) {
        newErrors.push(`File "${file.name}" is too large. Maximum size is ${(maxSize / (1024 * 1024)).toFixed(1)}MB`);
        return;
      }

      // Check file count
      if (!multiple && validFiles.length >= 1) {
        newErrors.push('Only one file is allowed');
        return;
      }

      if (multiple && validFiles.length >= maxFiles) {
        newErrors.push(`Maximum ${maxFiles} files allowed`);
        return;
      }

      // Check file type if accept is specified
      if (accept && accept !== '*/*') {
        const acceptedTypes = accept.split(',').map(type => type.trim());
        const isValidType = acceptedTypes.some(type => {
          if (type.startsWith('.')) {
            return file.name.toLowerCase().endsWith(type.toLowerCase());
          }
          return file.type.match(type);
        });

        if (!isValidType) {
          newErrors.push(`File "${file.name}" type not allowed. Accepted types: ${accept}`);
          return;
        }
      }

      validFiles.push({
        file,
        id: `${file.name}-${file.size}-${index}`,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'ready'
      });
    });

    return { validFiles, errors: newErrors };
  }, [accept, maxSize, maxFiles, multiple]);

  // Handle file selection
  const handleFileSelection = useCallback((fileList) => {
    const { validFiles, errors } = validateFiles(fileList);
    
    setErrors(errors);
    
    if (validFiles.length > 0) {
      const newFiles = multiple ? [...files, ...validFiles] : validFiles;
      setFiles(newFiles);
      
      if (onFileSelect) {
        onFileSelect(multiple ? validFiles.map(f => f.file) : validFiles[0].file);
      }
    }
  }, [files, multiple, onFileSelect, validateFiles]);

  // Drag handlers
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragActive(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragActive(false);
    }
  }, [disabled]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!disabled) {
      setIsDragActive(false);
      const droppedFiles = e.dataTransfer.files;
      if (droppedFiles.length > 0) {
        handleFileSelection(droppedFiles);
      }
    }
  }, [disabled, handleFileSelection]);

  // Click handler
  const handleClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  }, [disabled]);

  // File input change handler
  const handleInputChange = useCallback((e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files);
    }
    // Reset input value to allow re-selecting the same file
    e.target.value = '';
  }, [handleFileSelection]);

  // Remove file
  const removeFile = useCallback((fileId) => {
    setFiles(prev => {
      const updated = prev.filter(f => f.id !== fileId);
      if (onFileSelect) {
        onFileSelect(multiple ? updated.map(f => f.file) : updated[0]?.file || null);
      }
      return updated;
    });
  }, [multiple, onFileSelect]);

  // Clear all files
  const clearFiles = useCallback(() => {
    setFiles([]);
    setErrors([]);
    if (onFileSelect) {
      onFileSelect(multiple ? [] : null);
    }
  }, [multiple, onFileSelect]);

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Render variants
  if (variant === 'button') {
    return (
      <div className={className}>
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled}
          className={`
            inline-flex items-center px-4 py-2 border border-transparent
            text-sm font-medium rounded-md shadow-sm
            text-white bg-primary-600 hover:bg-primary-700
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-200
          `}
        >
          <Upload size={16} className="mr-2" />
          Upload Files
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`space-y-2 ${className}`}>
        <div
          onClick={handleClick}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-lg p-4
            transition-all duration-200 cursor-pointer
            ${isDragActive 
              ? 'border-primary-500 bg-primary-50' 
              : 'border-gray-300 hover:border-gray-400'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <div className="flex items-center space-x-3">
            <Upload size={20} className="text-gray-400" />
            <div className="flex-1">
              <p className="text-sm text-gray-600">
                Drag files here or click to browse
              </p>
              <p className="text-xs text-gray-400">
                {accept} • Max {formatFileSize(maxSize)}
              </p>
            </div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />
      </div>
    );
  }

  // Default variant
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-8
          transition-all duration-300 cursor-pointer
          ${isDragActive 
            ? 'border-primary-500 bg-primary-50 scale-105' 
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <div className="text-center">
          {children || (
            <>
              <Upload 
                size={48} 
                className={`mx-auto mb-4 ${isDragActive ? 'text-primary-500' : 'text-gray-400'}`}
              />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {isDragActive ? 'Drop files here' : 'Upload files'}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Drag and drop your files here, or click to browse
              </p>
              <p className="text-xs text-gray-400">
                Supports: {accept} • Max size: {formatFileSize(maxSize)}
                {multiple && ` • Max files: ${maxFiles}`}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Error Messages */}
      <AnimatePresence>
        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2"
          >
            {errors.map((error, index) => (
              <div key={index} className="flex items-center space-x-2 text-red-600 text-sm">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* File Preview */}
      {showPreview && files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">
              Selected Files ({files.length})
            </h4>
            {files.length > 1 && (
              <button
                onClick={clearFiles}
                className="text-xs text-red-600 hover:text-red-700"
              >
                Clear All
              </button>
            )}
          </div>
          
          <div className="space-y-2">
            <AnimatePresence>
              {files.map((fileObj) => (
                <motion.div
                  key={fileObj.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  {/* File Icon/Preview */}
                  <div className="flex-shrink-0">
                    {fileObj.preview ? (
                      <img
                        src={fileObj.preview}
                        alt={fileObj.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                        <File size={20} className="text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {fileObj.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(fileObj.size)}
                    </p>
                  </div>

                  {/* Status */}
                  <div className="flex-shrink-0">
                    <CheckCircle size={16} className="text-green-500" />
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFile(fileObj.id)}
                    className="flex-shrink-0 p-1 hover:bg-gray-200 rounded"
                  >
                    <X size={16} className="text-gray-400 hover:text-red-500" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;