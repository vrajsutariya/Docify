import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export const Loader = ({
  size = 'md',
  label,
  className,
  fullPage = false,
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };

  const content = (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <Loader2
        className={cn(
          'animate-spin text-accent dark:text-accent-light shrink-0',
          sizes[size] || sizes.md
        )}
        aria-hidden="true"
      />
      {label && (
        <p className="text-xs font-medium text-light-body dark:text-dark-body animate-pulse">
          {label}
        </p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-[50vh] w-full flex items-center justify-center p-8">
        {content}
      </div>
    );
  }

  return content;
};

export default Loader;
