import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/cn';

// Base Modal Component
const Modal = ({ 
  isOpen, 
  onClose, 
  children, 
  className,
  size = 'md',
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
  ...props 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const sizeStyles = {
    xs: 'max-w-md',
    sm: 'max-w-lg',
    md: 'max-w-xl',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl',
    full: 'max-w-none m-4'
  };

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      setIsVisible(false);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && closeOnEscape && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, closeOnEscape]);

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget && closeOnBackdrop) {
      onClose();
    }
  };

  if (!isOpen && !isVisible) return null;

  const modalContent = (
    <div 
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-4',
        'bg-black bg-opacity-50 transition-opacity duration-300',
        isOpen ? 'opacity-100' : 'opacity-0'
      )}
      onClick={handleBackdropClick}
      {...props}
    >
      <div
        className={cn(
          'relative w-full bg-white rounded-lg shadow-xl transition-all duration-300',
          'transform',
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
          sizeStyles[size],
          className
        )}
      >
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        {children}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

// Modal Header Component
export const ModalHeader = ({ className, children, ...props }) => {
  const headerStyles = cn(
    'px-6 py-4 border-b border-gray-200',
    className
  );

  return (
    <div className={headerStyles} {...props}>
      {children}
    </div>
  );
};

// Modal Title Component
export const ModalTitle = ({ className, children, ...props }) => {
  const titleStyles = cn(
    'text-lg font-semibold text-gray-900 pr-8',
    className
  );

  return (
    <h2 className={titleStyles} {...props}>
      {children}
    </h2>
  );
};

// Modal Description Component
export const ModalDescription = ({ className, children, ...props }) => {
  const descStyles = cn(
    'text-sm text-gray-600 mt-1 pr-8',
    className
  );

  return (
    <p className={descStyles} {...props}>
      {children}
    </p>
  );
};

// Modal Content Component
export const ModalContent = ({ className, children, ...props }) => {
  const contentStyles = cn(
    'px-6 py-4',
    className
  );

  return (
    <div className={contentStyles} {...props}>
      {children}
    </div>
  );
};

// Modal Footer Component
export const ModalFooter = ({ className, children, ...props }) => {
  const footerStyles = cn(
    'px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3',
    className
  );

  return (
    <div className={footerStyles} {...props}>
      {children}
    </div>
  );
};

// Confirmation Modal Component
export const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning',
  loading = false,
  className,
  ...props 
}) => {
  const typeStyles = {
    warning: {
      icon: 'text-yellow-600',
      button: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
    },
    danger: {
      icon: 'text-red-600',
      button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
    },
    info: {
      icon: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
    }
  };

  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Confirmation action failed:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" className={className} {...props}>
      <ModalContent>
        <div className="flex items-start space-x-4">
          <div className={cn('flex-shrink-0 p-2 rounded-full', 
            type === 'warning' && 'bg-yellow-100',
            type === 'danger' && 'bg-red-100',
            type === 'info' && 'bg-blue-100'
          )}>
            {type === 'warning' && (
              <svg className={cn('w-6 h-6', typeStyles[type].icon)} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            )}
            {type === 'danger' && (
              <svg className={cn('w-6 h-6', typeStyles[type].icon)} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
            {type === 'info' && (
              <svg className={cn('w-6 h-6', typeStyles[type].icon)} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-600">{message}</p>
          </div>
        </div>
      </ModalContent>
      
      <ModalFooter>
        <button
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {cancelText}
        </button>
        <button
          onClick={handleConfirm}
          disabled={loading}
          className={cn(
            'px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50',
            typeStyles[type].button,
            loading && 'cursor-wait'
          )}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </>
          ) : (
            confirmText
          )}
        </button>
      </ModalFooter>
    </Modal>
  );
};

// Form Modal Component
export const FormModal = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  title,
  description,
  children,
  submitText = 'Submit',
  cancelText = 'Cancel',
  loading = false,
  className,
  ...props 
}) => {
  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(event);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className={className} {...props}>
      <form onSubmit={handleSubmit}>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          {description && <ModalDescription>{description}</ModalDescription>}
        </ModalHeader>
        
        <ModalContent>
          {children}
        </ModalContent>
        
        <ModalFooter>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="submit"
            disabled={loading}
            className={cn(
              'px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50',
              loading && 'cursor-wait'
            )}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </>
            ) : (
              submitText
            )}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
};

// Image Modal Component
export const ImageModal = ({ 
  isOpen, 
  onClose, 
  src, 
  alt = 'Image',
  title,
  className,
  ...props 
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" className={className} {...props}>
      {title && (
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
        </ModalHeader>
      )}
      
      <ModalContent className="p-0">
        <img 
          src={src} 
          alt={alt}
          className="w-full h-auto max-h-[70vh] object-contain rounded-b-lg"
        />
      </ModalContent>
    </Modal>
  );
};

// Drawer Component (Side Modal)
export const Drawer = ({ 
  isOpen, 
  onClose, 
  children, 
  position = 'right',
  size = 'md',
  className,
  ...props 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl'
  };

  const positionStyles = {
    left: {
      container: 'justify-start',
      panel: 'h-full',
      transform: isOpen ? 'translate-x-0' : '-translate-x-full'
    },
    right: {
      container: 'justify-end',
      panel: 'h-full',
      transform: isOpen ? 'translate-x-0' : 'translate-x-full'
    },
    top: {
      container: 'justify-center items-start',
      panel: 'w-full',
      transform: isOpen ? 'translate-y-0' : '-translate-y-full'
    },
    bottom: {
      container: 'justify-center items-end',
      panel: 'w-full',
      transform: isOpen ? 'translate-y-0' : 'translate-y-full'
    }
  };

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      setIsVisible(false);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen && !isVisible) return null;

  const drawerContent = (
    <div 
      className={cn(
        'fixed inset-0 z-50 flex',
        'bg-black bg-opacity-50 transition-opacity duration-300',
        positionStyles[position].container,
        isOpen ? 'opacity-100' : 'opacity-0'
      )}
      onClick={handleBackdropClick}
      {...props}
    >
      <div
        className={cn(
          'relative bg-white shadow-xl transition-transform duration-300',
          positionStyles[position].panel,
          position === 'left' || position === 'right' ? sizeStyles[size] : '',
          positionStyles[position].transform,
          className
        )}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {children}
      </div>
    </div>
  );

  return createPortal(drawerContent, document.body);
};

export default Modal;