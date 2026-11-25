import React from 'react';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export const Button = React.forwardRef(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      children,
      disabled = false,
      type = 'button',
      onClick,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    const baseStyles =
      'relative inline-flex items-center justify-center font-medium rounded-xl transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none overflow-hidden';

    const variants = {
      primary:
        'bg-accent text-white hover:bg-accent-hover dark:bg-accent-light dark:text-black dark:hover:bg-accent shadow-soft',
      gradient:
        'btn-gradient text-white shadow-soft dark:shadow-glow-cyan',
      secondary:
        'bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-heading dark:text-dark-heading hover:border-accent dark:hover:border-accent-light shadow-sm',
      outline:
        'border border-accent dark:border-accent-light text-accent-dark dark:text-accent-light bg-transparent hover:bg-accent/10 dark:hover:bg-accent-light/10',
      danger:
        'bg-status-error text-white hover:bg-red-700 shadow-soft focus-visible:ring-status-error',
      ghost:
        'bg-transparent text-light-heading dark:text-dark-heading hover:bg-light-surface dark:hover:bg-dark-surface',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs gap-1.5',
      md: 'px-4 py-2 text-sm gap-2',
      lg: 'px-6 py-2.5 text-base gap-2.5',
    };

    return (
      <motion.button
        ref={ref}
        type={type}
        disabled={isDisabled}
        onClick={onClick}
        whileHover={isDisabled ? undefined : { scale: 1.02 }}
        whileTap={isDisabled ? undefined : { scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
        )}
        {!isLoading && LeftIcon && (
          <LeftIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
        )}
        <span>{children}</span>
        {!isLoading && RightIcon && (
          <RightIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
