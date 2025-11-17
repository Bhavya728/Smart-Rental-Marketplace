import React, { useRef, useEffect, useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

const ScrollArea = ({ 
  children, 
  height = "auto",
  maxHeight = "none",
  className = "",
  showScrollIndicators = true,
  onScroll,
  scrollToBottom = false,
  autoScroll = false
}) => {
  const scrollRef = useRef(null);
  const [showTopIndicator, setShowTopIndicator] = useState(false);
  const [showBottomIndicator, setShowBottomIndicator] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef(null);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    const updateScrollIndicators = () => {
      const { scrollTop, scrollHeight, clientHeight } = element;
      
      setShowTopIndicator(scrollTop > 10);
      setShowBottomIndicator(scrollTop < scrollHeight - clientHeight - 10);
    };

    updateScrollIndicators();
    
    const handleScroll = (e) => {
      updateScrollIndicators();
      
      // Show scrolling state
      setIsScrolling(true);
      
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 150);

      // Call parent scroll handler
      if (onScroll) {
        onScroll(e);
      }
    };

    element.addEventListener('scroll', handleScroll);
    
    // Set up ResizeObserver to update indicators when content changes
    const resizeObserver = new ResizeObserver(() => {
      updateScrollIndicators();
    });
    
    resizeObserver.observe(element);

    return () => {
      element.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [onScroll]);

  // Auto-scroll to bottom effect
  useEffect(() => {
    if (scrollToBottom && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [scrollToBottom, children]);

  // Auto-scroll when new content is added (if near bottom)
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      const element = scrollRef.current;
      const { scrollTop, scrollHeight, clientHeight } = element;
      const isNearBottom = scrollTop > scrollHeight - clientHeight - 100;
      
      if (isNearBottom) {
        element.scrollTop = element.scrollHeight;
      }
    }
  }, [autoScroll, children]);

  const scrollToTop = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  const scrollToBottomSmooth = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const containerStyle = {
    height: height !== "auto" ? height : undefined,
    maxHeight: maxHeight !== "none" ? maxHeight : undefined
  };

  return (
    <div className={`scroll-area-container relative ${className}`} style={containerStyle}>
      {/* Scroll content */}
      <div 
        ref={scrollRef}
        className={`scroll-area-content ${isScrolling ? 'scrolling' : ''}`}
        style={containerStyle}
      >
        {children}
      </div>

      {/* Scroll indicators */}
      {showScrollIndicators && (
        <>
          {showTopIndicator && (
            <button
              onClick={scrollToTop}
              className="scroll-indicator scroll-indicator-top"
              aria-label="Scroll to top"
            >
              <ChevronUp size={16} />
            </button>
          )}
          
          {showBottomIndicator && (
            <button
              onClick={scrollToBottomSmooth}
              className="scroll-indicator scroll-indicator-bottom"
              aria-label="Scroll to bottom"
            >
              <ChevronDown size={16} />
            </button>
          )}
        </>
      )}

      <style jsx>{`
        .scroll-area-container {
          position: relative;
        }

        .scroll-area-content {
          overflow-y: auto;
          overflow-x: hidden;
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 #f1f5f9;
          transition: all 0.2s ease;
        }

        .scroll-area-content::-webkit-scrollbar {
          width: 8px;
        }

        .scroll-area-content::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }

        .scroll-area-content::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
          transition: background-color 0.2s ease;
        }

        .scroll-area-content::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        .scroll-area-content.scrolling::-webkit-scrollbar-thumb {
          background: #64748b;
        }

        /* Hide scrollbar for cleaner look when not scrolling */
        .scroll-area-content:not(.scrolling):not(:hover)::-webkit-scrollbar {
          width: 4px;
        }

        .scroll-area-content:not(.scrolling):not(:hover)::-webkit-scrollbar-thumb {
          background: #e2e8f0;
        }

        .scroll-indicator {
          position: absolute;
          right: 12px;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid #e5e7eb;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(4px);
          z-index: 10;
        }

        .scroll-indicator:hover {
          background: rgba(255, 255, 255, 1);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
          transform: scale(1.05);
        }

        .scroll-indicator-top {
          top: 12px;
          animation: fadeInDown 0.3s ease-out;
        }

        .scroll-indicator-bottom {
          bottom: 12px;
          animation: fadeInUp 0.3s ease-out;
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Dark theme support */
        @media (prefers-color-scheme: dark) {
          .scroll-area-content::-webkit-scrollbar-track {
            background: #374151;
          }

          .scroll-area-content::-webkit-scrollbar-thumb {
            background: #6b7280;
          }

          .scroll-area-content::-webkit-scrollbar-thumb:hover {
            background: #9ca3af;
          }

          .scroll-indicator {
            background: rgba(31, 41, 55, 0.9);
            border-color: #4b5563;
            color: #f9fafb;
          }

          .scroll-indicator:hover {
            background: rgba(31, 41, 55, 1);
          }
        }

        /* Mobile responsiveness */
        @media (max-width: 640px) {
          .scroll-indicator {
            width: 28px;
            height: 28px;
            right: 8px;
          }

          .scroll-indicator-top {
            top: 8px;
          }

          .scroll-indicator-bottom {
            bottom: 8px;
          }

          .scroll-area-content::-webkit-scrollbar {
            width: 6px;
          }

          .scroll-area-content:not(.scrolling):not(:hover)::-webkit-scrollbar {
            width: 3px;
          }
        }

        /* Smooth scrolling */
        .scroll-area-content {
          scroll-behavior: smooth;
        }

        /* Custom focus styles */
        .scroll-indicator:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
        }
      `}</style>
    </div>
  );
};

export default ScrollArea;