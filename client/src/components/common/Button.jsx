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
      'relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none overflow-hidden cursor-pointer';

    const variants = {
      primary:
        'bg-accent text-black font-bold hover:bg-cyan-400 hover:text-black hover:border-cyan-400 hover:shadow-glow-cyan dark:bg-accent-light dark:text-black dark:hover:bg-cyan-300 dark:hover:text-black dark:hover:shadow-glow-cyan shadow-soft',
      gradient:
        'btn-gradient text-white hover:bg-cyan-400 hover:text-black hover:shadow-glow-cyan shadow-soft',
      secondary:
        'bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-heading dark:text-dark-heading hover:bg-cyan-400 hover:text-black hover:border-cyan-400 hover:shadow-glow-cyan dark:hover:bg-cyan-400 dark:hover:text-black dark:hover:border-cyan-400 shadow-sm',
      outline:
        'border border-accent dark:border-accent-light text-accent-dark dark:text-accent-light bg-transparent hover:bg-cyan-400 hover:text-black hover:border-cyan-400 hover:shadow-glow-cyan dark:hover:bg-cyan-400 dark:hover:text-black dark:hover:border-cyan-400',
      danger:
        'bg-status-error text-white hover:bg-cyan-500 hover:text-black hover:shadow-glow-cyan shadow-soft focus-visible:ring-status-error',
      ghost:
        'bg-transparent text-light-heading dark:text-dark-heading hover:bg-cyan-400 hover:text-black hover:shadow-glow-cyan dark:hover:bg-cyan-400 dark:hover:text-black',
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
