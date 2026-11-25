import React from 'react';
import { cn } from '../../utils/cn';

export const Badge = ({ children, variant = 'primary', className, ...props }) => {
  const variants = {
    primary: 'bg-brand-red/10 text-brand-red-bright border-brand-red/20',
    secondary: 'bg-brand-orange/10 text-brand-orange-bright border-brand-orange/20',
    neutral: 'bg-zinc-500/10 text-zinc-400 border-zinc-700/30',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
