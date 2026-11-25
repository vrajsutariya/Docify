import React from 'react';
import { cn } from '../../utils/cn';

export const Skeleton = ({
  className,
  variant = 'rect',
  ...props
}) => {
  const baseClasses = 'animate-pulse bg-zinc-200 dark:bg-zinc-800/80';

  const variants = {
    text: 'h-4 w-full rounded',
    title: 'h-6 w-3/4 rounded-md',
    avatar: 'w-10 h-10 rounded-full shrink-0',
    card: 'h-40 w-full rounded-2xl',
    button: 'h-9 w-24 rounded-xl',
    rect: 'rounded-xl',
  };

  return (
    <div
      className={cn(baseClasses, variants[variant] || variants.rect, className)}
      {...props}
    />
  );
};

export const CardSkeleton = () => {
  return (
    <div className="card-surface p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton variant="avatar" className="w-10 h-10 rounded-xl" />
        <div className="space-y-1.5 flex-1">
          <Skeleton variant="title" className="w-1/3" />
          <Skeleton variant="text" className="w-2/3" />
        </div>
      </div>
      <Skeleton variant="rect" className="h-24 w-full" />
      <div className="flex items-center justify-between pt-2">
        <Skeleton variant="button" className="w-20" />
        <Skeleton variant="button" className="w-28" />
      </div>
    </div>
  );
};

export default Skeleton;
