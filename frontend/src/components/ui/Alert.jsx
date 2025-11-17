import React from 'react';

const Alert = ({ 
  type = 'info', 
  title, 
  message, 
  children, 
  onClose, 
  className = "",
  showIcon = true 
}) => {
  const alertStyles = {
    success: {
      container: 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-300/60 text-emerald-900 shadow-lg shadow-emerald-200/40 backdrop-blur-sm',
      icon: 'text-emerald-500',
      title: 'text-emerald-900 font-bold',
      message: 'text-emerald-800 font-medium'
    },
    error: {
      container: 'bg-gradient-to-r from-red-50 to-rose-50 border-red-300/60 text-red-900 shadow-lg shadow-red-200/40 backdrop-blur-sm',
      icon: 'text-red-500',
      title: 'text-red-900 font-bold',
      message: 'text-red-800 font-medium'
    },
    warning: {
      container: 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-300/60 text-amber-900 shadow-lg shadow-amber-200/40 backdrop-blur-sm',
      icon: 'text-amber-500',
      title: 'text-amber-900 font-bold',
      message: 'text-amber-800 font-medium'
    },
    info: {
      container: 'bg-gradient-to-r from-blue-50 to-sky-50 border-blue-300/60 text-blue-900 shadow-lg shadow-blue-200/40 backdrop-blur-sm',
      icon: 'text-blue-500',
      title: 'text-blue-900 font-bold',
      message: 'text-blue-800 font-medium'
    }
  };

  const icons = {
    success: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    )
  };

  const styles = alertStyles[type];

  return (
    <div className={`border rounded-lg p-4 ${styles.container} ${className}`}>
      <div className="flex">
        {showIcon && (
          <div className="flex-shrink-0">
            <div className={styles.icon}>
              {icons[type]}
            </div>
          </div>
        )}
        
        <div className={`${showIcon ? 'ml-3' : ''} flex-1`}>
          {title && (
            <h3 className={`text-sm font-medium ${styles.title} mb-1`}>
              {title}
            </h3>
          )}
          
          {message && (
            <div className={`text-sm ${styles.message} ${title ? 'mt-1' : ''}`}>
              {message}
            </div>
          )}
          
          {children && (
            <div className={`text-sm ${styles.message} ${(title || message) ? 'mt-2' : ''}`}>
              {children}
            </div>
          )}
        </div>
        
        {onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                className={`inline-flex rounded-md p-1.5 ${styles.icon} hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent`}
                onClick={onClose}
              >
                <span className="sr-only">Dismiss</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;