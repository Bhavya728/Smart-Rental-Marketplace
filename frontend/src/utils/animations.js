/**
 * Animation Utilities
 * Comprehensive animation helpers and utilities for smooth UI interactions
 */

// Animation duration constants
export const DURATION = {
  INSTANT: 0,
  FAST: 150,
  DEFAULT: 300,
  SLOW: 500,
  SLOWER: 750,
  SLOWEST: 1000
};

// Easing functions
export const EASING = {
  LINEAR: 'linear',
  EASE: 'ease',
  EASE_IN: 'ease-in',
  EASE_OUT: 'ease-out',
  EASE_IN_OUT: 'ease-in-out',
  BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  SMOOTH: 'cubic-bezier(0.4, 0, 0.2, 1)',
  ELASTIC: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  SHARP: 'cubic-bezier(0.4, 0, 0.6, 1)',
  STANDARD: 'cubic-bezier(0.4, 0, 0.2, 1)'
};

// Predefined animation classes
export const ANIMATIONS = {
  // Fade animations
  FADE_IN: 'animate-fadeIn',
  FADE_OUT: 'animate-fadeOut',
  FADE_IN_UP: 'animate-fadeInUp',
  FADE_IN_DOWN: 'animate-fadeInDown',
  FADE_IN_LEFT: 'animate-fadeInLeft',
  FADE_IN_RIGHT: 'animate-fadeInRight',
  
  // Scale animations
  SCALE_IN: 'animate-scaleIn',
  SCALE_OUT: 'animate-scaleOut',
  SCALE_UP: 'animate-scaleUp',
  SCALE_DOWN: 'animate-scaleDown',
  
  // Slide animations
  SLIDE_IN_UP: 'animate-slideInUp',
  SLIDE_IN_DOWN: 'animate-slideInDown',
  SLIDE_IN_LEFT: 'animate-slideInLeft',
  SLIDE_IN_RIGHT: 'animate-slideInRight',
  SLIDE_OUT_UP: 'animate-slideOutUp',
  SLIDE_OUT_DOWN: 'animate-slideOutDown',
  SLIDE_OUT_LEFT: 'animate-slideOutLeft',
  SLIDE_OUT_RIGHT: 'animate-slideOutRight',
  
  // Bounce animations
  BOUNCE_IN: 'animate-bounceIn',
  BOUNCE_OUT: 'animate-bounceOut',
  BOUNCE: 'animate-bounce',
  
  // Pulse and heartbeat
  PULSE: 'animate-pulse',
  HEARTBEAT: 'animate-heartbeat',
  
  // Rotation
  SPIN: 'animate-spin',
  ROTATE_IN: 'animate-rotateIn',
  ROTATE_OUT: 'animate-rotateOut',
  
  // Shake and wobble
  SHAKE: 'animate-shake',
  WOBBLE: 'animate-wobble',
  
  // Loading states
  LOADING_DOTS: 'animate-loadingDots',
  LOADING_BARS: 'animate-loadingBars',
  
  // Special effects
  GLOW: 'animate-glow',
  FLOAT: 'animate-float',
  TYPING: 'animate-typing'
};

/**
 * Animation utility class for programmatic animations
 */
export class AnimationController {
  constructor(element) {
    this.element = element;
    this.currentAnimation = null;
  }

  // Apply animation with promise resolution
  animate(animationClass, options = {}) {
    return new Promise((resolve) => {
      const {
        duration = DURATION.DEFAULT,
        delay = 0,
        fillMode = 'both',
        onStart,
        onEnd
      } = options;

      // Clear previous animation
      this.clearAnimation();

      // Set animation properties
      this.element.style.animationDuration = `${duration}ms`;
      this.element.style.animationDelay = `${delay}ms`;
      this.element.style.animationFillMode = fillMode;

      // Add animation class
      this.element.classList.add(animationClass);
      this.currentAnimation = animationClass;

      // Callback for animation start
      if (onStart) onStart();

      // Handle animation end
      const handleAnimationEnd = () => {
        this.element.removeEventListener('animationend', handleAnimationEnd);
        if (onEnd) onEnd();
        resolve();
      };

      this.element.addEventListener('animationend', handleAnimationEnd);
    });
  }

  // Clear current animation
  clearAnimation() {
    if (this.currentAnimation) {
      this.element.classList.remove(this.currentAnimation);
      this.currentAnimation = null;
    }
  }

  // Chain multiple animations
  sequence(...animations) {
    return animations.reduce((promise, animation) => {
      return promise.then(() => {
        const [animationClass, options] = Array.isArray(animation) 
          ? animation 
          : [animation, {}];
        return this.animate(animationClass, options);
      });
    }, Promise.resolve());
  }
}

/**
 * Stagger animation utility for multiple elements
 */
export const staggerAnimation = (elements, animationClass, options = {}) => {
  const {
    delay = 100,
    baseDelay = 0,
    duration = DURATION.DEFAULT
  } = options;

  return Promise.all(
    Array.from(elements).map((element, index) => {
      const controller = new AnimationController(element);
      return controller.animate(animationClass, {
        ...options,
        delay: baseDelay + (index * delay),
        duration
      });
    })
  );
};

/**
 * Intersection Observer for scroll animations
 */
export class ScrollAnimationObserver {
  constructor(options = {}) {
    const {
      threshold = 0.1,
      rootMargin = '0px 0px -50px 0px',
      triggerOnce = true
    } = options;

    this.triggerOnce = triggerOnce;
    this.animatedElements = new Set();
    
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.handleIntersection(entry.target);
        }
      });
    }, { threshold, rootMargin });
  }

  observe(element, animationClass, options = {}) {
    // Store animation data on element
    element.dataset.animation = animationClass;
    element.dataset.animationOptions = JSON.stringify(options);
    
    // Add to observer
    this.observer.observe(element);
  }

  handleIntersection(element) {
    const animationClass = element.dataset.animation;
    const options = JSON.parse(element.dataset.animationOptions || '{}');
    
    if (animationClass && !this.animatedElements.has(element)) {
      const controller = new AnimationController(element);
      controller.animate(animationClass, options);
      
      this.animatedElements.add(element);
      
      if (this.triggerOnce) {
        this.observer.unobserve(element);
      }
    }
  }

  disconnect() {
    this.observer.disconnect();
  }
}

/**
 * Hover animation utilities
 */
export const hoverAnimations = {
  // Scale on hover
  scaleHover: (element, scale = 1.05) => {
    element.style.transition = `transform ${DURATION.DEFAULT}ms ${EASING.SMOOTH}`;
    
    element.addEventListener('mouseenter', () => {
      element.style.transform = `scale(${scale})`;
    });
    
    element.addEventListener('mouseleave', () => {
      element.style.transform = 'scale(1)';
    });
  },

  // Lift effect on hover
  liftHover: (element, translateY = -5, shadowIntensity = 'md') => {
    element.style.transition = `all ${DURATION.DEFAULT}ms ${EASING.SMOOTH}`;
    
    element.addEventListener('mouseenter', () => {
      element.style.transform = `translateY(${translateY}px)`;
      element.classList.add(`shadow-${shadowIntensity}`);
    });
    
    element.addEventListener('mouseleave', () => {
      element.style.transform = 'translateY(0)';
      element.classList.remove(`shadow-${shadowIntensity}`);
    });
  },

  // Glow effect on hover
  glowHover: (element, glowColor = 'blue') => {
    element.style.transition = `all ${DURATION.DEFAULT}ms ${EASING.SMOOTH}`;
    
    element.addEventListener('mouseenter', () => {
      element.style.boxShadow = `0 0 20px rgba(59, 130, 246, 0.5)`;
    });
    
    element.addEventListener('mouseleave', () => {
      element.style.boxShadow = 'none';
    });
  }
};

/**
 * Loading animation utilities
 */
export const loadingAnimations = {
  // Skeleton loading
  skeleton: (element) => {
    element.classList.add('animate-pulse', 'bg-gray-200', 'rounded');
  },

  // Spinner
  spinner: (element, size = 'md') => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-8 h-8',
      lg: 'w-12 h-12'
    };
    
    element.innerHTML = `
      <div class="inline-block ${sizeClasses[size]} animate-spin rounded-full border-2 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]">
        <span class="sr-only">Loading...</span>
      </div>
    `;
  },

  // Dots loading
  dots: (element) => {
    element.innerHTML = `
      <div class="flex space-x-1">
        <div class="w-2 h-2 bg-current rounded-full animate-bounce"></div>
        <div class="w-2 h-2 bg-current rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
        <div class="w-2 h-2 bg-current rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
      </div>
    `;
  }
};

/**
 * Page transition utilities
 */
export const pageTransitions = {
  fadeTransition: (duration = DURATION.DEFAULT) => ({
    enter: `transition-opacity duration-${duration} ease-in-out`,
    enterFrom: 'opacity-0',
    enterTo: 'opacity-100',
    leave: `transition-opacity duration-${duration} ease-in-out`,
    leaveFrom: 'opacity-100',
    leaveTo: 'opacity-0'
  }),

  slideTransition: (direction = 'right', duration = DURATION.DEFAULT) => {
    const directions = {
      right: { from: 'translate-x-full', to: 'translate-x-0' },
      left: { from: '-translate-x-full', to: 'translate-x-0' },
      up: { from: 'translate-y-full', to: 'translate-y-0' },
      down: { from: '-translate-y-full', to: 'translate-y-0' }
    };
    
    const dir = directions[direction];
    
    return {
      enter: `transition-transform duration-${duration} ease-in-out`,
      enterFrom: dir.from,
      enterTo: dir.to,
      leave: `transition-transform duration-${duration} ease-in-out`,
      leaveFrom: dir.to,
      leaveTo: dir.from
    };
  }
};

/**
 * Form validation animation utilities
 */
export const validationAnimations = {
  // Shake input on error
  shakeError: (element) => {
    element.classList.add('animate-shake');
    setTimeout(() => {
      element.classList.remove('animate-shake');
    }, DURATION.SLOW);
  },

  // Success pulse
  successPulse: (element) => {
    element.classList.add('animate-pulse', 'bg-green-50', 'border-green-500');
    setTimeout(() => {
      element.classList.remove('animate-pulse');
    }, DURATION.SLOW);
  }
};

/**
 * Utility function to create custom animations
 */
export const createAnimation = (name, keyframes, options = {}) => {
  const {
    duration = DURATION.DEFAULT,
    easing = EASING.SMOOTH,
    fillMode = 'both'
  } = options;

  // Create keyframes string
  const keyframeString = Object.entries(keyframes)
    .map(([percentage, styles]) => {
      const styleString = Object.entries(styles)
        .map(([prop, value]) => `${prop}: ${value}`)
        .join('; ');
      return `${percentage} { ${styleString} }`;
    })
    .join(' ');

  // Create and inject CSS
  const style = document.createElement('style');
  style.textContent = `
    @keyframes ${name} {
      ${keyframeString}
    }
    .animate-${name} {
      animation: ${name} ${duration}ms ${easing} ${fillMode};
    }
  `;
  
  document.head.appendChild(style);
  
  return `animate-${name}`;
};

export default {
  DURATION,
  EASING,
  ANIMATIONS,
  AnimationController,
  staggerAnimation,
  ScrollAnimationObserver,
  hoverAnimations,
  loadingAnimations,
  pageTransitions,
  validationAnimations,
  createAnimation
};