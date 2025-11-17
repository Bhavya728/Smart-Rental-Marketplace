/**
 * Transition Utilities
 * Advanced transition helpers and components for smooth UI state changes
 */

import React, { useState, useEffect, useRef } from 'react';
import { DURATION, EASING } from './animations';

/**
 * Transition configuration presets
 */
export const TRANSITION_PRESETS = {
  // Fade transitions
  FADE: {
    duration: DURATION.DEFAULT,
    timingFunction: EASING.SMOOTH,
    property: 'opacity'
  },
  
  // Scale transitions
  SCALE: {
    duration: DURATION.DEFAULT,
    timingFunction: EASING.BOUNCE,
    property: 'transform'
  },
  
  // Color transitions
  COLOR: {
    duration: DURATION.SLOW,
    timingFunction: EASING.SMOOTH,
    property: 'background-color, color, border-color'
  },
  
  // Size transitions
  SIZE: {
    duration: DURATION.DEFAULT,
    timingFunction: EASING.SMOOTH,
    property: 'width, height'
  },
  
  // Position transitions
  POSITION: {
    duration: DURATION.DEFAULT,
    timingFunction: EASING.SMOOTH,
    property: 'transform'
  },
  
  // All properties
  ALL: {
    duration: DURATION.DEFAULT,
    timingFunction: EASING.SMOOTH,
    property: 'all'
  }
};

/**
 * Transition states for complex animations
 */
export const TRANSITION_STATES = {
  ENTERING: 'entering',
  ENTERED: 'entered',
  EXITING: 'exiting',
  EXITED: 'exited'
};

/**
 * Custom hook for managing transition states
 */
export const useTransition = (show, config = {}) => {
  const {
    duration = DURATION.DEFAULT,
    onEnter,
    onEntered,
    onExit,
    onExited
  } = config;

  const [state, setState] = useState(show ? TRANSITION_STATES.ENTERED : TRANSITION_STATES.EXITED);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (show) {
      // Start entering
      setState(TRANSITION_STATES.ENTERING);
      onEnter?.();
      
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Complete entering after duration
      timeoutRef.current = setTimeout(() => {
        setState(TRANSITION_STATES.ENTERED);
        onEntered?.();
      }, duration);
    } else {
      // Start exiting
      setState(TRANSITION_STATES.EXITING);
      onExit?.();
      
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Complete exiting after duration
      timeoutRef.current = setTimeout(() => {
        setState(TRANSITION_STATES.EXITED);
        onExited?.();
      }, duration);
    }

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [show, duration, onEnter, onEntered, onExit, onExited]);

  return state;
};

/**
 * Transition component for declarative transitions
 */
export const Transition = ({
  show,
  enter = '',
  enterFrom = '',
  enterTo = '',
  leave = '',
  leaveFrom = '',
  leaveTo = '',
  duration = DURATION.DEFAULT,
  children,
  onEnter,
  onEntered,
  onExit,
  onExited,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(show);
  const [classes, setClasses] = useState('');
  const elementRef = useRef(null);

  useEffect(() => {
    if (show) {
      // Show element
      setIsVisible(true);
      onEnter?.();
      
      // Apply enter-from classes
      setClasses(`${enter} ${enterFrom}`);
      
      // Force reflow
      if (elementRef.current) {
        elementRef.current.offsetHeight;
      }
      
      // Apply enter-to classes
      requestAnimationFrame(() => {
        setClasses(`${enter} ${enterTo}`);
      });
      
      // Complete transition
      setTimeout(() => {
        setClasses('');
        onEntered?.();
      }, duration);
    } else {
      onExit?.();
      
      // Apply leave-from classes
      setClasses(`${leave} ${leaveFrom}`);
      
      // Force reflow
      if (elementRef.current) {
        elementRef.current.offsetHeight;
      }
      
      // Apply leave-to classes
      requestAnimationFrame(() => {
        setClasses(`${leave} ${leaveTo}`);
      });
      
      // Hide element after transition
      setTimeout(() => {
        setIsVisible(false);
        setClasses('');
        onExited?.();
      }, duration);
    }
  }, [show, enter, enterFrom, enterTo, leave, leaveFrom, leaveTo, duration, onEnter, onEntered, onExit, onExited]);

  if (!isVisible) {
    return null;
  }

  return React.cloneElement(children, {
    ...props,
    ref: elementRef,
    className: `${children.props.className || ''} ${classes}`.trim()
  });
};

/**
 * Fade transition component
 */
export const FadeTransition = ({ show, duration = DURATION.DEFAULT, children, ...props }) => (
  <Transition
    show={show}
    enter={`transition-opacity duration-[${duration}ms] ease-in-out`}
    enterFrom="opacity-0"
    enterTo="opacity-100"
    leave={`transition-opacity duration-[${duration}ms] ease-in-out`}
    leaveFrom="opacity-100"
    leaveTo="opacity-0"
    duration={duration}
    {...props}
  >
    {children}
  </Transition>
);

/**
 * Scale transition component
 */
export const ScaleTransition = ({ 
  show, 
  duration = DURATION.DEFAULT, 
  scale = 'scale-95',
  children, 
  ...props 
}) => (
  <Transition
    show={show}
    enter={`transition-all duration-[${duration}ms] ease-out`}
    enterFrom={`opacity-0 ${scale}`}
    enterTo="opacity-100 scale-100"
    leave={`transition-all duration-[${duration}ms] ease-in`}
    leaveFrom="opacity-100 scale-100"
    leaveTo={`opacity-0 ${scale}`}
    duration={duration}
    {...props}
  >
    {children}
  </Transition>
);

/**
 * Slide transition component
 */
export const SlideTransition = ({ 
  show, 
  direction = 'right', 
  duration = DURATION.DEFAULT, 
  children, 
  ...props 
}) => {
  const directions = {
    up: { from: 'translate-y-full', to: 'translate-y-0' },
    down: { from: '-translate-y-full', to: 'translate-y-0' },
    left: { from: 'translate-x-full', to: 'translate-x-0' },
    right: { from: '-translate-x-full', to: 'translate-x-0' }
  };
  
  const dir = directions[direction] || directions.right;
  
  return (
    <Transition
      show={show}
      enter={`transition-transform duration-[${duration}ms] ease-out`}
      enterFrom={dir.from}
      enterTo={dir.to}
      leave={`transition-transform duration-[${duration}ms] ease-in`}
      leaveFrom={dir.to}
      leaveTo={dir.from}
      duration={duration}
      {...props}
    >
      {children}
    </Transition>
  );
};

/**
 * Collapse transition component
 */
export const CollapseTransition = ({ show, duration = DURATION.DEFAULT, children, ...props }) => {
  const [height, setHeight] = useState(show ? 'auto' : '0px');
  const [overflow, setOverflow] = useState('hidden');
  const contentRef = useRef(null);

  useEffect(() => {
    if (show) {
      // Get the natural height
      const element = contentRef.current;
      if (element) {
        const naturalHeight = element.scrollHeight;
        setHeight(`${naturalHeight}px`);
        setOverflow('hidden');
        
        // Set to auto after transition
        setTimeout(() => {
          setHeight('auto');
          setOverflow('visible');
        }, duration);
      }
    } else {
      // Get current height and animate to 0
      const element = contentRef.current;
      if (element) {
        const currentHeight = element.offsetHeight;
        setHeight(`${currentHeight}px`);
        setOverflow('hidden');
        
        // Force reflow then animate to 0
        requestAnimationFrame(() => {
          setHeight('0px');
        });
      }
    }
  }, [show, duration]);

  return (
    <div
      style={{
        height,
        overflow,
        transition: `height ${duration}ms ${EASING.SMOOTH}`
      }}
    >
      <div ref={contentRef} {...props}>
        {children}
      </div>
    </div>
  );
};

/**
 * Staggered transition hook for multiple elements
 */
export const useStaggeredTransition = (items, show, config = {}) => {
  const {
    staggerDelay = 50,
    duration = DURATION.DEFAULT
  } = config;

  const [visibleItems, setVisibleItems] = useState(show ? items.map(() => true) : items.map(() => false));

  useEffect(() => {
    if (show) {
      // Show items with stagger delay
      items.forEach((_, index) => {
        setTimeout(() => {
          setVisibleItems(prev => {
            const newState = [...prev];
            newState[index] = true;
            return newState;
          });
        }, index * staggerDelay);
      });
    } else {
      // Hide items with stagger delay (reverse order)
      items.forEach((_, index) => {
        setTimeout(() => {
          setVisibleItems(prev => {
            const newState = [...prev];
            newState[items.length - 1 - index] = false;
            return newState;
          });
        }, index * staggerDelay);
      });
    }
  }, [items, show, staggerDelay]);

  return visibleItems;
};

/**
 * Morphing transition for shape changes
 */
export const useMorphTransition = (fromShape, toShape, progress) => {
  const [currentShape, setCurrentShape] = useState(fromShape);

  useEffect(() => {
    // Interpolate between shapes based on progress (0-1)
    const interpolateStyle = (from, to, progress) => {
      const result = {};
      
      Object.keys(to).forEach(key => {
        if (typeof from[key] === 'number' && typeof to[key] === 'number') {
          result[key] = from[key] + (to[key] - from[key]) * progress;
        } else {
          result[key] = progress > 0.5 ? to[key] : from[key];
        }
      });
      
      return result;
    };

    setCurrentShape(interpolateStyle(fromShape, toShape, progress));
  }, [fromShape, toShape, progress]);

  return currentShape;
};

/**
 * Utility functions for transition management
 */
export const transitionUtils = {
  // Get transition classes for Tailwind CSS
  getTransitionClasses: (preset = 'ALL') => {
    const config = TRANSITION_PRESETS[preset] || TRANSITION_PRESETS.ALL;
    return `transition-[${config.property}] duration-[${config.duration}ms] ${config.timingFunction}`;
  },

  // Create custom transition
  createTransition: (properties, duration = DURATION.DEFAULT, easing = EASING.SMOOTH) => {
    return {
      transition: `${properties} ${duration}ms ${easing}`
    };
  },

  // Batch transition for multiple elements
  batchTransition: (elements, properties, options = {}) => {
    const {
      duration = DURATION.DEFAULT,
      easing = EASING.SMOOTH,
      stagger = 0
    } = options;

    elements.forEach((element, index) => {
      setTimeout(() => {
        Object.assign(element.style, {
          transition: `${properties} ${duration}ms ${easing}`,
          ...options.styles
        });
      }, index * stagger);
    });
  }
};

export default {
  TRANSITION_PRESETS,
  TRANSITION_STATES,
  useTransition,
  Transition,
  FadeTransition,
  ScaleTransition,
  SlideTransition,
  CollapseTransition,
  useStaggeredTransition,
  useMorphTransition,
  transitionUtils
};