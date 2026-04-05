// client/src/components/ui/Button.tsx
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  /** Show a pulsing dot indicator */
  live?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className,
  disabled,
  leftIcon,
  rightIcon,
  live = false,
  ...props
}, ref) => {

  const base = [
    'inline-flex items-center justify-center gap-2',
    'font-semibold font-display tracking-wide',
    'transition-all duration-200 cursor-pointer select-none',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-[#080c10]',
    'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
    'relative overflow-hidden',
  ].join(' ');

  const variants: Record<string, string> = {
    primary: [
      'bg-emerald-500 text-black',
      'hover:bg-emerald-400 active:bg-emerald-600',
      'shadow-lg shadow-emerald-500/20',
      'active:scale-[0.97]',
      'before:absolute before:inset-0 before:bg-white/10 before:opacity-0 hover:before:opacity-100 before:transition-opacity',
    ].join(' '),

    secondary: [
      'bg-[#111820] text-[#c8d8e8]',
      'border border-white/8',
      'hover:bg-[#161e28] hover:border-white/12',
      'active:scale-[0.97]',
    ].join(' '),

    ghost: [
      'text-[#6a8a7a]',
      'hover:bg-white/5 hover:text-[#c8d8e8]',
      'active:scale-[0.97]',
    ].join(' '),

    danger: [
      'bg-red-500/10 text-red-400',
      'border border-red-500/20',
      'hover:bg-red-500/20 hover:border-red-500/30',
      'active:scale-[0.97]',
    ].join(' '),

    outline: [
      'border border-white/8 text-[#6a8a7a]',
      'hover:border-emerald-500/30 hover:text-[#c8d8e8] hover:bg-emerald-500/5',
      'active:scale-[0.97]',
    ].join(' '),

    success: [
      'bg-emerald-500/15 text-emerald-400',
      'border border-emerald-500/25',
      'hover:bg-emerald-500/25',
      'active:scale-[0.97]',
    ].join(' '),
  };

  const sizes: Record<string, string> = {
    xs: 'h-6 px-2.5 text-[11px] rounded-lg gap-1.5',
    sm: 'h-7 px-3 text-xs rounded-lg',
    md: 'h-9 px-4 text-sm rounded-xl',
    lg: 'h-11 px-6 text-sm rounded-xl',
  };

  return (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      aria-busy={loading}
      aria-disabled={disabled || loading}
      {...props}
    >
      {/* Loading spinner */}
      {loading && (
        <Loader2
          className="animate-spin flex-shrink-0"
          size={size === 'xs' || size === 'sm' ? 12 : 14}
          aria-hidden="true"
        />
      )}

      {/* Left icon (only when not loading) */}
      {!loading && leftIcon && (
        <span className="flex-shrink-0 flex items-center" aria-hidden="true">
          {leftIcon}
        </span>
      )}

      {/* Single icon (only when not loading) */}
      {!loading && icon && !leftIcon && (
        <span className="flex-shrink-0 flex items-center" aria-hidden="true">
          {icon}
        </span>
      )}

      {children}

      {rightIcon && (
        <span className="flex-shrink-0 flex items-center ml-1" aria-hidden="true">
          {rightIcon}
        </span>
      )}

      {/* Live indicator */}
      {live && (
        <span
          className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0"
          aria-hidden="true"
        />
      )}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
export { Button };