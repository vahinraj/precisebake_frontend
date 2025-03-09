import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'rounded-full font-medium transition-all duration-300 button-hover focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
          {
            'bg-[--primary] text-white hover:brightness-110 focus:ring-[--primary]': variant === 'primary',
            'bg-[--secondary] text-white hover:brightness-110 focus:ring-[--secondary]': variant === 'secondary',
            'border-2 border-[--primary] text-[--primary] hover:bg-[--primary] hover:text-white focus:ring-[--primary]': variant === 'outline',
            'px-4 py-2 text-sm': size === 'sm',
            'px-6 py-3 text-base': size === 'md',
            'px-8 py-4 text-lg': size === 'lg',
          },
          className
        )}
        disabled={loading}
        {...props}
      >
        <div className="flex items-center justify-center space-x-2">
          {loading && (
            <div className="loading-spinner w-4 h-4" />
          )}
          <span>{children}</span>
        </div>
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;