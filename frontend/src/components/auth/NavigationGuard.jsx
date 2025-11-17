import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Navigation Guard Hook
export const useNavigationGuard = () => {
  const { 
    isAuthenticated, 
    user, 
    hasRole, 
    isEmailVerified, 
    isPhoneVerified,
    isInitializing
  } = useAuth();

  // Check if user can navigate to a specific route
  const canNavigateTo = (path, requirements = {}) => {
    const {
      requireAuth = false,
      requiredRoles = [],
      requireEmailVerification = false,
      requirePhoneVerification = false,
      blockAuthenticated = false // For login/register pages
    } = requirements;

    // If still initializing, allow navigation (will be handled by route guards)
    if (isInitializing) {
      return { allowed: true };
    }

    // Block authenticated users from auth pages
    if (blockAuthenticated && isAuthenticated) {
      return { 
        allowed: false, 
        reason: 'already_authenticated', 
        redirectTo: '/dashboard' 
      };
    }

    // Check authentication requirement
    if (requireAuth && !isAuthenticated) {
      return { 
        allowed: false, 
        reason: 'authentication_required', 
        redirectTo: '/login',
        returnTo: path
      };
    }

    // Check email verification
    if (requireEmailVerification && !isEmailVerified()) {
      return { 
        allowed: false, 
        reason: 'email_verification_required', 
        redirectTo: '/verify-email' 
      };
    }

    // Check phone verification
    if (requirePhoneVerification && !isPhoneVerified()) {
      return { 
        allowed: false, 
        reason: 'phone_verification_required', 
        redirectTo: '/verify-phone' 
      };
    }

    // Check role requirements
    if (requiredRoles.length > 0 && !hasRole(requiredRoles)) {
      return { 
        allowed: false, 
        reason: 'insufficient_permissions', 
        redirectTo: '/unauthorized' 
      };
    }

    return { allowed: true };
  };

  // Get navigation restrictions for current user
  const getNavigationRestrictions = () => {
    const restrictions = {
      canAccessAuth: !isAuthenticated,
      canAccessDashboard: isAuthenticated,
      canAccessAdmin: hasRole('admin'),
      canAccessOwnerFeatures: hasRole(['owner', 'both', 'admin']),
      canAccessRenterFeatures: hasRole(['renter', 'both', 'admin']),
      needsEmailVerification: isAuthenticated && !isEmailVerified(),
      needsPhoneVerification: isAuthenticated && !isPhoneVerified(),
      userRole: user?.role
    };

    return restrictions;
  };

  return {
    canNavigateTo,
    getNavigationRestrictions,
    isAuthenticated,
    hasRole,
    isEmailVerified,
    isPhoneVerified,
    user
  };
};

// Route Configuration with Guard Rules
export const ROUTE_CONFIG = {
  // Public routes (no authentication required)
  public: {
    home: {
      path: '/',
      title: 'Home',
      requireAuth: false
    },
    about: {
      path: '/about',
      title: 'About',
      requireAuth: false
    },
    contact: {
      path: '/contact',
      title: 'Contact',
      requireAuth: false
    },
    properties: {
      path: '/properties',
      title: 'Properties',
      requireAuth: false
    },
    propertyDetail: {
      path: '/properties/:id',
      title: 'Property Details',
      requireAuth: false
    }
  },

  // Authentication routes (only for non-authenticated users)
  auth: {
    login: {
      path: '/login',
      title: 'Sign In',
      requireAuth: false,
      blockAuthenticated: true
    },
    register: {
      path: '/register',
      title: 'Sign Up',
      requireAuth: false,
      blockAuthenticated: true
    },
    forgotPassword: {
      path: '/forgot-password',
      title: 'Forgot Password',
      requireAuth: false,
      blockAuthenticated: true
    },
    resetPassword: {
      path: '/reset-password',
      title: 'Reset Password',
      requireAuth: false,
      blockAuthenticated: true
    }
  },

  // Protected routes (authentication required)
  protected: {
    dashboard: {
      path: '/dashboard',
      title: 'Dashboard',
      requireAuth: true
    },
    profile: {
      path: '/profile',
      title: 'Profile',
      requireAuth: true
    },
    profileEdit: {
      path: '/profile/edit',
      title: 'Edit Profile',
      requireAuth: true
    },
    settings: {
      path: '/settings',
      title: 'Settings',
      requireAuth: true
    },
    verifyEmail: {
      path: '/verify-email',
      title: 'Verify Email',
      requireAuth: true
    },
    verifyPhone: {
      path: '/verify-phone',
      title: 'Verify Phone',
      requireAuth: true
    }
  },

  // Owner-only routes
  owner: {
    myProperties: {
      path: '/my-properties',
      title: 'My Properties',
      requireAuth: true,
      requiredRoles: ['owner', 'both', 'admin'],
      requireEmailVerification: true
    },
    addProperty: {
      path: '/properties/add',
      title: 'Add Property',
      requireAuth: true,
      requiredRoles: ['owner', 'both', 'admin'],
      requireEmailVerification: true
    },
    editProperty: {
      path: '/properties/:id/edit',
      title: 'Edit Property',
      requireAuth: true,
      requiredRoles: ['owner', 'both', 'admin'],
      requireEmailVerification: true
    },
    ownerBookings: {
      path: '/owner/bookings',
      title: 'Manage Bookings',
      requireAuth: true,
      requiredRoles: ['owner', 'both', 'admin'],
      requireEmailVerification: true
    }
  },

  // Renter-only routes
  renter: {
    myBookings: {
      path: '/my-bookings',
      title: 'My Bookings',
      requireAuth: true,
      requiredRoles: ['renter', 'both', 'admin'],
      requireEmailVerification: true
    },
    favorites: {
      path: '/favorites',
      title: 'Favorites',
      requireAuth: true,
      requiredRoles: ['renter', 'both', 'admin']
    },
    bookProperty: {
      path: '/properties/:id/book',
      title: 'Book Property',
      requireAuth: true,
      requiredRoles: ['renter', 'both', 'admin'],
      requireEmailVerification: true
    }
  },

  // Admin-only routes
  admin: {
    adminDashboard: {
      path: '/admin',
      title: 'Admin Dashboard',
      requireAuth: true,
      requiredRoles: ['admin'],
      requireEmailVerification: true
    },
    manageUsers: {
      path: '/admin/users',
      title: 'Manage Users',
      requireAuth: true,
      requiredRoles: ['admin'],
      requireEmailVerification: true
    },
    manageProperties: {
      path: '/admin/properties',
      title: 'Manage Properties',
      requireAuth: true,
      requiredRoles: ['admin'],
      requireEmailVerification: true
    },
    adminSettings: {
      path: '/admin/settings',
      title: 'Admin Settings',
      requireAuth: true,
      requiredRoles: ['admin'],
      requireEmailVerification: true
    }
  },

  // Special routes
  special: {
    unauthorized: {
      path: '/unauthorized',
      title: 'Unauthorized',
      requireAuth: false
    },
    notFound: {
      path: '/404',
      title: 'Page Not Found',
      requireAuth: false
    },
    maintenance: {
      path: '/maintenance',
      title: 'Under Maintenance',
      requireAuth: false
    }
  }
};

// Navigation Guard Component for programmatic navigation
export const NavigationGuard = ({ to, children, fallback = null, replace = false }) => {
  const { canNavigateTo } = useNavigationGuard();
  const location = useLocation();

  // Find route configuration
  const findRouteConfig = (path) => {
    const allRoutes = Object.values(ROUTE_CONFIG).flat();
    return allRoutes.find(route => 
      route.path === path || 
      (route.path.includes(':') && new RegExp(route.path.replace(/:[^/]+/g, '[^/]+')).test(path))
    );
  };

  const routeConfig = findRouteConfig(to);
  const requirements = routeConfig ? {
    requireAuth: routeConfig.requireAuth,
    requiredRoles: routeConfig.requiredRoles || [],
    requireEmailVerification: routeConfig.requireEmailVerification,
    requirePhoneVerification: routeConfig.requirePhoneVerification,
    blockAuthenticated: routeConfig.blockAuthenticated
  } : {};

  const result = canNavigateTo(to, requirements);

  if (!result.allowed) {
    if (result.returnTo) {
      const redirectPath = `${result.redirectTo}?returnTo=${encodeURIComponent(result.returnTo)}`;
      return <Navigate to={redirectPath} replace={replace} />;
    }
    return <Navigate to={result.redirectTo} replace={replace} />;
  }

  return children || null;
};

// Breadcrumb Guard - shows appropriate breadcrumbs based on permissions
export const BreadcrumbGuard = ({ currentPath }) => {
  const { getNavigationRestrictions } = useNavigationGuard();
  const restrictions = getNavigationRestrictions();

  const generateBreadcrumbs = (path) => {
    const segments = path.split('/').filter(Boolean);
    const breadcrumbs = [{ title: 'Home', path: '/' }];

    let currentPath = '';
    for (const segment of segments) {
      currentPath += `/${segment}`;
      
      // Find route config for current path
      const routeConfig = Object.values(ROUTE_CONFIG)
        .flat()
        .find(route => route.path === currentPath);

      if (routeConfig) {
        // Check if user can access this route
        const canAccess = restrictions.canAccessDashboard || 
                         !routeConfig.requireAuth ||
                         (routeConfig.requiredRoles && restrictions.hasRole?.(routeConfig.requiredRoles));

        if (canAccess) {
          breadcrumbs.push({
            title: routeConfig.title,
            path: currentPath
          });
        }
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs(currentPath);

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {breadcrumbs.map((crumb, index) => (
          <li key={crumb.path} className="flex items-center">
            {index > 0 && (
              <svg 
                className="flex-shrink-0 h-4 w-4 text-gray-400 mx-2" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 5l7 7-7 7" 
                />
              </svg>
            )}
            {index === breadcrumbs.length - 1 ? (
              <span className="text-sm font-medium text-gray-700">
                {crumb.title}
              </span>
            ) : (
              <a
                href={crumb.path}
                className="text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                {crumb.title}
              </a>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

// Menu Guard - conditionally shows menu items based on permissions
export const MenuGuard = ({ routeKey, children, fallback = null }) => {
  const { canNavigateTo, getNavigationRestrictions } = useNavigationGuard();
  
  // Find route in configuration
  const findRoute = (key) => {
    for (const category of Object.values(ROUTE_CONFIG)) {
      if (category[key]) {
        return category[key];
      }
    }
    return null;
  };

  const route = findRoute(routeKey);
  if (!route) {
    return fallback;
  }

  const requirements = {
    requireAuth: route.requireAuth,
    requiredRoles: route.requiredRoles || [],
    requireEmailVerification: route.requireEmailVerification,
    requirePhoneVerification: route.requirePhoneVerification,
    blockAuthenticated: route.blockAuthenticated
  };

  const result = canNavigateTo(route.path, requirements);
  
  if (!result.allowed) {
    return fallback;
  }

  return children;
};

export default useNavigationGuard;