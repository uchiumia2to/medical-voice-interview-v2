import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  current: number;
  total: number;
  className?: string;
  showPercentage?: boolean;
  showFraction?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  animated?: boolean;
  label?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  className,
  showPercentage = true,
  showFraction = true,
  size = 'md',
  color = 'blue',
  animated = false,
  label
}) => {
  const percentage = Math.min(Math.max((current / total) * 100, 0), 100);

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    yellow: 'bg-yellow-600',
    red: 'bg-red-600',
    purple: 'bg-purple-600'
  };

  const backgroundClass = 'bg-gray-200';
  const progressClass = cn(
    colorClasses[color],
    'transition-all duration-300 ease-out',
    animated && 'bg-gradient-to-r from-current to-current bg-[length:200%] animate-pulse'
  );

  return (
    <div className={cn('w-full', className)}>
      {/* ラベルと進捗情報 */}
      <div className="flex justify-between items-center mb-2">
        {label && (
          <span className="text-sm font-medium text-gray-700">
            {label}
          </span>
        )}
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          {showFraction && (
            <span className="font-medium">
              {current}/{total}
            </span>
          )}
          {showPercentage && (
            <span className="font-medium">
              ({Math.round(percentage)}%)
            </span>
          )}
        </div>
      </div>

      {/* プログレスバー本体 */}
      <div className={cn(
        'w-full rounded-full overflow-hidden',
        backgroundClass,
        sizeClasses[size]
      )}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300 ease-out',
            progressClass
          )}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuetext={`${current} of ${total} (${Math.round(percentage)}%)`}
        />
      </div>
    </div>
  );
};

// セグメント式プログレスバー（ステップ表示用）
interface StepProgressBarProps {
  steps: Array<{
    label: string;
    completed: boolean;
    current?: boolean;
  }>;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export const StepProgressBar: React.FC<StepProgressBarProps> = ({
  steps,
  className,
  orientation = 'horizontal'
}) => {
  const isHorizontal = orientation === 'horizontal';

  return (
    <div className={cn(
      'flex',
      isHorizontal ? 'space-x-4' : 'flex-col space-y-4',
      className
    )}>
      {steps.map((step, index) => (
        <div
          key={index}
          className={cn(
            'flex items-center',
            isHorizontal ? 'flex-1' : 'w-full'
          )}
        >
          {/* ステップサークル */}
          <div className={cn(
            'flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium',
            step.completed
              ? 'bg-blue-600 border-blue-600 text-white'
              : step.current
              ? 'bg-white border-blue-600 text-blue-600'
              : 'bg-white border-gray-300 text-gray-500'
          )}>
            {step.completed ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <span>{index + 1}</span>
            )}
          </div>

          {/* ステップラベル */}
          <span className={cn(
            'ml-3 text-sm font-medium',
            step.completed || step.current
              ? 'text-gray-900'
              : 'text-gray-500'
          )}>
            {step.label}
          </span>

          {/* 接続線（最後以外） */}
          {index < steps.length - 1 && (
            <div className={cn(
              isHorizontal ? 'flex-1 h-0.5 mx-4' : 'w-0.5 h-8 mx-4',
              step.completed
                ? 'bg-blue-600'
                : 'bg-gray-300'
            )} />
          )}
        </div>
      ))}
    </div>
  );
};

export default ProgressBar;
