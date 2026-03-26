import { Clock, MapPin, Trash2 } from 'lucide-react';
import type { Activity } from '../types';
import { CATEGORY_CONFIG } from '../types';

interface Props {
  activity: Activity;
  onDelete: () => void;
  currency: string;
}

export default function ActivityItem({ activity, onDelete, currency }: Props) {
  const cat = CATEGORY_CONFIG[activity.category];

  return (
    <div className="group flex gap-4 p-4 glass-card rounded-xl transition-all duration-300 hover:scale-[1.01]">
      {/* Timeline connector */}
      <div className="flex flex-col items-center gap-2 pt-1">
        <div className="timeline-dot flex-shrink-0" />
        <div className="flex-1 w-px bg-gradient-to-b from-primary-500/20 to-transparent" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs text-white/30 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {activity.time}
              </span>
              <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${cat.bg}`}>
                {cat.icon} {cat.label}
              </span>
            </div>
            <h4 className="text-sm font-semibold text-white/90 mb-1">{activity.title}</h4>
            {activity.location && (
              <p className="text-xs text-white/30 flex items-center gap-1">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                {activity.location}
              </p>
            )}
            {activity.notes && (
              <p className="text-xs text-white/20 mt-1.5 italic">{activity.notes}</p>
            )}
          </div>

          <div className="flex flex-col items-end gap-2">
            {activity.cost > 0 && (
              <span className="text-sm font-bold text-primary-300">
                {currency}{activity.cost.toLocaleString()}
              </span>
            )}
            <button
              onClick={onDelete}
              className="p-1.5 text-white/10 hover:text-red-400 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
              title="删除"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
