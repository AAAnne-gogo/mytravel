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
  const pct = trip.budget > 0 ? Math.min((totalSpent / trip.budget) * 100, 100) : 0;

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
      className="group block glass-card rounded-2xl overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary-500/10"
    >
      <div className="relative h-52 overflow-hidden">
        <img
          src={trip.coverImage}
          alt={trip.destination}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f1a] via-[#0f0f1a]/40 to-transparent" />

        <div className="absolute top-3 right-3 flex gap-2">
          <span className="text-xs font-bold text-white bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            {days}天
          </span>
          <button
            onClick={handleDelete}
            className="p-2 bg-black/30 backdrop-blur-md rounded-full text-white/60 opacity-0 group-hover:opacity-100 hover:bg-red-500/80 hover:text-white transition-all border border-white/10"
            title="删除旅行"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="absolute bottom-4 left-5 right-5">
          <h3 className="text-white font-bold text-xl drop-shadow-lg mb-1 tracking-tight">
            {trip.title}
          </h3>
          <div className="flex items-center gap-1.5 text-white/60 text-xs">
            <MapPin className="w-3 h-3" />
            {trip.destination}
          </div>
        </div>
      </div>

      <div className="p-5 space-y-3">
        <div className="flex items-center gap-2 text-white/40 text-sm">
          <Calendar className="w-4 h-4 text-primary-400" />
          <span>
            {format(parseISO(trip.startDate), 'MM月dd日', { locale: zhCN })} &mdash;{' '}
            {format(parseISO(trip.endDate), 'MM月dd日', { locale: zhCN })}
          </span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-white/40">
              <Wallet className="w-4 h-4 text-primary-400" />
              预算
            </span>
            <span className="text-white/70 font-medium">
              {trip.currency} {totalSpent.toLocaleString()} / {trip.budget.toLocaleString()}
            </span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: totalSpent > trip.budget
                  ? 'linear-gradient(90deg, #ef4444, #f87171)'
                  : 'linear-gradient(90deg, #6366f1, #8b5cf6)',
              }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
