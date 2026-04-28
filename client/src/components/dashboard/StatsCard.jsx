import React from 'react';
import clsx from 'clsx';

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'bg-blue-100 text-blue-600',
    value: 'text-blue-700',
  },
  green: {
    bg: 'bg-green-50',
    icon: 'bg-green-100 text-green-600',
    value: 'text-green-700',
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'bg-purple-100 text-purple-600',
    value: 'text-purple-700',
  },
  orange: {
    bg: 'bg-orange-50',
    icon: 'bg-orange-100 text-orange-600',
    value: 'text-orange-700',
  },
  red: {
    bg: 'bg-red-50',
    icon: 'bg-red-100 text-red-600',
    value: 'text-red-700',
  },
  indigo: {
    bg: 'bg-indigo-50',
    icon: 'bg-indigo-100 text-indigo-600',
    value: 'text-indigo-700',
  },
};

const StatsCard = ({ title, value, icon: Icon, color = 'blue', change, changeLabel }) => {
  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <div className={clsx('rounded-xl p-5 border', colors.bg, 'border-transparent')}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={clsx('text-3xl font-bold mt-1', colors.value)}>{value}</p>
          {change !== undefined && (
            <p className="text-xs text-gray-500 mt-1">
              <span className={change >= 0 ? 'text-green-600' : 'text-red-600'}>
                {change >= 0 ? '+' : ''}{change}
              </span>{' '}
              {changeLabel || 'this week'}
            </p>
          )}
        </div>
        <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center', colors.icon)}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
