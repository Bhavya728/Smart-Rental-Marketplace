import React from 'react';
import { cn } from '../../utils/cn';

const Container = ({ 
  children, 
  className = '', 
  size = 'default',
  center = true,
  padding = true,
  ...props 
}) => {
  // Size variants
  const sizeClasses = {
    xs: 'max-w-3xl',
    sm: 'max-w-4xl', 
    default: 'max-w-7xl',
    lg: 'max-w-screen-xl',
    xl: 'max-w-screen-2xl',
    full: 'max-w-full'
  };

  // Base classes
  const baseClasses = [
    sizeClasses[size],
    center && 'mx-auto',
    padding && 'px-4 sm:px-6 lg:px-8'
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={cn(baseClasses, className)}
      {...props}
    >
      {children}
    </div>
  );
};

// Specialized container variants
export const HeroContainer = ({ children, className = '', ...props }) => (
  <Container
    className={cn('py-20 sm:py-24 lg:py-32', className)}
    {...props}
  >
    {children}
  </Container>
);

export const SectionContainer = ({ children, className = '', ...props }) => (
  <Container
    className={cn('py-12 sm:py-16 lg:py-20', className)}
    {...props}
  >
    {children}
  </Container>
);

export const ContentContainer = ({ children, className = '', ...props }) => (
  <Container
    size="sm"
    className={cn('py-8 sm:py-12', className)}
    {...props}
  >
    {children}
  </Container>
);

export const PageContainer = ({ children, className = '', ...props }) => (
  <Container
    className={cn('min-h-screen flex flex-col', className)}
    {...props}
  >
    {children}
  </Container>
);

export const FormContainer = ({ children, className = '', ...props }) => (
  <Container
    size="xs"
    className={cn('py-12 flex flex-col justify-center min-h-screen', className)}
    {...props}
  >
    {children}
  </Container>
);

export default Container;