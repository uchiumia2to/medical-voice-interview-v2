import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  icon,
  className,
  disabled,
  ...props
}) => {
  const baseClasses = [
    'inline-flex items-center justify-center font-medium rounded-lg',
    'transition-colors duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed'
  ];

  const variantClasses = {
    primary: [
      'bg-blue-600 text-white',
      'hover:bg-blue-700',
      'focus:ring-blue-500',
      'disabled:bg-gray-300'
    ],
    secondary: [
      'bg-gray-600 text-white',
      'hover:bg-gray-700',
      'focus:ring-gray-500',
      'disabled:bg-gray-300'
    ],
    success: [
      'bg-green-600 text-white',
      'hover:bg-green-700',
      'focus:ring-green-500',
      'disabled:bg-gray-300'
    ],
    warning: [
      'bg-orange-600 text-white',
      'hover:bg-orange-700',
      'focus:ring-orange-500',
      'disabled:bg-gray-300'
    ],
    danger: [
      'bg-red-600 text-white',
      'hover:bg-red-700',
      'focus:ring-red-500',
      'disabled:bg-gray-300'
    ],
    info: [
      'bg-purple-600 text-white',
      'hover:bg-purple-700',
      'focus:ring-purple-500',
      'disabled:bg-gray-300'
    ]
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const widthClasses = fullWidth ? 'w-full' : '';

  const allClasses = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    widthClasses,
    className
  );

  return (
    <button
      className={allClasses}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          処理中...
        </>
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
