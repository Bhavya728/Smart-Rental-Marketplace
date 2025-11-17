import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Heart,
  ArrowUp
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const footerLinks = {
    company: [
      { name: 'About Us', path: '/about' },
      { name: 'How It Works', path: '/how-it-works' },
      { name: 'Careers', path: '/careers' },
      { name: 'Press', path: '/press' },
      { name: 'Blog', path: '/blog' },
    ],
    support: [
      { name: 'Help Center', path: '/help' },
      { name: 'Safety', path: '/safety' },
      { name: 'Contact Us', path: '/contact' },
      { name: 'Trust & Safety', path: '/trust-safety' },
      { name: 'Terms of Service', path: '/terms' },
    ],
    community: [
      { name: 'Host Your Item', path: '/create-listing' },
      { name: 'Community Guidelines', path: '/guidelines' },
      { name: 'Referral Program', path: '/referral' },
      { name: 'Reviews', path: '/reviews' },
      { name: 'Events', path: '/events' },
    ],
  };

  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='23' cy='7' r='1'/%3E%3Ccircle cx='39' cy='7' r='1'/%3E%3Ccircle cx='55' cy='7' r='1'/%3E%3Ccircle cx='7' cy='23' r='1'/%3E%3Ccircle cx='23' cy='23' r='1'/%3E%3Ccircle cx='39' cy='23' r='1'/%3E%3Ccircle cx='55' cy='23' r='1'/%3E%3Ccircle cx='7' cy='39' r='1'/%3E%3Ccircle cx='23' cy='39' r='1'/%3E%3Ccircle cx='39' cy='39' r='1'/%3E%3Ccircle cx='55' cy='39' r='1'/%3E%3Ccircle cx='7' cy='55' r='1'/%3E%3Ccircle cx='23' cy='55' r='1'/%3E%3Ccircle cx='39' cy='55' r='1'/%3E%3Ccircle cx='55' cy='55' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      {/* Main Footer Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">SR</span>
              </div>
              <span className="text-xl font-bold">Smart Rental</span>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Your trusted marketplace for renting and sharing everything from tools to tech. 
              Building communities through smart sharing.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center space-x-2">
                <Mail size={16} className="text-primary" />
                <span>support@smartrental.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone size={16} className="text-primary" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin size={16} className="text-primary" />
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>

          {/* Links Sections */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-8 lg:col-span-3">
            
            {/* Company Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Company</h3>
              <ul className="space-y-2">
                {footerLinks.company.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Support</h3>
              <ul className="space-y-2">
                {footerLinks.support.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Community Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Community</h3>
              <ul className="space-y-2">
                {footerLinks.community.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="border-t border-gray-700 pt-8 mb-8">
          <div className="max-w-md mx-auto text-center lg:text-left lg:max-w-none lg:flex lg:items-center lg:justify-between">
            <div className="lg:flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">Stay in the loop</h3>
              <p className="text-gray-300 text-sm">
                Get the latest updates on new features and rental opportunities.
              </p>
            </div>
            <div className="mt-4 lg:mt-0 lg:ml-8">
              <div className="flex flex-col sm:flex-row gap-3 max-w-md">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                />
                <button className="px-6 py-2 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:from-primary-dark hover:to-primary transform hover:scale-105 transition-all duration-200 font-medium">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 pt-8 flex flex-col lg:flex-row justify-between items-center">
          
          {/* Copyright */}
          <div className="text-center lg:text-left mb-4 lg:mb-0">
            <p className="text-gray-400 text-sm flex items-center justify-center lg:justify-start">
              © {currentYear} Smart Rental. Made with 
              <Heart size={14} className="mx-1 text-red-500" />
              for sharing communities.
            </p>
            <div className="flex items-center justify-center lg:justify-start space-x-4 mt-2 text-xs text-gray-500">
              <Link to="/privacy" className="hover:text-gray-300 transition-colors duration-200">
                Privacy Policy
              </Link>
              <span>•</span>
              <Link to="/cookies" className="hover:text-gray-300 transition-colors duration-200">
                Cookie Policy
              </Link>
              <span>•</span>
              <Link to="/accessibility" className="hover:text-gray-300 transition-colors duration-200">
                Accessibility
              </Link>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex items-center space-x-4">
            {[
              { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
              { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
              { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
              { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
            ].map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-primary transition-all duration-200 transform hover:scale-110"
                aria-label={label}
              >
                <Icon size={18} />
              </a>
            ))}
            
            {/* Scroll to Top Button */}
            <button
              onClick={scrollToTop}
              className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-primary transition-all duration-200 transform hover:scale-110 ml-4"
              aria-label="Scroll to top"
            >
              <ArrowUp size={18} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;