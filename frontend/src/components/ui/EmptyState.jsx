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
      container: "py-12",
      icon: "w-16 h-16 mb-6",
      title: "text-xl font-bold",
      description: "text-base font-medium"
    },
    md: {
      container: "py-16",
      icon: "w-20 h-20 mb-8",
      title: "text-2xl font-bold",
      description: "text-lg font-medium"
    },
    lg: {
      container: "py-20",
      icon: "w-24 h-24 mb-10",
      title: "text-3xl font-bold",
      description: "text-xl font-medium"
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
      <div className="relative mb-8">
        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center shadow-xl shadow-gray-200/40 mb-6">
          <Icon className="w-12 h-12 text-gray-600" />
        </div>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className={cn(
            "flex items-center justify-center text-gray-400 mx-auto",
            currentSize.icon
          )}
        >
          <Icon className="w-full h-full" />
        </motion.div>
      </div>

      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className={cn(
          "font-semibold text-gray-900 mb-2",
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
          "text-gray-600 max-w-sm mx-auto mb-6",
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
        >
          <Button
            onClick={typeof action === 'function' ? action : (typeof action === 'object' && action?.onClick ? action.onClick : undefined)}
            variant="outline"
            size={size}
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