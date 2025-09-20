import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  rounded?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
  backgroundColor?: 'white' | 'gray' | 'blue' | 'green' | 'yellow' | 'red' | 'orange' | 'purple';
}

const Card: React.FC<CardProps> = ({
  children,
  className,
  padding = 'md',
  shadow = 'md',
  rounded = 'lg',
  border = false,
  backgroundColor = 'white'
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8'
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-lg',
    lg: 'shadow-xl'
  };

  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg'
  };

  const backgroundClasses = {
    white: 'bg-white',
    gray: 'bg-gray-50',
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    yellow: 'bg-yellow-50',
    red: 'bg-red-50',
    orange: 'bg-orange-50',
    purple: 'bg-purple-50'
  };

  const borderClasses = border ? 'border border-gray-200' : '';

  const allClasses = cn(
    backgroundClasses[backgroundColor],
    paddingClasses[padding],
    shadowClasses[shadow],
    roundedClasses[rounded],
    borderClasses,
    className
  );

  return (
    <div className={allClasses}>
      {children}
    </div>
  );
};

// サブコンポーネント：CardHeader
interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  backgroundColor?: 'white' | 'blue' | 'green' | 'yellow' | 'red' | 'orange' | 'purple' | 'gray';
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className,
  icon,
  backgroundColor = 'blue'
}) => {
  const backgroundClasses = {
    white: 'bg-white text-gray-900',
    blue: 'bg-blue-600 text-white',
    green: 'bg-green-600 text-white',
    yellow: 'bg-yellow-600 text-white',
    red: 'bg-red-600 text-white',
    orange: 'bg-orange-600 text-white',
    purple: 'bg-purple-600 text-white',
    gray: 'bg-gray-600 text-white'
  };

  const allClasses = cn(
    backgroundClasses[backgroundColor],
    'p-4 rounded-t-lg flex items-center',
    className
  );

  return (
    <div className={allClasses}>
      {icon && <span className="mr-3 text-xl">{icon}</span>}
      <h2 className="text-lg font-semibold">{children}</h2>
    </div>
  );
};

// サブコンポーネント：CardContent
interface CardContentProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className,
  padding = 'md'
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  const allClasses = cn(
    paddingClasses[padding],
    className
  );

  return (
    <div className={allClasses}>
      {children}
    </div>
  );
};

// サブコンポーネント：CardSection
interface CardSectionProps {
  children: React.ReactNode;
  title: string;
  icon?: React.ReactNode;
  className?: string;
  backgroundColor?: 'white' | 'gray' | 'blue' | 'green' | 'yellow' | 'red' | 'orange' | 'purple';
  borderLeft?: boolean;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export const CardSection: React.FC<CardSectionProps> = ({
  children,
  title,
  icon,
  className,
  backgroundColor = 'gray',
  borderLeft = false,
  collapsible = false,
  defaultExpanded = true
}) => {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

  const backgroundClasses = {
    white: 'bg-white',
    gray: 'bg-gray-50',
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    yellow: 'bg-yellow-50',
    red: 'bg-red-50',
    orange: 'bg-orange-50',
    purple: 'bg-purple-50'
  };

  const borderClasses = borderLeft ? 'border-l-4 border-blue-500' : '';

  const allClasses = cn(
    backgroundClasses[backgroundColor],
    borderClasses,
    'rounded-lg p-4 mb-4',
    className
  );

  const handleToggle = () => {
    if (collapsible) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className={allClasses}>
      <div
        className={cn(
          'flex items-center mb-3',
          collapsible ? 'cursor-pointer' : ''
        )}
        onClick={handleToggle}
      >
        {icon && <span className="mr-2 text-lg">{icon}</span>}
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {collapsible && (
          <span className="ml-auto text-gray-500">
            {isExpanded ? '▼' : '▶'}
          </span>
        )}
      </div>
      {(!collapsible || isExpanded) && (
        <div className="text-gray-700">
          {children}
        </div>
      )}
    </div>
  );
};

export default Card;
