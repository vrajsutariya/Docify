import React from 'react';
import { cn } from '../../utils/cn';

export const Card = ({ className, children, hoverEffect = false, ...props }) => {
  return (
    <div
      className={cn(
        'bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-6 transition-all duration-200 shadow-soft dark:shadow-soft-dark',
        hoverEffect && 'hover:border-brand-red/50 hover:shadow-glow-red dark:hover:border-brand-red/60',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
