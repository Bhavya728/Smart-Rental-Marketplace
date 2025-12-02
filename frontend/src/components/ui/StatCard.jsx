/**
 * StatCard Component
 * Statistical card component for displaying metrics and data
 */

import React from 'react';
import { cn } from '../../utils/cn';

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  trendLabel,
  variant = 'default',
  size = 'default',
  loading = false,
  className = '',
  children,
  onClick,
  ...props
}) => {
  const isClickable = !!onClick;

  const baseClasses = cn(
    'bg-white rounded-xl border border-gray-200 transition-all duration-200',
    {
      'default': 'shadow-sm hover:shadow-md',
      'gradient': 'bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200',
      'dark': 'bg-gray-900 border-gray-700 text-white',
      'success': 'bg-gradient-to-br from-green-50 to-emerald-100 border-green-200',
      'warning': 'bg-gradient-to-br from-amber-50 to-yellow-100 border-amber-200',
      'danger': 'bg-gradient-to-br from-red-50 to-rose-100 border-red-200',
      'info': 'bg-gradient-to-br from-cyan-50 to-sky-100 border-cyan-200'
    }[variant],
    {
      'sm': 'p-4',
      'default': 'p-6',
      'lg': 'p-8'
    }[size],
    isClickable && 'cursor-pointer hover:scale-105 hover:shadow-lg',
    loading && 'animate-pulse',
    className
  );

  const iconClasses = cn(
    'rounded-lg flex items-center justify-center',
    {
      'sm': 'w-8 h-8',
      'default': 'w-12 h-12',
      'lg': 'w-16 h-16'
    }[size],
    {
      'default': 'bg-blue-100 text-blue-600',
      'gradient': 'bg-blue-200 text-blue-700',
      'dark': 'bg-gray-700 text-gray-300',
      'success': 'bg-green-200 text-green-700',
      'warning': 'bg-amber-200 text-amber-700',
      'danger': 'bg-red-200 text-red-700',
      'info': 'bg-cyan-200 text-cyan-700'
    }[variant]
  );

  const valueClasses = cn(
    'font-black text-gray-900',
    {
      'sm': 'text-lg',
      'default': 'text-2xl',
      'lg': 'text-3xl'
    }[size],
    variant === 'dark' && 'text-white'
  );

  const titleClasses = cn(
    'font-medium text-gray-600',
    {
      'sm': 'text-xs',
      'default': 'text-sm',
      'lg': 'text-base'
    }[size],
    variant === 'dark' && 'text-gray-300'
  );

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up':
      case 'positive':
        return 'text-green-600 bg-green-100';
      case 'down':
      case 'negative':
        return 'text-red-600 bg-red-100';
      case 'neutral':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-blue-600 bg-blue-100';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
      case 'positive':
        return '↗';
      case 'down':
      case 'negative':
        return '↘';
      case 'neutral':
        return '→';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className={baseClasses} {...props}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={baseClasses}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      {...props}
    >
      {/* Header with title and icon */}
      <div className="flex items-center justify-between mb-4">
        <h3 className={titleClasses}>{title}</h3>
        {Icon && (
          <div className={iconClasses}>
            <Icon className={size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6'} />
          </div>
        )}
      </div>

      {/* Main value */}
      <div className="space-y-2">
        <div className={valueClasses}>{value}</div>
        
        {/* Subtitle */}
        {subtitle && (
          <p className={cn('text-gray-500', variant === 'dark' && 'text-gray-400', size === 'sm' ? 'text-xs' : 'text-sm')}>
            {subtitle}
          </p>
        )}

        {/* Trend indicator */}
        {trend && (
          <div className="flex items-center space-x-2">
            <span className={cn(
              'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
              getTrendColor(trend)
            )}>
              <span className="mr-1">{getTrendIcon(trend)}</span>
              {trendValue && <span>{trendValue}</span>}
            </span>
            {trendLabel && (
              <span className={cn('text-xs text-gray-500', variant === 'dark' && 'text-gray-400')}>
                {trendLabel}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Custom children content */}
      {children && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {children}
        </div>
      )}
    </div>
  );
};

// Specialized stat card variants
const RevenueCard = ({ amount, change, period = 'this month', ...props }) => (
  <StatCard
    title="Revenue"
    value={`$${amount?.toLocaleString() || '0'}`}
    subtitle={period}
    trend={change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'}
    trendValue={`${Math.abs(change || 0)}%`}
    trendLabel="vs last period"
    variant="success"
    icon={() => (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
      </svg>
    )}
    {...props}
  />
);

const UsersCard = ({ total, active, growth, ...props }) => (
  <StatCard
    title="Total Users"
    value={total?.toLocaleString() || '0'}
    subtitle={`${active || 0} active users`}
    trend={growth > 0 ? 'up' : growth < 0 ? 'down' : 'neutral'}
    trendValue={`${Math.abs(growth || 0)}%`}
    trendLabel="growth rate"
    variant="info"
    icon={() => (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-1a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )}
    {...props}
  />
);

const ListingsCard = ({ total, published, pending, ...props }) => (
  <StatCard
    title="Listings"
    value={total?.toLocaleString() || '0'}
    subtitle={`${published || 0} published, ${pending || 0} pending`}
    variant="gradient"
    icon={() => (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    )}
    {...props}
  />
);

const BookingsCard = ({ total, confirmed, cancelled, ...props }) => (
  <StatCard
    title="Bookings"
    value={total?.toLocaleString() || '0'}
    subtitle={`${confirmed || 0} confirmed`}
    trend={cancelled > 0 ? 'warning' : 'positive'}
    trendValue={cancelled || 0}
    trendLabel="cancelled"
    variant="warning"
    icon={() => (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4h8m-8 0a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-8a2 2 0 00-2-2H8zm0 0V7a2 2 0 012-2h4a2 2 0 012 2v4" />
      </svg>
    )}
    {...props}
  />
);

// Example usage component
const StatCardExample = () => {
  return (
    <div className="space-y-8 p-6">
      <h2 className="text-2xl font-bold text-gray-900">Stat Card Examples</h2>
      
      {/* Basic examples */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Sales"
          value="$45,231"
          subtitle="Last 30 days"
          trend="up"
          trendValue="12%"
          trendLabel="from last month"
        />
        
        <StatCard
          title="Active Users"
          value="2,350"
          subtitle="Currently online"
          trend="down"
          trendValue="3%"
          trendLabel="from yesterday"
          variant="info"
        />
        
        <StatCard
          title="Conversion Rate"
          value="3.24%"
          subtitle="Website visitors"
          trend="up"
          trendValue="0.5%"
          trendLabel="improvement"
          variant="success"
        />
        
        <StatCard
          title="Bounce Rate"
          value="42.3%"
          subtitle="Average session"
          trend="down"
          trendValue="2.1%"
          trendLabel="decreased"
          variant="warning"
        />
      </div>

      {/* Specialized cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <RevenueCard amount={125430} change={8.2} />
        <UsersCard total={15420} active={1250} growth={12.5} />
        <ListingsCard total={450} published={380} pending={70} />
        <BookingsCard total={89} confirmed={76} cancelled={13} />
      </div>

      {/* Different sizes and variants */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Different Sizes</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Small Card"
            value="1,234"
            size="sm"
            variant="gradient"
          />
          <StatCard
            title="Default Card"
            value="5,678"
            size="default"
            variant="success"
          />
          <StatCard
            title="Large Card"
            value="9,012"
            size="lg"
            variant="info"
          />
        </div>
      </div>

      {/* Loading state */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Loading State</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard loading />
          <StatCard loading />
          <StatCard loading />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
export { RevenueCard, UsersCard, ListingsCard, BookingsCard, StatCardExample };