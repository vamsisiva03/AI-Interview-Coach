import React from 'react';

const StatCard = ({
  label,
  value,
  icon: Icon,
  trend,
  trendUp = true,
  subtitle
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100">
          {Icon && <Icon size={20} className="text-gray-600" />}
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-md border ${
            trendUp ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-semibold text-gray-900 tracking-tight leading-none mb-1">{value}</p>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
};

export default StatCard;
