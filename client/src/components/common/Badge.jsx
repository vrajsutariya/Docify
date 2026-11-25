import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { cn } from '../../utils/cn';

const defaultIcons = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
  brand: Sparkles,
  neutral: HelpCircle,
};

export const Badge = ({
  children,
  variant = 'brand',
  icon: IconProp,
  size = 'md',
  className,
  ...props
}) => {
  const IconComponent = IconProp || defaultIcons[variant] || Sparkles;

  const variants = {
    brand:
      'bg-accent/10 text-accent-dark dark:text-accent-light border-accent/20 dark:border-accent-light/20',
    primary:
      'bg-accent/10 text-accent-dark dark:text-accent-light border-accent/20 dark:border-accent-light/20',
    secondary:
      'bg-light-surface dark:bg-dark-surface text-light-heading dark:text-dark-heading border-light-border dark:border-dark-border',
    success:
      'bg-status-success/10 text-emerald-600 dark:text-emerald-400 border-status-success/20',
    warning:
      'bg-status-warning/10 text-amber-600 dark:text-amber-400 border-status-warning/20',
    error:
      'bg-status-error/10 text-status-error border-status-error/20',
    info:
      'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    neutral:
      'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[11px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border transition-colors select-none',
        variants[variant] || variants.brand,
        sizes[size],
        className
      )}
      {...props}
    >
      <IconComponent className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </span>
  );
};

export default Badge;
