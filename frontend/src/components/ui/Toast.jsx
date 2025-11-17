import React, { useState, useEffect, createContext, useContext } from 'react';
import { X, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';

// Toast Context
const ToastContext = createContext();

const Toast = ({ 
  message, 
  type = 'info', 
  isVisible, 
  onClose, 
  duration = 5000,
  position = 'top-right' 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      
      if (duration > 0) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);

        return () => clearTimeout(timer);
      }
    }
  }, [isVisible, duration]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const getToastStyles = () => {
    const baseStyles = "fixed z-50 flex items-center p-4 mb-4 text-sm text-gray-800 rounded-lg shadow-lg backdrop-blur-md transition-all duration-300 transform";
    
    const typeStyles = {
      success: "bg-green-100/90 border border-green-300 text-green-800",
      error: "bg-red-100/90 border border-red-300 text-red-800", 
      warning: "bg-yellow-100/90 border border-yellow-300 text-yellow-800",
      info: "bg-blue-100/90 border border-blue-300 text-blue-800"
    };

    const positionStyles = {
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
      'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
    };

    const animationStyles = isAnimating && isVisible 
      ? 'translate-x-0 opacity-100 scale-100' 
      : position.includes('right') 
        ? 'translate-x-full opacity-0 scale-95'
        : position.includes('left')
        ? '-translate-x-full opacity-0 scale-95'
        : 'translate-y-4 opacity-0 scale-95';

    return `${baseStyles} ${typeStyles[type]} ${positionStyles[position]} ${animationStyles}`;
  };

  const getIcon = () => {
    const iconProps = { size: 20, className: "mr-2 flex-shrink-0" };
    
    switch (type) {
      case 'success':
        return <CheckCircle {...iconProps} className="mr-2 flex-shrink-0 text-green-600" />;
      case 'error':
        return <XCircle {...iconProps} className="mr-2 flex-shrink-0 text-red-600" />;
      case 'warning':
        return <AlertTriangle {...iconProps} className="mr-2 flex-shrink-0 text-yellow-600" />;
      default:
        return <Info {...iconProps} className="mr-2 flex-shrink-0 text-blue-600" />;
    }
  };

  if (!isVisible && !isAnimating) return null;

  return (
    <div className={getToastStyles()}>
      {getIcon()}
      <div className="flex-1 font-medium">
        {message}
      </div>
      <button
        onClick={handleClose}
        className="ml-2 p-1 rounded-full hover:bg-gray-200/50 transition-colors duration-200"
        aria-label="Close notification"
      >
        <X size={16} />
      </button>
    </div>
  );
};

// Toast Container for managing multiple toasts
export const ToastContainer = ({ toasts, removeToast, position = 'top-right' }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={() => removeToast(toast.id)}
          duration={toast.duration}
          position={position}
        />
      ))}
    </div>
  );
};

// Hook for managing toasts
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 5000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = {
      id,
      message,
      type,
      duration,
      isVisible: true
    };

    setToasts(prevToasts => [...prevToasts, newToast]);

    return id;
  };

  const removeToast = (id) => {
    setToasts(prevToasts => 
      prevToasts.map(toast => 
        toast.id === id ? { ...toast, isVisible: false } : toast
      )
    );

    // Remove from array after animation
    setTimeout(() => {
      setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
    }, 300);
  };

  const showSuccess = (message, duration) => addToast(message, 'success', duration);
  const showError = (message, duration) => addToast(message, 'error', duration);
  const showWarning = (message, duration) => addToast(message, 'warning', duration);
  const showInfo = (message, duration) => addToast(message, 'info', duration);

  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};

// Toast Provider Component
export const ToastProvider = ({ children, position = 'top-right' }) => {
  const toastUtils = useToast();

  return (
    <ToastContext.Provider value={toastUtils}>
      {children}
      <ToastContainer 
        toasts={toastUtils.toasts} 
        removeToast={toastUtils.removeToast}
        position={position}
      />
    </ToastContext.Provider>
  );
};

// Custom hook to use toast context
export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
};

export default Toast;