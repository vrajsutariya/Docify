import React from 'react';
import { cn } from '../../utils/cn';

export const Button = React.forwardRef(
  ({ className, variant = 'primary', size = 'md', children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary: 'bg-brand-red hover:bg-brand-red-hover text-white shadow-soft dark:shadow-glow-red',
      secondary: 'bg-brand-orange hover:bg-brand-orange-hover text-white shadow-soft dark:shadow-glow-orange',
      outline: 'border border-light-border dark:border-dark-border bg-transparent hover:bg-light-surface dark:hover:bg-dark-surface text-light-heading dark:text-dark-text-primary',
      ghost: 'bg-transparent hover:bg-light-surface dark:hover:bg-dark-surface text-light-heading dark:text-dark-text-primary',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
