import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../ui/Button'
import Badge from '../ui/Badge'

export const Navigation = () => {
  const { user, logout, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const navItems = [
    { path: '/', label: 'Home', public: true },
    { path: '/listings', label: 'Browse', public: true },
    { path: '/dashboard', label: 'Dashboard', protected: true },
    { path: '/my-listings', label: 'My Listings', protected: true, roles: ['owner', 'both'] },
    { path: '/my-bookings', label: 'My Bookings', protected: true, roles: ['renter', 'both'] },
  ]

  const filteredNavItems = navItems.filter(item => {
    if (item.public) return true
    if (item.protected && !user) return false
    if (item.roles && !item.roles.includes(user?.role)) return false
    return true
  })

  return (
    <nav className="bg-white/90 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-50 shadow-lg shadow-gray-200/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <motion.div
              whileHover={{ scale: 1.08, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-3"
            >
              <div className="w-11 h-11 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <span className="text-white font-black text-lg">SR</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-gray-900 tracking-tight leading-none">
                  Smart Rental
                </span>
                <span className="text-xs font-medium text-gray-600 tracking-wide">
                  Share. Rent. Connect.
                </span>
              </div>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {filteredNavItems.map(item => (
              <motion.div key={item.path} whileHover={{ y: -2 }} whileTap={{ y: 0 }}>
                <Link
                  to={item.path}
                  className={`px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 relative overflow-hidden ${
                    location.pathname === item.path
                      ? 'text-blue-700 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg shadow-blue-200/40 border border-blue-200/60'
                      : 'text-gray-700 hover:text-blue-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/50 hover:shadow-md hover:shadow-gray-200/40'
                  }`}
                >
                  {item.label}
                  {location.pathname === item.path && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600"
                      initial={false}
                    />
                  )}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <div className="w-10 h-10 border-3 border-blue-500/30 border-t-blue-600 rounded-full animate-spin" />
            ) : user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3 px-4 py-2 rounded-2xl bg-gradient-to-r from-gray-50 to-blue-50/50 border border-gray-200/60 shadow-sm">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <span className="text-white text-sm font-bold">
                      {user.firstName?.charAt(0) || user.email?.charAt(0)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-800">
                      {user.firstName || user.email}
                    </span>
                    <Badge variant={user.role === 'admin' ? 'success-solid' : 'primary'} size="xs">
                      {user.role}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="secondary-ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="font-semibold"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Button
                  variant="secondary-ghost"
                  size="md"
                  onClick={() => navigate('/login')}
                  className="font-semibold"
                >
                  Login
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate('/register')}
                  className="font-semibold shadow-lg shadow-blue-500/30"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                variant="secondary-ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2"
              >
                <motion.svg 
                  className="w-6 h-6" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  animate={{ rotate: isMenuOpen ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </motion.svg>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="md:hidden border-t border-gray-200/60 mt-4 pt-4 pb-6 bg-gradient-to-b from-white/95 to-gray-50/95 backdrop-blur-sm rounded-b-2xl shadow-lg"
            >
              <div className="flex flex-col space-y-3 px-2">
                {filteredNavItems.map((item, index) => (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`block px-5 py-3 rounded-xl text-base font-semibold transition-all duration-300 ${
                        location.pathname === item.path
                          ? 'text-blue-700 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg shadow-blue-200/40 border border-blue-200/60'
                          : 'text-gray-700 hover:text-blue-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/50 hover:shadow-md'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
                
                {!user && (
                  <div className="flex flex-col space-y-2 pt-2 border-t border-gray-200">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigate('/login')
                        setIsMenuOpen(false)
                      }}
                      className="justify-start"
                    >
                      Login
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        navigate('/register')
                        setIsMenuOpen(false)
                      }}
                      className="justify-start"
                    >
                      Sign Up
                    </Button>
                  </div>
                )}
                
                {user && (
                  <div className="flex flex-col space-y-2 pt-2 border-t border-gray-200">
                    <div className="flex items-center space-x-2 px-3 py-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user.firstName?.charAt(0) || user.email?.charAt(0)}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-700">
                          {user.firstName || user.email}
                        </span>
                        <Badge variant={user.role === 'admin' ? 'success' : 'primary'} size="sm">
                          {user.role}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      className="justify-start"
                    >
                      Logout
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}