import React from 'react';
import { UserCheck, Star, PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const defaultEvents = [
  {
    id: 1,
    Icon: UserCheck,
    label: 'Account Created',
    description: 'Welcome to AI Interview Coach!',
    time: 'Just now',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100/60',
  },
];

const ActivityTimeline = ({ events = [] }) => {
  const navigate = useNavigate();
  const items = events.length > 0 ? events : defaultEvents;

  return (
    <div className="flex flex-col h-full">
      {/* Timeline */}
      <div className="relative flex-1">
        {/* Vertical line */}
        {items.length > 1 && (
          <div className="absolute left-[13px] top-4 bottom-2 w-px bg-gradient-to-b from-slate-200 to-transparent" />
        )}

        <div className="space-y-4">
          {items.map((event, idx) => {
            const Icon = event.Icon || event.icon || Star;
            return (
              <div
                key={event.id || idx}
                className="flex items-start gap-3 relative group"
              >
                {/* Icon bubble */}
                <div
                  className={`shrink-0 w-7 h-7 rounded-lg border ${event.color || 'bg-indigo-50 text-indigo-600 border-indigo-100/60'} flex items-center justify-center relative z-10 shadow-sm group-hover:scale-105 transition-transform duration-200`}
                >
                  <Icon size={12} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-xs font-bold text-slate-800 leading-none mb-1">
                    {event.label}
                  </p>
                  {event.description && (
                    <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                      {event.description}
                    </p>
                  )}
                </div>

                {/* Timestamp */}
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider whitespace-nowrap pt-0.5">
                  {event.time}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer hint when no events */}
      {events.length === 0 && (
        <div className="mt-4 pt-4 border-t border-slate-100 text-center space-y-3">
          <p className="text-[11px] font-semibold text-slate-400">
            Complete your first interview to see more activity.
          </p>
          <button
            onClick={() => navigate('/interview')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primaryHover transition-colors"
          >
            <PlayCircle size={13} /> Start Session
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityTimeline;
