// Export all authentication components
export { default as ProtectedRoute } from './ProtectedRoute';
export { default as AdminRoute } from './AdminRoute';
export { 
  RoleBasedRoute,
  AdminRoute as LegacyAdminRoute,
  OwnerRoute,
  RenterRoute,
  GuestRoute,
  EmailVerifiedRoute,
  PhoneVerifiedRoute,
  useRouteGuard,
  withRouteProtection,
  ConditionalRender
} from './ProtectedRoute';

export { default as AuthGuard } from './AuthGuard';
export {
  EmailVerificationGuard,
  PhoneVerificationGuard,
  ProfileCompletionGuard,
  SessionExpiryGuard,
  MaintenanceGuard,
  SecurityGuard
} from './AuthGuard';

export { default as useNavigationGuard } from './NavigationGuard';
export {
  NavigationGuard,
  BreadcrumbGuard,
  MenuGuard,
  ROUTE_CONFIG
} from './NavigationGuard';

// Export authentication forms
export { default as LoginForm } from './LoginForm';
export { default as RegisterForm } from './RegisterForm';
export { default as ForgotPasswordForm } from './ForgotPasswordForm';
export { default as ResetPasswordForm } from './ResetPasswordForm';
export { default as EmailVerificationForm } from './EmailVerificationForm';

// Export authentication context
export { default as AuthContext } from '../contexts/AuthContext';
export { AuthProvider, useAuth, withAuth, withRole } from '../contexts/AuthContext';