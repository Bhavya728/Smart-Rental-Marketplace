/**
 * Breadcrumb Component
 * Navigation breadcrumb with animations and customizable separators
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FadeTransition } from '../../utils/transitions.jsx';
import { cn } from '../../utils/cn';

const Breadcrumb = ({
  items = [],
  separator = '/',
  showHome = true,
  maxItems = 5,
  className = '',
  animated = true,
  ...props
}) => {
  const location = useLocation();
  
  // Auto-generate breadcrumbs from current path if no items provided
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [];
    
    if (showHome) {
      breadcrumbs.push({
        label: 'Home',
        href: '/',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        )
      });
    }
    
    pathSegments.forEach((segment, index) => {
      const href = '/' + pathSegments.slice(0, index + 1).join('/');
      const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      
      breadcrumbs.push({
        label,
        href,
        isCurrentPage: index === pathSegments.length - 1
      });
    });
    
    return breadcrumbs;
  };

  const breadcrumbItems = items.length > 0 ? items : generateBreadcrumbs();
  
  // Handle max items with ellipsis
  const getDisplayItems = () => {
    if (breadcrumbItems.length <= maxItems) {
      return breadcrumbItems;
    }
    
    const firstItem = breadcrumbItems[0];
    const lastItems = breadcrumbItems.slice(-2);
    const ellipsisItem = { label: '...', isEllipsis: true };
    
    return [firstItem, ellipsisItem, ...lastItems];
  };

  const displayItems = getDisplayItems();

  const separatorIcon = () => {
    if (typeof separator === 'string') {
      return <span className="mx-2 text-gray-400">{separator}</span>;
    }
    
    return (
      <span className="mx-2 text-gray-400">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </span>
    );
  };

  const BreadcrumbItem = ({ item, index, isLast }) => {
    const itemClasses = cn(
      'flex items-center space-x-1 text-sm transition-colors duration-200',
      {
        'text-gray-500 hover:text-gray-700': !item.isCurrentPage && !item.isEllipsis,
        'text-gray-900 font-medium': item.isCurrentPage,
        'text-gray-400 cursor-default': item.isEllipsis
      }
    );

    const content = (
      <span className={itemClasses}>
        {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
        <span className={item.truncate ? 'truncate max-w-24' : ''}>
          {item.label}
        </span>
      </span>
    );

    if (item.isEllipsis || item.isCurrentPage || !item.href) {
      return (
        <li className="flex items-center">
          {content}
          {!isLast && separatorIcon()}
        </li>
      );
    }

    return (
      <li className="flex items-center">
        <Link
          to={item.href}
          className="flex items-center hover:underline"
          aria-current={item.isCurrentPage ? 'page' : undefined}
        >
          {content}
        </Link>
        {!isLast && separatorIcon()}
      </li>
    );
  };

  return (
    <nav
      className={cn('flex items-center', className)}
      aria-label="Breadcrumb"
      {...props}
    >
      <ol className="flex items-center space-x-0">
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          
          if (animated) {
            return (
              <FadeTransition
                key={`${item.href}-${index}`}
                show={true}
                duration={200}
              >
                <BreadcrumbItem
                  item={item}
                  index={index}
                  isLast={isLast}
                />
              </FadeTransition>
            );
          }
          
          return (
            <BreadcrumbItem
              key={`${item.href}-${index}`}
              item={item}
              index={index}
              isLast={isLast}
            />
          );
        })}
      </ol>
    </nav>
  );
};

// Specialized breadcrumb variants
export const AdminBreadcrumb = ({ items = [], ...props }) => {
  const adminItems = [
    {
      label: 'Admin',
      href: '/admin',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        </svg>
      )
    },
    ...items
  ];

  return <Breadcrumb items={adminItems} showHome={true} {...props} />;
};

export const ProfileBreadcrumb = ({ items = [], ...props }) => {
  const profileItems = [
    {
      label: 'Profile',
      href: '/profile',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    ...items
  ];

  return <Breadcrumb items={profileItems} showHome={true} {...props} />;
};

// Breadcrumb with dropdown for collapsed items
export const DropdownBreadcrumb = ({ items = [], maxItems = 3, ...props }) => {
  const [showDropdown, setShowDropdown] = React.useState(false);
  
  if (items.length <= maxItems) {
    return <Breadcrumb items={items} {...props} />;
  }
  
  const firstItem = items[0];
  const lastItems = items.slice(-1);
  const hiddenItems = items.slice(1, -1);

  const dropdownItems = [
    firstItem,
    {
      label: '...',
      isDropdown: true,
      onClick: () => setShowDropdown(!showDropdown),
      dropdown: hiddenItems
    },
    ...lastItems
  ];

  return (
    <div className="relative">
      <Breadcrumb items={dropdownItems} {...props} />
      
      {showDropdown && (
        <FadeTransition show={showDropdown}>
          <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-10">
            {hiddenItems.map((item, index) => (
              <Link
                key={index}
                to={item.href}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setShowDropdown(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </FadeTransition>
      )}
    </div>
  );
};

export default Breadcrumb;