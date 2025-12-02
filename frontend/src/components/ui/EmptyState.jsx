import React from 'react';
import { motion } from 'framer-motion';
import { Package, Search, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';
import Button from './Button';

const EmptyState = ({ 
  icon: CustomIcon,
  title = "No results found",
  description = "Try adjusting your search or filters to find what you're looking for.",
  action,
  actionLabel = "Clear filters",
  className = "",
  size = "md"
}) => {
  const sizes = {
    sm: {
      container: "py-8 sm:py-12 px-4",
      icon: "w-12 h-12 sm:w-16 sm:h-16 mb-4 sm:mb-6",
      title: "text-lg sm:text-xl font-bold",
      description: "text-sm sm:text-base font-medium"
    },
    md: {
      container: "py-12 sm:py-16 px-4",
      icon: "w-16 h-16 sm:w-20 sm:h-20 mb-6 sm:mb-8",
      title: "text-xl sm:text-2xl font-bold",
      description: "text-base sm:text-lg font-medium"
    },
    lg: {
      container: "py-16 sm:py-20 px-4",
      icon: "w-20 h-20 sm:w-24 sm:h-24 mb-8 sm:mb-10",
      title: "text-2xl sm:text-3xl font-bold",
      description: "text-lg sm:text-xl font-medium"
    }
  };

  const currentSize = sizes[size];
  const Icon = CustomIcon || Package;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "flex flex-col items-center justify-center text-center",
        currentSize.container,
        className
      )}
    >
      {/* Enhanced Icon with Mobile Responsive Sizing */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className={cn(
          "flex items-center justify-center text-gray-400 mx-auto mb-6 sm:mb-8",
          currentSize.icon
        )}
      >
        <Icon className="w-full h-full" />
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className={cn(
          "font-semibold text-gray-900 mb-2 sm:mb-3 text-center",
          currentSize.title
        )}
      >
        {title}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        className={cn(
          "text-gray-600 max-w-sm mx-auto mb-6 sm:mb-8 text-center leading-relaxed",
          currentSize.description
        )}
      >
        {description}
      </motion.p>

      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="w-full max-w-xs mx-auto"
        >
          <Button
            onClick={typeof action === 'function' ? action : (typeof action === 'object' && action?.onClick ? action.onClick : undefined)}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 min-h-[44px]"
          >
            {actionLabel || (typeof action === 'object' && action?.text ? action.text : 'Continue')}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

// Predefined empty states for common scenarios
export const NoSearchResults = ({ onClearFilters }) => (
  <EmptyState
    icon={Search}
    title="No listings found"
    description="We couldn't find any listings matching your search criteria. Try adjusting your filters or search terms."
    action={onClearFilters}
    actionLabel="Clear all filters"
  />
);

export const NoFavorites = () => (
  <EmptyState
    icon={Package}
    title="No favorites yet"
    description="Items you favorite will appear here. Start exploring to find your perfect rental!"
    actionLabel="Browse listings"
    action={() => window.location.href = '/listings'}
  />
);

export const NoListings = () => (
  <EmptyState
    icon={Package}
    title="No listings yet"
    description="You haven't created any listings yet. Share your items with the community!"
    actionLabel="Create first listing"
    action={() => window.location.href = '/create-listing'}
  />
);

export const SearchError = ({ onRetry }) => (
  <EmptyState
    icon={AlertCircle}
    title="Something went wrong"
    description="We're having trouble loading the search results. Please try again."
    action={onRetry}
    actionLabel="Try again"
  />
);

export default React.memo(EmptyState);