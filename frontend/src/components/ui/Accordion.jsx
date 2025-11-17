/**
 * Accordion Component
 * Collapsible content panels with smooth animations
 */

import React, { useState, useRef } from 'react';
import { CollapseTransition } from '../../utils/transitions.jsx';
import { cn } from '../../utils/cn';
import { DURATION } from '../../utils/animations';

const Accordion = ({
  items = [],
  allowMultiple = false,
  defaultOpen = [],
  className = '',
  variant = 'default',
  size = 'md',
  animated = true,
  onChange,
  ...props
}) => {
  const [openItems, setOpenItems] = useState(
    Array.isArray(defaultOpen) ? defaultOpen : [defaultOpen].filter(Boolean)
  );

  const toggleItem = (index) => {
    let newOpenItems;
    
    if (allowMultiple) {
      newOpenItems = openItems.includes(index)
        ? openItems.filter(i => i !== index)
        : [...openItems, index];
    } else {
      newOpenItems = openItems.includes(index) ? [] : [index];
    }
    
    setOpenItems(newOpenItems);
    onChange?.(newOpenItems, index);
  };

  const isOpen = (index) => openItems.includes(index);

  const baseClasses = cn(
    'divide-y divide-gray-200',
    {
      'default': 'border border-gray-200 rounded-lg',
      'minimal': '',
      'separated': 'space-y-2'
    }[variant],
    className
  );

  return (
    <div className={baseClasses} {...props}>
      {items.map((item, index) => (
        <AccordionItem
          key={item.id || index}
          index={index}
          item={item}
          isOpen={isOpen(index)}
          onToggle={() => toggleItem(index)}
          variant={variant}
          size={size}
          animated={animated}
        />
      ))}
    </div>
  );
};

const AccordionItem = ({
  item,
  index,
  isOpen,
  onToggle,
  variant,
  size,
  animated
}) => {
  const contentRef = useRef(null);
  
  const headerClasses = cn(
    'flex items-center justify-between w-full text-left transition-colors duration-200',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    {
      'sm': 'px-3 py-2 text-sm',
      'md': 'px-4 py-3 text-base',
      'lg': 'px-6 py-4 text-lg'
    }[size],
    {
      'default': 'hover:bg-gray-50',
      'minimal': 'hover:text-blue-600',
      'separated': 'bg-white hover:bg-gray-50 rounded-lg border border-gray-200'
    }[variant],
    item.disabled && 'opacity-50 cursor-not-allowed'
  );

  const contentClasses = cn(
    {
      'sm': 'px-3 pb-2',
      'md': 'px-4 pb-3',
      'lg': 'px-6 pb-4'
    }[size],
    {
      'default': 'bg-gray-50',
      'minimal': '',
      'separated': 'bg-white rounded-b-lg border-t border-gray-200'
    }[variant]
  );

  const chevronClasses = cn(
    'flex-shrink-0 transition-transform duration-200',
    {
      'sm': 'w-4 h-4',
      'md': 'w-5 h-5',
      'lg': 'w-6 h-6'
    }[size],
    isOpen && 'transform rotate-180'
  );

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onToggle();
    }
  };

  const Content = () => (
    <div className={contentClasses}>
      {typeof item.content === 'string' ? (
        <p className="text-gray-700">{item.content}</p>
      ) : (
        item.content
      )}
    </div>
  );

  return (
    <div className={variant === 'separated' ? 'bg-white rounded-lg border border-gray-200' : ''}>
      {/* Header */}
      <button
        className={headerClasses}
        onClick={onToggle}
        onKeyDown={handleKeyDown}
        disabled={item.disabled}
        aria-expanded={isOpen}
        aria-controls={`accordion-content-${index}`}
      >
        <div className="flex items-center space-x-3">
          {item.icon && (
            <span className="flex-shrink-0 text-gray-400">
              {item.icon}
            </span>
          )}
          <div className="text-left">
            <div className={cn(
              'font-medium text-gray-900',
              {
                'sm': 'text-sm',
                'md': 'text-base',
                'lg': 'text-lg'
              }[size]
            )}>
              {item.title}
            </div>
            {item.subtitle && (
              <div className={cn(
                'text-gray-500',
                {
                  'sm': 'text-xs',
                  'md': 'text-sm',
                  'lg': 'text-base'
                }[size]
              )}>
                {item.subtitle}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {item.badge && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {item.badge}
            </span>
          )}
          <svg
            className={chevronClasses}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {/* Content */}
      {animated ? (
        <CollapseTransition show={isOpen} duration={DURATION.DEFAULT}>
          <Content />
        </CollapseTransition>
      ) : (
        isOpen && <Content />
      )}
    </div>
  );
};

// FAQ Accordion preset
export const FAQAccordion = ({ faqs = [], ...props }) => {
  const faqItems = faqs.map((faq, index) => ({
    id: `faq-${index}`,
    title: faq.question,
    content: faq.answer,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }));

  return (
    <Accordion
      items={faqItems}
      allowMultiple={false}
      variant="default"
      {...props}
    />
  );
};

// Settings Accordion preset
export const SettingsAccordion = ({ sections = [], ...props }) => {
  const settingItems = sections.map((section, index) => ({
    id: `setting-${index}`,
    title: section.title,
    subtitle: section.description,
    content: section.component || section.content,
    icon: section.icon || (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      </svg>
    )
  }));

  return (
    <Accordion
      items={settingItems}
      allowMultiple={true}
      variant="separated"
      {...props}
    />
  );
};

// Product Features Accordion
export const FeaturesAccordion = ({ features = [], ...props }) => {
  const featureItems = features.map((feature, index) => ({
    id: `feature-${index}`,
    title: feature.name,
    subtitle: feature.summary,
    content: (
      <div className="space-y-4">
        <p className="text-gray-700">{feature.description}</p>
        {feature.benefits && (
          <ul className="space-y-2">
            {feature.benefits.map((benefit, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-gray-600">{benefit}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    ),
    badge: feature.isNew ? 'New' : feature.isPro ? 'Pro' : null,
    icon: feature.icon
  }));

  return (
    <Accordion
      items={featureItems}
      allowMultiple={true}
      variant="default"
      {...props}
    />
  );
};

export default Accordion;