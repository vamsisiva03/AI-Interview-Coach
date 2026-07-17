import React from 'react';
import { PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * EmptyState – a reusable centred empty-state block.
 */
const EmptyState = ({
  icon: Icon,
  iconBg = 'bg-indigo-50',
  iconColor = 'text-indigo-500',
  title = 'Nothing here yet',
  description = '',
  action,
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-fade-in-up">
      {/* Decorative rings */}
      <div className="relative mb-6">
        <div className={`w-20 h-20 rounded-full ${iconBg} flex items-center justify-center shadow-inner relative z-10`}>
          {Icon && <Icon size={32} className={iconColor} />}
        </div>
        <div className={`absolute inset-0 w-20 h-20 rounded-full ${iconBg} opacity-30 animate-ping`} style={{ animationDuration: '3s' }} />
      </div>

      {/* Text */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 max-w-sm leading-relaxed mb-8">
          {description}
        </p>
      )}

      {/* Optional CTA */}
      {action ? (
        <div>{action}</div>
      ) : (
        <button
          onClick={() => navigate('/interview')}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl font-medium text-white shadow-md hover:scale-[1.03] hover:shadow-indigo-500/30 active:scale-95 transition-all duration-300 ease-in-out"
        >
          <PlayCircle size={16} />
          Start Your First Session
        </button>
      )}
    </div>
  );
};

export default EmptyState;
