import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Carousel = ({ 
  children, 
  autoplay = false, 
  autoplayInterval = 3000,
  showArrows = true,
  showDots = true,
  infinite = true,
  slidesToShow = 1,
  slidesToScroll = 1,
  className = "",
  onSlideChange
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const carouselRef = useRef(null);
  const autoplayRef = useRef(null);

  const slides = React.Children.toArray(children);
  const totalSlides = slides.length;
  const maxSlides = Math.ceil(totalSlides / slidesToShow);

  // Auto advance slides
  const startAutoplay = useCallback(() => {
    if (autoplay && totalSlides > slidesToShow) {
      autoplayRef.current = setInterval(() => {
        setCurrentSlide(prev => {
          const nextSlide = prev + 1;
          return nextSlide >= maxSlides ? (infinite ? 0 : prev) : nextSlide;
        });
      }, autoplayInterval);
    }
  }, [autoplay, autoplayInterval, totalSlides, slidesToShow, maxSlides, infinite]);

  const stopAutoplay = useCallback(() => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
  }, []);

  useEffect(() => {
    startAutoplay();
    return stopAutoplay;
  }, [startAutoplay, stopAutoplay]);

  // Handle slide change
  useEffect(() => {
    if (onSlideChange) {
      onSlideChange(currentSlide);
    }
  }, [currentSlide, onSlideChange]);

  const goToSlide = (slideIndex) => {
    if (isTransitioning) return;
    
    const clampedIndex = Math.max(0, Math.min(slideIndex, maxSlides - 1));
    setCurrentSlide(clampedIndex);
    setIsTransitioning(true);
    
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const nextSlide = () => {
    if (isTransitioning) return;
    
    const nextIndex = currentSlide + slidesToScroll;
    if (nextIndex >= maxSlides) {
      if (infinite) {
        goToSlide(0);
      }
    } else {
      goToSlide(nextIndex);
    }
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    
    const prevIndex = currentSlide - slidesToScroll;
    if (prevIndex < 0) {
      if (infinite) {
        goToSlide(maxSlides - 1);
      }
    } else {
      goToSlide(prevIndex);
    }
  };

  // Touch handlers
  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
    stopAutoplay();
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const threshold = 50;

    if (Math.abs(distance) > threshold) {
      if (distance > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    
    setTouchStart(0);
    setTouchEnd(0);
    startAutoplay();
  };

  const handleMouseEnter = () => {
    stopAutoplay();
  };

  const handleMouseLeave = () => {
    startAutoplay();
  };

  if (totalSlides === 0) {
    return null;
  }

  const slideWidth = 100 / slidesToShow;
  const translateX = -currentSlide * (100 / slidesToShow) * slidesToScroll;

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Main carousel */}
      <div
        ref={carouselRef}
        className="flex transition-transform duration-300 ease-in-out"
        style={{ transform: `translateX(${translateX}%)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {slides.map((slide, index) => (
          <div
            key={index}
            className="flex-shrink-0"
            style={{ width: `${slideWidth}%` }}
          >
            {slide}
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      {showArrows && totalSlides > slidesToShow && (
        <>
          <button
            onClick={prevSlide}
            disabled={!infinite && currentSlide === 0}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button
            onClick={nextSlide}
            disabled={!infinite && currentSlide >= maxSlides - 1}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dots indicator */}
      {showDots && totalSlides > slidesToShow && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {Array.from({ length: maxSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                currentSlide === index
                  ? 'bg-white'
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Progress bar (optional) */}
      {autoplay && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-black/20">
          <div
            className="h-full bg-white/80 transition-all duration-100"
            style={{
              width: `${((currentSlide + 1) / maxSlides) * 100}%`,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Carousel;