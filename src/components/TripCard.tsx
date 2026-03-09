import { Link } from 'react-router-dom';
import { format, parseISO, differenceInDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { MapPin, Calendar, Wallet, Trash2 } from 'lucide-react';
import type { Trip } from '../types';
import { useTripStore } from '../store/useTripStore';

export default function TripCard({ trip }: { trip: Trip }) {
  const deleteTrip = useTripStore((s) => s.deleteTrip);
  const totalSpent = useTripStore((s) => s.getTotalSpent(trip.id));
  const days = differenceInDays(parseISO(trip.endDate), parseISO(trip.startDate)) + 1;

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`确定要删除「${trip.title}」吗？`)) {
      deleteTrip(trip.id);
    }
  };

  return (
    <Link
      to={`/trip/${trip.id}`}
      className="group block bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={trip.coverImage}
          alt={trip.destination}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
          <h3 className="text-white font-bold text-lg drop-shadow-md">{trip.title}</h3>
          <span className="text-white/90 text-xs bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full">
            {days}天
          </span>
        </div>
        <button
          onClick={handleDelete}
          className="absolute top-3 right-3 p-2 bg-black/30 backdrop-blur-sm rounded-full text-white/80 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all"
          title="删除旅行"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-2.5">
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <MapPin className="w-4 h-4 text-primary-400" />
          <span>{trip.destination}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <Calendar className="w-4 h-4 text-primary-400" />
          <span>
            {format(parseISO(trip.startDate), 'MM月dd日', { locale: zhCN })} &mdash;{' '}
            {format(parseISO(trip.endDate), 'MM月dd日', { locale: zhCN })}
          </span>
        </div>
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <Wallet className="w-4 h-4 text-primary-400" />
          <span>
            {trip.currency} {totalSpent.toLocaleString()} / {trip.budget.toLocaleString()}
          </span>
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden ml-1">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min((totalSpent / trip.budget) * 100, 100)}%`,
                backgroundColor: totalSpent > trip.budget ? '#ef4444' : '#3b82f6',
              }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
