import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../utils/cn';

export const Card = ({
  className,
  children,
  hoverable = false,
  hoverEffect = false, // compatibility alias
  asMotion = false,
  ...props
}) => {
  const isHoverable = hoverable || hoverEffect;

  const cardClasses = cn(
    'card-surface bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-6 shadow-soft dark:shadow-soft-dark text-light-body dark:text-dark-body transition-all duration-200',
    isHoverable &&
      'hover:-translate-y-1 hover:border-accent/40 dark:hover:border-accent-light/40 hover:shadow-md cursor-pointer',
    className
  );

  if (asMotion) {
    return (
      <motion.div
        whileHover={isHoverable ? { y: -3 } : undefined}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={cardClasses}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

export const CardHeader = ({ className, children, ...props }) => (
  <div className={cn('flex flex-col space-y-1.5 pb-4 border-b border-light-border dark:border-dark-border mb-4', className)} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ className, children, ...props }) => (
  <h3 className={cn('font-heading font-semibold text-lg text-light-heading dark:text-dark-heading tracking-tight', className)} {...props}>
    {children}
  </h3>
);

export const CardDescription = ({ className, children, ...props }) => (
  <p className={cn('text-xs text-light-body dark:text-dark-body', className)} {...props}>
    {children}
  </p>
);

export const CardContent = ({ className, children, ...props }) => (
  <div className={cn('pt-0', className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ className, children, ...props }) => (
  <div className={cn('flex items-center pt-4 border-t border-light-border dark:border-dark-border mt-4', className)} {...props}>
    {children}
  </div>
);

export default Card;
