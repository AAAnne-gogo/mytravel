import { Clock, MapPin, Trash2, DollarSign } from 'lucide-react';
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
    <div className="group flex gap-3 p-3 bg-gray-50/80 hover:bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
      <div className="flex flex-col items-center gap-1 pt-0.5">
        <span className="text-xs font-medium text-gray-400 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {activity.time}
        </span>
        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${cat.color}`}>
          {cat.label}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-gray-800">{activity.title}</h4>
        {activity.location && (
          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            {activity.location}
          </p>
        )}
        {activity.notes && (
          <p className="text-xs text-gray-400 mt-1">{activity.notes}</p>
        )}
      </div>

      <div className="flex flex-col items-end justify-between">
        {activity.cost > 0 && (
          <span className="text-xs font-medium text-gray-500 flex items-center gap-0.5">
            <DollarSign className="w-3 h-3" />
            {currency} {activity.cost.toLocaleString()}
          </span>
        )}
        <button
          onClick={onDelete}
          className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
          title="删除"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
