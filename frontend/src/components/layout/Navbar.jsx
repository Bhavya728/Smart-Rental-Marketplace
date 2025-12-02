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

  const adminNavItems = user?.role === 'admin' ? [
    { name: 'Admin Panel', path: '/admin', icon: Settings }
  ] : [];

  const isActivePath = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50' 
        : 'bg-white/80 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link 
              to="/" 
              className="flex items-center space-x-3 group"
              onClick={() => setIsOpen(false)}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <span className="text-white font-black text-lg">SR</span>
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-xl font-black text-gray-900 tracking-tight leading-none group-hover:text-blue-700 transition-colors duration-300">
                  Smart Rental
                </span>
                <span className="text-xs text-gray-600 font-medium">Marketplace</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 ${
                    isActivePath(item.path)
                      ? 'text-primary bg-primary/10 shadow-sm border border-primary/20'
                      : 'text-gray-700 hover:text-primary hover:bg-gray-100/80'
                  }`}
                >
                  {Icon && <Icon size={18} />}
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                {/* Notifications */}
                {user.role === 'renter' ? (
                  <RenterNotificationCenter />
                ) : (
                  <NotificationCenter />
                )}

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100/80 transition-all duration-200 group"
                  >
                    <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center group-hover:shadow-lg transition-all duration-200">
                      <span className="text-white font-semibold text-sm">
                        {user.name?.firstName?.[0] || user.email?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div className="hidden lg:flex flex-col items-start">
                      <span className="text-sm font-semibold text-gray-900">
                        {user.name?.firstName || 'User'}
                      </span>
                      <span className="text-xs text-gray-600 capitalize">
                        {user.role || 'Member'}
                      </span>
                    </div>
                  </button>

                  {/* Profile Dropdown */}
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              {user.name?.firstName?.[0] || user.email?.[0]?.toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {user.name?.firstName} {user.name?.lastName}
                            </p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                              {user.role || 'Member'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="py-2">
                        <Link
                          to="/dashboard"
                          className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50/80 transition-colors duration-200"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <Home size={18} className="text-gray-500" />
                          <span className="font-medium">Dashboard</span>
                        </Link>
                        <Link
                          to="/profile"
                          className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50/80 transition-colors duration-200"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <User size={18} className="text-gray-500" />
                          <span className="font-medium">Profile</span>
                        </Link>
                        <Link
                          to="/messages"
                          className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50/80 transition-colors duration-200"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <MessageCircle size={18} className="text-gray-500" />
                          <span className="font-medium">Messages</span>
                        </Link>
                        {user.role !== 'renter' && (
                          <>
                            <Link
                              to="/my-listings"
                              className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50/80 transition-colors duration-200"
                              onClick={() => setShowProfileMenu(false)}
                            >
                              <Star size={18} className="text-gray-500" />
                              <span className="font-medium">My Listings</span>
                            </Link>
                            <Link
                              to="/create-listing"
                              className="flex items-center space-x-3 px-4 py-3 text-primary hover:bg-primary/10 transition-colors duration-200"
                              onClick={() => setShowProfileMenu(false)}
                            >
                              <Plus size={18} />
                              <span className="font-medium">Create Listing</span>
                            </Link>
                          </>
                        )}
                        {user?.role === 'admin' && (
                          <Link
                            to="/admin"
                            className="flex items-center space-x-3 px-4 py-3 text-purple-600 hover:bg-purple-50/80 transition-colors duration-200"
                            onClick={() => setShowProfileMenu(false)}
                          >
                            <Settings size={18} />
                            <span className="font-medium">Admin Panel</span>
                          </Link>
                        )}
                      </div>
                      
                      <div className="border-t border-gray-100 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-3 w-full px-4 py-3 text-red-600 hover:bg-red-50/80 transition-colors duration-200"
                        >
                          <LogOut size={18} />
                          <span className="font-medium">Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="font-semibold">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="font-semibold shadow-lg hover:shadow-xl">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-gray-700 hover:text-primary hover:bg-gray-100/80 transition-colors duration-200"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${
          isOpen 
            ? 'max-h-screen opacity-100 pb-6' 
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="px-2 pt-4 pb-4 space-y-2 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-200/50 mt-3 mx-2">
            {navItems.concat(adminNavItems).map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                    isActivePath(item.path)
                      ? 'text-primary bg-primary/10 shadow-sm border border-primary/20'
                      : 'text-gray-700 hover:text-primary hover:bg-gray-100/80'
                  }`}
                >
                  {Icon && <Icon size={20} className="flex-shrink-0" />}
                  <span>{item.name}</span>
                </Link>
              );
            })}

            {/* Mobile Auth Section */}
            <div className="pt-4 mt-4 border-t border-gray-200/60">
              {user ? (
                <div className="space-y-2">
                  {/* User Profile */}
                  <div className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-gray-50/80">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-medium text-sm">
                        {user.name?.firstName?.[0] || user.email?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.name?.firstName} {user.name?.lastName}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  {/* User Actions */}
                  <Link
                    to="/dashboard"
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-primary hover:bg-gray-100/80 rounded-lg transition-colors duration-200"
                  >
                    <Home size={18} />
                    <span className="text-base font-medium">Dashboard</span>
                  </Link>
                  <Link
                    to="/profile"
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-primary hover:bg-gray-100/80 rounded-lg transition-colors duration-200"
                  >
                    <User size={18} />
                    <span className="text-base font-medium">Profile</span>
                  </Link>
                  <Link
                    to="/messages"
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-primary hover:bg-gray-100/80 rounded-lg transition-colors duration-200"
                  >
                    <MessageCircle size={18} />
                    <span className="text-base font-medium">Messages</span>
                  </Link>
                  <Link
                    to="/my-bookings"
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-primary hover:bg-gray-100/80 rounded-lg transition-colors duration-200"
                  >
                    <Calendar size={18} />
                    <span className="text-base font-medium">My Bookings</span>
                  </Link>
                  {user.role !== 'renter' && (
                    <>
                      <Link
                        to="/my-listings"
                        className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-primary hover:bg-gray-100/80 rounded-lg transition-colors duration-200"
                      >
                        <Star size={18} />
                        <span className="text-base font-medium">My Listings</span>
                      </Link>
                      <Link
                        to="/create-listing"
                        className="flex items-center space-x-3 px-4 py-3 text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors duration-200"
                      >
                        <Plus size={18} />
                        <span className="text-base font-medium">Create Listing</span>
                      </Link>
                    </>
                  )}

                  <div className="pt-2 mt-2 border-t border-gray-200/60">
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 w-full px-4 py-3 text-red-600 hover:bg-red-50/80 rounded-lg transition-colors duration-200"
                    >
                      <LogOut size={18} />
                      <span className="text-base font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link to="/login" className="block">
                    <Button variant="ghost" size="lg" className="w-full justify-center text-base">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register" className="block">
                    <Button size="lg" className="w-full justify-center text-base">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;