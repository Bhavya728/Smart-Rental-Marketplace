import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

// Base Card Component
const Card = forwardRef(({ 
  className, 
  variant = 'default',
  size = 'md',
  hover = false,
  clickable = false,
  children,
  ...props 
}, ref) => {
  
  const baseStyles = 'bg-white/90 backdrop-blur-sm rounded-2xl transition-all duration-300 ease-out';
  
  const sizeStyles = {
    xs: 'p-4',
    sm: 'p-5',
    md: 'p-7',
    lg: 'p-9',
    xl: 'p-12'
  };
  
  const variantStyles = {
    default: 'border border-gray-200/60 shadow-lg shadow-gray-200/40',
    outlined: 'border-2 border-gray-300/70 shadow-md shadow-gray-100/50',
    elevated: 'shadow-2xl shadow-gray-300/25 border border-gray-100/50 bg-white',
    flat: 'border-0 shadow-sm shadow-gray-100/30',
    gradient: 'bg-gradient-to-br from-blue-50/80 via-indigo-50/60 to-purple-50/80 border border-blue-200/50 shadow-lg shadow-blue-200/20',
    glass: 'bg-white/20 backdrop-blur-xl border border-white/30 shadow-xl shadow-gray-900/10',
    premium: 'bg-gradient-to-br from-amber-50/90 via-orange-50/80 to-yellow-50/90 border border-amber-200/60 shadow-xl shadow-amber-200/30'
  };
  
  const hoverStyles = hover ? 'hover:shadow-2xl hover:shadow-gray-300/30 hover:border-gray-300/80 hover:-translate-y-1 hover:scale-[1.02]' : '';
  const clickableStyles = clickable ? 'cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:ring-offset-2 active:scale-[0.98]' : '';
  
  const cardStyles = cn(
    baseStyles,
    sizeStyles[size],
    variantStyles[variant],
    hoverStyles,
    clickableStyles,
    className
  );

  const Component = clickable ? 'button' : 'div';

  return (
    <Component
      className={cardStyles}
      ref={ref}
      {...props}
    >
      {children}
    </Component>
  );
});

Card.displayName = 'Card';

// Card Header Component
export const CardHeader = ({ className, children, ...props }) => {
  const headerStyles = cn(
    'pb-5 border-b border-gray-200/60 mb-6 relative',
    'after:absolute after:bottom-0 after:left-0 after:w-12 after:h-0.5 after:bg-gradient-to-r after:from-blue-500 after:to-purple-500 after:rounded-full',
    className
  );

  return (
    <div className={headerStyles} {...props}>
      {children}
    </div>
  );
};

// Card Title Component
export const CardTitle = ({ className, size = 'lg', gradient = false, children, ...props }) => {
  const sizeStyles = {
    sm: 'text-sm font-semibold tracking-wide',
    md: 'text-base font-bold tracking-wide',
    lg: 'text-xl font-bold tracking-tight',
    xl: 'text-2xl font-bold tracking-tight',
    '2xl': 'text-3xl font-bold tracking-tight'
  };

  const titleStyles = cn(
    gradient 
      ? 'bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent' 
      : 'text-gray-900',
    sizeStyles[size],
    'leading-snug',
    className
  );

  return (
    <h3 className={titleStyles} {...props}>
      {children}
    </h3>
  );
};

// Card Description Component
export const CardDescription = ({ className, children, ...props }) => {
  const descStyles = cn(
    'text-sm text-gray-600/80 mt-2 leading-relaxed font-medium',
    className
  );

  return (
    <p className={descStyles} {...props}>
      {children}
    </p>
  );
};

// Card Content Component
export const CardContent = ({ className, children, ...props }) => {
  const contentStyles = cn(
    'space-y-5 text-gray-700',
    className
  );

  return (
    <div className={contentStyles} {...props}>
      {children}
    </div>
  );
};

// Card Footer Component
export const CardFooter = ({ className, children, ...props }) => {
  const footerStyles = cn(
    'pt-6 border-t border-gray-200/60 mt-6 flex items-center justify-between',
    className
  );

  return (
    <div className={footerStyles} {...props}>
      {children}
    </div>
  );
};

// Card Actions Component
export const CardActions = ({ className, align = 'right', children, ...props }) => {
  const alignStyles = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between'
  };

  const actionsStyles = cn(
    'flex items-center gap-2',
    alignStyles[align],
    className
  );

  return (
    <div className={actionsStyles} {...props}>
      {children}
    </div>
  );
};

// Specialized Card Components
export const StatsCard = ({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend,
  trendType = 'neutral',
  className,
  ...props 
}) => {
  const trendColors = {
    positive: 'text-emerald-600 bg-emerald-50',
    negative: 'text-red-600 bg-red-50',
    neutral: 'text-gray-600 bg-gray-50'
  };

  const iconBgColors = {
    positive: 'bg-gradient-to-br from-emerald-100 to-green-100',
    negative: 'bg-gradient-to-br from-red-100 to-rose-100',
    neutral: 'bg-gradient-to-br from-blue-100 to-indigo-100'
  };

  return (
    <Card className={cn('relative overflow-hidden group', className)} variant="elevated" hover {...props}>
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-gray-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <p className="text-sm font-semibold text-gray-600/80 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
          
          {description && (
            <p className="text-sm text-gray-500/90 leading-relaxed">{description}</p>
          )}
          
          {trend && (
            <div className={cn('inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium', trendColors[trendType])}>
              {trendType === 'positive' && (
                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              )}
              {trendType === 'negative' && (
                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              )}
              {trend}
            </div>
          )}
        </div>
        
        {Icon && (
          <div className="flex-shrink-0">
            <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-all duration-300', iconBgColors[trendType] || iconBgColors.neutral)}>
              <Icon className="w-7 h-7 text-blue-600" />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

// Profile Card Component
export const ProfileCard = ({ 
  name, 
  email, 
  avatar, 
  role, 
  description,
  verified = false,
  actions,
  className,
  ...props 
}) => {
  return (
    <Card className={cn('text-center', className)} {...props}>
      <div className="space-y-4">
        <div className="relative inline-block">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 mx-auto">
            {avatar ? (
              <img src={avatar} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white text-2xl font-bold">
                {name ? name.charAt(0).toUpperCase() : '?'}
              </div>
            )}
          </div>
          
          {verified && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
          {email && <p className="text-sm text-gray-600">{email}</p>}
          {role && (
            <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
              {role}
            </span>
          )}
        </div>
        
        {description && (
          <p className="text-sm text-gray-600">{description}</p>
        )}
        
        {actions && (
          <div className="pt-4 border-t border-gray-200">
            {actions}
          </div>
        )}
      </div>
    </Card>
  );
};

// Feature Card Component
export const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description, 
  action,
  className,
  ...props 
}) => {
  return (
    <Card className={className} hover clickable {...props}>
      <div className="space-y-4">
        {Icon && (
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
            <Icon className="w-6 h-6 text-blue-600" />
          </div>
        )}
        
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
        
        {action && (
          <div className="pt-2">
            {action}
          </div>
        )}
      </div>
    </Card>
  );
};

// Pricing Card Component
export const PricingCard = ({ 
  title, 
  price, 
  period = 'month',
  description, 
  features = [],
  popular = false,
  action,
  className,
  ...props 
}) => {
  return (
    <Card 
      className={cn(
        'relative',
        popular && 'border-blue-500 border-2',
        className
      )} 
      {...props}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-500 text-white px-3 py-1 text-sm font-medium rounded-full">
            Popular
          </span>
        </div>
      )}
      
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
        
        <div className="text-center">
          <span className="text-4xl font-bold text-gray-900">{price}</span>
          {period && (
            <span className="text-gray-600 ml-1">/{period}</span>
          )}
        </div>
        
        {features.length > 0 && (
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-600">{feature}</span>
              </li>
            ))}
          </ul>
        )}
        
        {action && (
          <div className="pt-4 border-t border-gray-200">
            {action}
          </div>
        )}
      </div>
    </Card>
  );
};

// Notification Card Component
export const NotificationCard = ({ 
  type = 'info',
  title, 
  message, 
  timestamp,
  avatar,
  actions,
  unread = false,
  className,
  ...props 
}) => {
  const typeStyles = {
    info: 'border-l-4 border-blue-500 bg-blue-50',
    success: 'border-l-4 border-green-500 bg-green-50',
    warning: 'border-l-4 border-yellow-500 bg-yellow-50',
    error: 'border-l-4 border-red-500 bg-red-50'
  };

  return (
    <Card 
      className={cn(
        typeStyles[type],
        unread && 'ring-2 ring-blue-500 ring-opacity-50',
        className
      )} 
      size="sm"
      {...props}
    >
      <div className="flex items-start space-x-3">
        {avatar && (
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full overflow-hidden">
              <img src={avatar} alt="" className="w-full h-full object-cover" />
            </div>
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">{title}</h4>
            {timestamp && (
              <span className="text-xs text-gray-500">{timestamp}</span>
            )}
          </div>
          
          {message && (
            <p className="text-sm text-gray-600 mt-1">{message}</p>
          )}
          
          {actions && (
            <div className="mt-3 flex space-x-2">
              {actions}
            </div>
          )}
        </div>
        
        {unread && (
          <div className="flex-shrink-0">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default Card;