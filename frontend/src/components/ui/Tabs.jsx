/**
 * Tabs Component
 * Tab navigation component with support for various styles
 */

import React, { useState, Children, cloneElement } from 'react';
import { cn } from '../../utils/cn';

const Tabs = ({
  defaultValue = '',
  value: controlledValue,
  onChange,
  onValueChange, // Keep for backward compatibility
  orientation = 'horizontal',
  variant = 'default',
  className = '',
  children,
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;

  const handleValueChange = (newValue) => {
    if (!isControlled) {
      setInternalValue(newValue);
    }
    // Use onChange if provided, fallback to onValueChange for backward compatibility
    onChange?.(newValue) || onValueChange?.(newValue);
  };

  return (
    <div
      className={cn(
        'tabs',
        orientation === 'vertical' && 'flex',
        className
      )}
      {...props}
    >
      {Children.map(children, (child) => {
        if (child?.type === TabsList || child?.type === TabsContent) {
          return cloneElement(child, {
            currentValue,
            onValueChange: handleValueChange,
            orientation,
            variant
          });
        }
        return child;
      })}
    </div>
  );
};

const TabsList = ({
  children,
  currentValue,
  onValueChange,
  orientation = 'horizontal',
  variant = 'default',
  className = '',
  ...props
}) => {
  const baseClasses = cn(
    'inline-flex items-center',
    orientation === 'horizontal' ? 'space-x-1' : 'flex-col space-y-1',
    {
      'default': 'bg-gray-100 p-1 rounded-lg',
      'pills': 'space-x-2',
      'underline': orientation === 'horizontal' ? 'border-b border-gray-200' : 'border-r border-gray-200',
      'bordered': 'border border-gray-200 rounded-lg p-1 bg-white'
    }[variant],
    className
  );

  return (
    <div className={baseClasses} {...props}>
      {Children.map(children, (child) => {
        if (child?.type === TabsTrigger) {
          return cloneElement(child, {
            currentValue,
            onValueChange,
            variant,
            orientation
          });
        }
        return child;
      })}
    </div>
  );
};

const TabsTrigger = ({
  value,
  children,
  currentValue,
  onValueChange,
  variant = 'default',
  orientation = 'horizontal',
  disabled = false,
  className = '',
  ...props
}) => {
  const isActive = currentValue === value;

  const baseClasses = cn(
    'inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium transition-all',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
    {
      'default': cn(
        'rounded-md',
        isActive 
          ? 'bg-white text-gray-900 shadow-sm' 
          : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
      ),
      'pills': cn(
        'rounded-full px-4',
        isActive
          ? 'bg-blue-600 text-white shadow-lg'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      ),
      'underline': cn(
        orientation === 'horizontal' ? 'border-b-2 pb-2' : 'border-r-2 pr-2',
        isActive
          ? 'border-blue-600 text-blue-600'
          : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
      ),
      'bordered': cn(
        'rounded-md',
        isActive
          ? 'bg-blue-50 text-blue-700 border border-blue-200'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      )
    }[variant],
    className
  );

  return (
    <button
      className={baseClasses}
      onClick={() => !disabled && onValueChange?.(value)}
      disabled={disabled}
      type="button"
      role="tab"
      aria-selected={isActive}
      {...props}
    >
      {children}
    </button>
  );
};

const TabsContent = ({
  value,
  children,
  currentValue,
  forceMount = false,
  className = '',
  ...props
}) => {
  const isActive = currentValue === value;

  if (!forceMount && !isActive) {
    return null;
  }

  return (
    <div
      className={cn(
        'mt-4 focus:outline-none',
        !isActive && 'hidden',
        className
      )}
      role="tabpanel"
      {...props}
    >
      {children}
    </div>
  );
};

// Example usage component
const TabsExample = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-8 p-6">
      {/* Default Tabs */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Default Tabs</h3>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="settings" disabled>Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <div className="p-4 border rounded-lg">Overview content goes here</div>
          </TabsContent>
          <TabsContent value="analytics">
            <div className="p-4 border rounded-lg">Analytics content goes here</div>
          </TabsContent>
          <TabsContent value="reports">
            <div className="p-4 border rounded-lg">Reports content goes here</div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Pills Variant */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Pills Variant</h3>
        <Tabs defaultValue="dashboard" variant="pills">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="listings">Listings</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard">Dashboard content</TabsContent>
          <TabsContent value="users">Users content</TabsContent>
          <TabsContent value="listings">Listings content</TabsContent>
        </Tabs>
      </div>

      {/* Underline Variant */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Underline Variant</h3>
        <Tabs defaultValue="recent" variant="underline">
          <TabsList>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="popular">Popular</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
          </TabsList>
          <TabsContent value="recent">Recent activity</TabsContent>
          <TabsContent value="popular">Popular items</TabsContent>
          <TabsContent value="trending">Trending content</TabsContent>
        </Tabs>
      </div>

      {/* Vertical Orientation */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Vertical Tabs</h3>
        <Tabs defaultValue="profile" orientation="vertical" className="space-x-4">
          <TabsList orientation="vertical" className="w-40">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          <div className="flex-1">
            <TabsContent value="profile">Profile settings</TabsContent>
            <TabsContent value="account">Account settings</TabsContent>
            <TabsContent value="billing">Billing information</TabsContent>
            <TabsContent value="notifications">Notification preferences</TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

// Export components
Tabs.List = TabsList;
Tabs.Trigger = TabsTrigger;
Tabs.Content = TabsContent;

export default Tabs;
export { TabsList, TabsTrigger, TabsContent, TabsExample };