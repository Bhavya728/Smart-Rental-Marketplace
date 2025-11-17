import { Routes, Route, useLocation, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from './contexts/AuthContext'
import LoadingSpinner from './components/ui/LoadingSpinner'
import { ToastProvider } from './components/ui/Toast'
import PageTransition from './components/ui/PageTransition'
import './styles/animations.css'

// Import Layout Components
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'

// Import Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import Profile from './pages/Profile'
import EditProfile from './pages/EditProfile'

// Import Listing Pages
import ListingsPage from './pages/ListingsPage'
import CreateListing from './pages/CreateListing'
import EditListing from './pages/EditListing'
import MyListings from './pages/MyListings'
import ListingDetail from './pages/ListingDetail'
import SearchPage from './pages/SearchPage'
import CategoryPage from './pages/CategoryPage'

// Import Static Pages
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import Cookies from './pages/Cookies'
import Accessibility from './pages/Accessibility'
import About from './pages/About'
import HowItWorks from './pages/HowItWorks'

// Import Communication Pages
import Messages from './pages/Messages'
import Reviews from './pages/Reviews'

// Import Booking Pages
import MyBookings from './pages/MyBookings'
import BookingDetail from './pages/BookingDetail'
import BookingCheckout from './pages/BookingCheckout'
import BookingConfirmation from './pages/BookingConfirmation'

// Import Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/Users'
import AdminListings from './pages/admin/Listings'
import AdminAnalytics from './pages/admin/Analytics'

// Import Admin Components
import AdminRoute from './components/auth/AdminRoute'

// Placeholder page component for missing routes
const PlaceholderPage = ({ title, description }) => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-6xl mb-6">🚧</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
          <p className="text-lg text-gray-600 mb-8">{description}</p>
          <div className="space-x-4">
            <Button onClick={() => navigate(-1)} variant="secondary">
              Go Back
            </Button>
            <Button onClick={() => navigate('/')} variant="primary">
              Home
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Import Auth Components (keep existing ones)
import ProtectedRoute from './components/auth/ProtectedRoute'
import EmailVerificationForm from './components/auth/EmailVerificationForm'
import ResetPasswordForm from './components/auth/ResetPasswordForm'

// Import Route Components
import PrivateRoute from './routes/PrivateRoute'
import { AuthRoute, MixedRoute } from './routes/PublicRoute'

// Import existing components
import Button from './components/ui/Button'
import Card from './components/ui/Card'
import Badge from './components/ui/Badge'

// Dashboard Component (keep existing functionality)
const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name?.firstName || user?.firstName || user?.email}!
          </h1>
          <p className="text-gray-600">
            Manage your account and explore rental opportunities.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Info</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Role:</span>
                <Badge variant={user?.role === 'admin' ? 'success' : 'primary'}>
                  {user?.role}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <Badge variant={user?.isEmailVerified ? 'success' : 'warning'}>
                  {user?.isEmailVerified ? 'Verified' : 'Pending'}
                </Badge>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate('/profile')}
              >
                📋 View Profile
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate('/profile/edit')}
              >
                🔧 Account Settings
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate('/listings')}
              >
                🏠 Browse Listings
              </Button>
              {user?.role === 'owner' || user?.role === 'both' ? (
                <>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => navigate('/my-listings')}
                  >
                    📦 My Listings
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="primary"
                    onClick={() => navigate('/create-listing')}
                  >
                    ➕ Create Listing
                  </Button>
                </>
              ) : null}
              {user?.role === 'renter' || user?.role === 'both' ? (
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => navigate('/my-bookings')}
                >
                  📅 My Bookings
                </Button>
              ) : null}
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
            <div className="text-center py-8 text-gray-500">
              <div className="text-3xl mb-2">📊</div>
              <p>Statistics coming soon...</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Auth Page Wrapper
const AuthPage = ({ children, title, subtitle }) => (
  <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md w-full"
    >
      <div className="text-center mb-8">
        <Link to="/" className="inline-flex items-center space-x-2 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">SR</span>
          </div>
          <span className="text-2xl font-bold text-gray-800">Smart Rental</span>
        </Link>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600">{subtitle}</p>
      </div>
      <Card>{children}</Card>
    </motion.div>
  </div>
)

function App() {
  const { isInitializing, isLoading, isAuthenticated, user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // Show loading while auth is initializing
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Auth pages that don't need navbar/footer
  const authPages = ['/login', '/register', '/forgot-password', '/reset-password']
  const isAuthPage = authPages.includes(location.pathname)

  return (
    <ToastProvider position="top-right">
      <div className="App">
        {/* Navigation - use new Navbar for all pages except auth pages */}
        {!isAuthPage && <Navbar />}
      
        {/* Removed PageTransition and AnimatePresence to prevent remount blinking */}
        <Routes location={location}>
          {/* Public Routes */}
          <Route path="/" element={
            <MixedRoute>
              <>
                <Home />
                <Footer />
              </>
            </MixedRoute>
          } />
          
          {/* Auth Routes - use new page components */}
          <Route path="/login" element={
            <AuthRoute>
              <Login />
            </AuthRoute>
          } />
          
          <Route path="/register" element={
            <AuthRoute>
              <Register />
            </AuthRoute>
          } />
          
          <Route path="/forgot-password" element={
            <AuthRoute>
              <ForgotPassword />
            </AuthRoute>
          } />
          
          <Route path="/reset-password" element={
            <AuthPage title="New Password" subtitle="Enter your new password">
              <ResetPasswordForm />
            </AuthPage>
          } />
          
          <Route path="/verify-email" element={
            <AuthPage title="Verify Email" subtitle="Enter verification code">
              <EmailVerificationForm />
            </AuthPage>
          } />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <>
                <Dashboard />
                <Footer />
              </>
            </PrivateRoute>
          } />

          {/* Profile Routes */}
          <Route path="/profile" element={
            <PrivateRoute>
              <>
                <Profile />
                <Footer />
              </>
            </PrivateRoute>
          } />
          
          <Route path="/profile/edit" element={
            <PrivateRoute>
              <>
                <EditProfile />
                <Footer />
              </>
            </PrivateRoute>
          } />

          {/* Listing Routes */}
          <Route path="/listings" element={
            <MixedRoute>
              <>
                <ListingsPage />
                <Footer />
              </>
            </MixedRoute>
          } />
          
          <Route path="/search" element={
            <MixedRoute>
              <>
                <SearchPage />
                <Footer />
              </>
            </MixedRoute>
          } />
          
          <Route path="/categories" element={
            <MixedRoute>
              <>
                <CategoryPage />
                <Footer />
              </>
            </MixedRoute>
          } />
          
          <Route path="/category/:categoryName" element={
            <MixedRoute>
              <>
                <CategoryPage />
                <Footer />
              </>
            </MixedRoute>
          } />
          
          <Route path="/listings/:listingId" element={
            <MixedRoute>
              <>
                <ListingDetail />
                <Footer />
              </>
            </MixedRoute>
          } />
          
          <Route path="/create-listing" element={
            <PrivateRoute>
              <>
                <CreateListing />
                <Footer />
              </>
            </PrivateRoute>
          } />
          
          <Route path="/listings/:id/edit" element={
            <PrivateRoute>
              <>
                <EditListing />
                <Footer />
              </>
            </PrivateRoute>
          } />
          
          <Route path="/my-listings" element={
            <PrivateRoute>
              <>
                <MyListings />
                <Footer />
              </>
            </PrivateRoute>
          } />

          {/* Communication Routes */}
          <Route path="/messages" element={
            <PrivateRoute>
              <>
                <Messages />
                <Footer />
              </>
            </PrivateRoute>
          } />
          
          <Route path="/properties/:propertyId/reviews" element={
            <MixedRoute>
              <>
                <Reviews />
                <Footer />
              </>
            </MixedRoute>
          } />
          
          <Route path="/listings/:listingId/reviews" element={
            <MixedRoute>
              <>
                <Reviews />
                <Footer />
              </>
            </MixedRoute>
          } />

          {/* Booking Routes */}
          <Route path="/my-bookings" element={
            <PrivateRoute>
              <>
                <MyBookings />
                <Footer />
              </>
            </PrivateRoute>
          } />
          
          <Route path="/bookings/:bookingId" element={
            <PrivateRoute>
              <>
                <BookingDetail />
                <Footer />
              </>
            </PrivateRoute>
          } />
          
          <Route path="/listings/:listingId/book" element={
            <PrivateRoute>
              <>
                <BookingCheckout />
                <Footer />
              </>
            </PrivateRoute>
          } />
          
          <Route path="/booking-confirmation/:bookingId" element={
            <PrivateRoute>
              <>
                <BookingConfirmation />
                <Footer />
              </>
            </PrivateRoute>
          } />

          {/* Static Pages */}
          <Route path="/privacy" element={
            <MixedRoute>
              <>
                <Privacy />
                <Footer />
              </>
            </MixedRoute>
          } />
          
          <Route path="/terms" element={
            <MixedRoute>
              <>
                <Terms />
                <Footer />
              </>
            </MixedRoute>
          } />
          
          <Route path="/cookies" element={
            <MixedRoute>
              <>
                <Cookies />
                <Footer />
              </>
            </MixedRoute>
          } />
          
          <Route path="/accessibility" element={
            <MixedRoute>
              <>
                <Accessibility />
                <Footer />
              </>
            </MixedRoute>
          } />

          {/* Additional Static Pages */}
          <Route path="/how-it-works" element={
            <MixedRoute>
              <>
                <HowItWorks />
                <Footer />
              </>
            </MixedRoute>
          } />
          
          <Route path="/about" element={
            <MixedRoute>
              <>
                <About />
                <Footer />
              </>
            </MixedRoute>
          } />

          <Route path="/settings" element={
            <PrivateRoute>
              <>
                <PlaceholderPage 
                  title="Settings" 
                  description="Manage your account settings and preferences." 
                />
                <Footer />
              </>
            </PrivateRoute>
          } />

          <Route path="/notifications" element={
            <PrivateRoute>
              <>
                <PlaceholderPage 
                  title="Notifications" 
                  description="View and manage your notifications." 
                />
                <Footer />
              </>
            </PrivateRoute>
          } />

          <Route path="/help" element={
            <MixedRoute>
              <>
                <PlaceholderPage 
                  title="Help Center" 
                  description="Find answers to frequently asked questions and get support." 
                />
                <Footer />
              </>
            </MixedRoute>
          } />

          <Route path="/contact" element={
            <MixedRoute>
              <>
                <PlaceholderPage 
                  title="Contact Us" 
                  description="Get in touch with our support team." 
                />
                <Footer />
              </>
            </MixedRoute>
          } />

          {/* Additional Routes */}
          <Route path="/favorites" element={
            <PrivateRoute>
              <>
                <PlaceholderPage 
                  title="My Favorites" 
                  description="View and manage your favorite listings." 
                />
                <Footer />
              </>
            </PrivateRoute>
          } />

          <Route path="/account" element={
            <PrivateRoute>
              <>
                <PlaceholderPage 
                  title="Account Management" 
                  description="Manage your account settings and preferences." 
                />
                <Footer />
              </>
            </PrivateRoute>
          } />

          <Route path="/payment-methods" element={
            <PrivateRoute>
              <>
                <PlaceholderPage 
                  title="Payment Methods" 
                  description="Manage your payment methods and billing information." 
                />
                <Footer />
              </>
            </PrivateRoute>
          } />

          <Route path="/security" element={
            <PrivateRoute>
              <>
                <PlaceholderPage 
                  title="Security Settings" 
                  description="Manage your security settings and two-factor authentication." 
                />
                <Footer />
              </>
            </PrivateRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          
          <Route path="/admin/dashboard" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          
          <Route path="/admin/users" element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          } />
          
          <Route path="/admin/listings" element={
            <AdminRoute>
              <AdminListings />
            </AdminRoute>
          } />
          
          <Route path="/admin/analytics" element={
            <AdminRoute>
              <AdminAnalytics />
            </AdminRoute>
          } />

          {/* 404 Route */}
          <Route path="*" element={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">😕</div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">404 - Page Not Found</h1>
                <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
                <Button onClick={() => navigate('/')}>
                  Go Home
                </Button>
              </div>
            </div>
          } />
            </Routes>
      </div>
    </ToastProvider>
  )
}

export default App