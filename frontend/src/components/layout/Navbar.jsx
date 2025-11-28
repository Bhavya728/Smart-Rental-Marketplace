import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, Settings, Bell, Home, Search, MessageCircle, Star, Plus, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import NotificationCenter from '../notifications/NotificationCenter';
import RenterNotificationCenter from '../notifications/RenterNotificationCenter';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
    setShowProfileMenu(false);
  }, [location]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Browse', path: '/listings' },
    { name: 'Search', path: '/search', icon: Search },
    { name: 'Categories', path: '/categories' },
    { name: 'How it Works', path: '/how-it-works' },
    { name: 'About', path: '/about' },
  ];

  // Admin-specific nav items
  const adminNavItems = user?.role === 'admin' ? [
    { name: 'Admin', path: '/admin', icon: Settings },
  ] : [];

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex items-center space-x-2 text-xl font-bold text-gray-900 hover:text-primary transition-colors duration-200"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SR</span>
              </div>
              <span className="hidden sm:inline">Smart Rental</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActivePath(item.path)
                      ? 'text-primary bg-primary/10 shadow-sm'
                      : 'text-gray-700 hover:text-primary hover:bg-gray-100/80'
                  }`}
                >
                  {Icon && <Icon size={16} />}
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                {/* Show appropriate notification center based on user role */}
                {user.role === 'owner' && <NotificationCenter />}
                {user.role === 'renter' && <RenterNotificationCenter />}
                {user.role === 'both' && (
                  <>
                    <NotificationCenter />
                    <RenterNotificationCenter />
                  </>
                )}
                <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100/80 transition-colors duration-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {user.name?.firstName?.[0] || user.email?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {user.name?.firstName || 'User'}
                  </span>
                </button>

                {/* Profile Dropdown */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-md rounded-lg shadow-lg border border-gray-200/50 py-1">
                    <Link
                      to="/dashboard"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100/80 transition-colors duration-200"
                    >
                      <Home size={16} />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      to="/profile"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100/80 transition-colors duration-200"
                    >
                      <User size={16} />
                      <span>Profile</span>
                    </Link>
                    <Link
                      to="/messages"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100/80 transition-colors duration-200"
                    >
                      <MessageCircle size={16} />
                      <span>Messages</span>
                    </Link>
                    <Link
                      to="/my-bookings"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100/80 transition-colors duration-200"
                    >
                      <Calendar size={16} />
                      <span>My Bookings</span>
                    </Link>
                    {(user?.role === 'owner' || user?.role === 'both') && (
                      <>
                        <Link
                          to="/my-listings"
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100/80 transition-colors duration-200"
                        >
                          <Star size={16} />
                          <span>My Listings</span>
                        </Link>
                        <Link
                          to="/create-listing"
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100/80 transition-colors duration-200"
                        >
                          <Plus size={16} />
                          <span>Create Listing</span>
                        </Link>
                      </>
                    )}
                    {user?.role === 'admin' && (
                      <>
                        <hr className="my-1 border-gray-200" />
                        <Link
                          to="/admin"
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-purple-600 hover:bg-purple-50/80 transition-colors duration-200"
                        >
                          <Settings size={16} />
                          <span>Admin Panel</span>
                        </Link>
                      </>
                    )}
                    <hr className="my-1 border-gray-200" />
                    <Link
                      to="/settings"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100/80 transition-colors duration-200"
                    >
                      <Settings size={16} />
                      <span>Settings</span>
                    </Link>
                    <hr className="my-1 border-gray-200" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50/80 transition-colors duration-200"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-gray-700 hover:text-primary hover:bg-gray-100/80 transition-colors duration-200"
              aria-label="Toggle mobile menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${
          isOpen 
            ? 'max-h-96 opacity-100 pb-4' 
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white/90 backdrop-blur-md rounded-lg shadow-lg border border-gray-200/50 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                    isActivePath(item.path)
                      ? 'text-primary bg-primary/10'
                      : 'text-gray-700 hover:text-primary hover:bg-gray-100/80'
                  }`}
                >
                  {Icon && <Icon size={18} />}
                  <span>{item.name}</span>
                </Link>
              );
            })}

            {/* Mobile Auth Section */}
            <hr className="my-3 border-gray-200" />
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 px-3 py-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {user.name?.firstName?.[0] || user.email?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <span className="font-medium text-gray-900">
                    {user.name?.firstName || 'User'}
                  </span>
                </div>
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-100/80 rounded-md transition-colors duration-200"
                >
                  <Home size={18} />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-100/80 rounded-md transition-colors duration-200"
                >
                  <User size={18} />
                  <span>Profile</span>
                </Link>
                <Link
                  to="/messages"
                  className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-100/80 rounded-md transition-colors duration-200"
                >
                  <MessageCircle size={18} />
                  <span>Messages</span>
                </Link>
                <Link
                  to="/my-bookings"
                  className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-100/80 rounded-md transition-colors duration-200"
                >
                  <Calendar size={18} />
                  <span>My Bookings</span>
                </Link>
                {(user?.role === 'owner' || user?.role === 'both') && (
                  <>
                    <Link
                      to="/my-listings"
                      className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-100/80 rounded-md transition-colors duration-200"
                    >
                      <Star size={18} />
                      <span>My Listings</span>
                    </Link>
                    <Link
                      to="/create-listing"
                      className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-100/80 rounded-md transition-colors duration-200"
                    >
                      <Plus size={18} />
                      <span>Create Listing</span>
                    </Link>
                  </>
                )}
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-2 px-3 py-2 text-purple-600 hover:bg-purple-50/80 rounded-md transition-colors duration-200"
                  >
                    <Settings size={18} />
                    <span>Admin Panel</span>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-red-600 hover:bg-red-50/80 rounded-md transition-colors duration-200"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2 px-3">
                <Link to="/login" className="w-full">
                  <Button variant="ghost" size="sm" className="w-full justify-center">
                    Login
                  </Button>
                </Link>
                <Link to="/register" className="w-full">
                  <Button size="sm" className="w-full justify-center">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;