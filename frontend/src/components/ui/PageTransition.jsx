/**
 * PageTransition Component
 * Smooth page transitions with multiple animation types
 */

import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FadeTransition, SlideTransition, ScaleTransition } from '../../utils/transitions.jsx';
import { DURATION, EASING } from '../../utils/animations';
import { cn } from '../../utils/cn';

const PageTransition = ({ 
  children, 
  type = 'fade',
  duration = DURATION.DEFAULT,
  className,
  loading = false,
  loadingComponent = null
}) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('in');

  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage('out');
    }
  }, [location, displayLocation]);

  const onExitComplete = () => {
    setDisplayLocation(location);
    setTransitionStage('in');
  };

  const TransitionComponent = {
    fade: FadeTransition,
    slide: SlideTransition,
    scale: ScaleTransition
  }[type] || FadeTransition;

  const transitionProps = {
    fade: {
      show: transitionStage === 'in',
      duration: duration,
      onExited: onExitComplete
    },
    slide: {
      show: transitionStage === 'in',
      direction: 'right',
      duration: duration,
      onExited: onExitComplete
    },
    scale: {
      show: transitionStage === 'in',
      origin: 'center',
      duration: duration,
      onExited: onExitComplete
    }
  }[type] || {};

  if (loading && loadingComponent) {
    return (
      <FadeTransition show={true} duration={DURATION.FAST}>
        <div className={cn('min-h-screen flex items-center justify-center', className)}>
          {loadingComponent}
        </div>
      </FadeTransition>
    );
  }

  return (
    <TransitionComponent {...transitionProps}>
      <div className={className} key={displayLocation.pathname}>
        {children}
      </div>
    </TransitionComponent>
  );
};

// Route-specific page transitions
export const RouteTransition = ({ 
  children, 
  routes = {},
  defaultTransition = 'fade',
  className 
}) => {
  const location = useLocation();
  
  const getTransitionType = () => {
    const route = Object.keys(routes).find(path => 
      location.pathname.startsWith(path)
    );
    return routes[route] || defaultTransition;
  };

  return (
    <PageTransition 
      type={getTransitionType()} 
      className={className}
    >
      {children}
    </PageTransition>
  );
};

// Loading page transition
export const LoadingTransition = ({ 
  isLoading, 
  children, 
  loadingComponent,
  minLoadingTime = 500,
  className 
}) => {
  const [showLoading, setShowLoading] = useState(isLoading);
  const [loadingStartTime, setLoadingStartTime] = useState(null);

  useEffect(() => {
    if (isLoading) {
      setLoadingStartTime(Date.now());
      setShowLoading(true);
    } else if (loadingStartTime) {
      const elapsed = Date.now() - loadingStartTime;
      const remaining = Math.max(0, minLoadingTime - elapsed);
      
      setTimeout(() => {
        setShowLoading(false);
        setLoadingStartTime(null);
      }, remaining);
    }
  }, [isLoading, loadingStartTime, minLoadingTime]);

  if (showLoading) {
    return (
      <FadeTransition show={true} duration={DURATION.FAST}>
        <div className={cn('min-h-screen flex items-center justify-center', className)}>
          {loadingComponent || <DefaultLoadingSpinner />}
        </div>
      </FadeTransition>
    );
  }

  return (
    <FadeTransition show={true} duration={DURATION.DEFAULT}>
      {children}
    </FadeTransition>
  );
};

// Default loading spinner component
const DefaultLoadingSpinner = () => (
  <div className="flex flex-col items-center space-y-4">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    <p className="text-gray-600">Loading...</p>
  </div>
);

// Stagger children animation for page content
export const StaggerContainer = ({ 
  children, 
  staggerDelay = 50,
  className,
  show = true 
}) => {
  const childArray = React.Children.toArray(children);

  return (
    <div className={className}>
      {childArray.map((child, index) => (
        <FadeTransition
          key={index}
          show={show}
          duration={DURATION.DEFAULT}
          delay={index * staggerDelay}
        >
          {child}
        </FadeTransition>
      ))}
    </div>
  );
};

// Page section animations
export const PageSection = ({ 
  children, 
  animation = 'slideUp',
  delay = 0,
  className,
  triggerOnce = true 
}) => {
  const [isInView, setIsInView] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (triggerOnce) {
            setHasTriggered(true);
            observer.disconnect();
          }
        } else if (!triggerOnce && !hasTriggered) {
          setIsInView(false);
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [triggerOnce, hasTriggered]);

  const animations = {
    slideUp: {
      component: SlideTransition,
      props: { direction: 'up' }
    },
    slideDown: {
      component: SlideTransition,
      props: { direction: 'down' }
    },
    slideLeft: {
      component: SlideTransition,
      props: { direction: 'left' }
    },
    slideRight: {
      component: SlideTransition,
      props: { direction: 'right' }
    },
    fade: {
      component: FadeTransition,
      props: {}
    },
    scale: {
      component: ScaleTransition,
      props: { origin: 'center' }
    }
  };

  const animationConfig = animations[animation] || animations.fade;
  const TransitionComponent = animationConfig.component;

  return (
    <div ref={ref} className={className}>
      <TransitionComponent
        show={isInView}
        delay={delay}
        duration={DURATION.DEFAULT}
        {...animationConfig.props}
      >
        {children}
      </TransitionComponent>
    </div>
  );
};

// Breadcrumb trail animation
export const BreadcrumbTransition = ({ items, className }) => {
  return (
    <nav className={cn('flex items-center space-x-1', className)}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <FadeTransition
            show={true}
            delay={index * 100}
            duration={DURATION.FAST}
          >
            <span className={cn(
              'text-sm',
              index === items.length - 1 
                ? 'text-gray-900 font-medium' 
                : 'text-gray-500 hover:text-gray-700'
            )}>
              {item.href ? (
                <a href={item.href} className="hover:underline">
                  {item.label}
                </a>
              ) : (
                item.label
              )}
            </span>
          </FadeTransition>
          
          {index < items.length - 1 && (
            <FadeTransition
              show={true}
              delay={(index + 0.5) * 100}
              duration={DURATION.FAST}
            >
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </FadeTransition>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default PageTransition;