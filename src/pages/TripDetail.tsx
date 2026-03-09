import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format, parseISO, differenceInDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Plus,
  ChevronDown,
  ChevronUp,
  StickyNote,
} from 'lucide-react';
import { useTripStore } from '../store/useTripStore';
import ActivityForm from '../components/ActivityForm';
import ActivityItem from '../components/ActivityItem';
import BudgetSummary from '../components/BudgetSummary';

export default function TripDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const trip = useTripStore((s) => s.trips.find((t) => t.id === id));
  const addActivity = useTripStore((s) => s.addActivity);
  const deleteActivity = useTripStore((s) => s.deleteActivity);
  const totalSpent = useTripStore((s) => s.getTotalSpent(id ?? ''));

  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [addingToDay, setAddingToDay] = useState<string | null>(null);

  if (!trip) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-400 mb-4">找不到该旅行计划</p>
        <Link to="/" className="text-primary-500 hover:underline text-sm">
          返回首页
        </Link>
      </div>
    );
  }

  const totalDays = differenceInDays(parseISO(trip.endDate), parseISO(trip.startDate)) + 1;

  const toggleDay = (dayId: string) => {
    setExpandedDay(expandedDay === dayId ? null : dayId);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        返回
      </button>

      <div className="relative rounded-2xl overflow-hidden mb-8 shadow-md">
        <img
          src={trip.coverImage}
          alt={trip.destination}
          className="w-full h-56 sm:h-64 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-5 left-6 right-6">
          <h1 className="text-white text-2xl sm:text-3xl font-bold drop-shadow-lg mb-2">
            {trip.title}
          </h1>
          <div className="flex flex-wrap gap-4 text-white/90 text-sm">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {trip.destination}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {format(parseISO(trip.startDate), 'yyyy年MM月dd日', { locale: zhCN })} &mdash;{' '}
              {format(parseISO(trip.endDate), 'MM月dd日', { locale: zhCN })}
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs ml-1">
                {totalDays}天
              </span>
            </span>
          </div>
        </div>
      </div>

      {trip.notes && (
        <div className="bg-warm-50 border border-warm-200 rounded-xl p-4 mb-6 flex gap-3">
          <StickyNote className="w-5 h-5 text-warm-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-warm-700 leading-relaxed">{trip.notes}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-lg font-bold text-gray-800 mb-4">每日行程</h2>
          {trip.days.map((day, idx) => {
            const isExpanded = expandedDay === day.id;
            const daySpent = day.activities.reduce((s, a) => s + a.cost, 0);

            return (
              <div
                key={day.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => toggleDay(day.id)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary-700 text-sm font-bold">
                      {idx + 1}
                    </span>
                    <div className="text-left">
                      <span className="text-sm font-semibold text-gray-800">
                        第{idx + 1}天
                      </span>
                      <span className="text-xs text-gray-400 ml-2">
                        {format(parseISO(day.date), 'MM月dd日 EEEE', { locale: zhCN })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">
                      {day.activities.length} 项活动
                      {daySpent > 0 && ` · ${trip.currency} ${daySpent.toLocaleString()}`}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-4 space-y-3 border-t border-gray-50">
                    <div className="pt-3 space-y-2">
                      {day.activities.length === 0 && addingToDay !== day.id && (
                        <p className="text-sm text-gray-300 text-center py-4">
                          还没有安排活动
                        </p>
                      )}
                      {day.activities
                        .slice()
                        .sort((a, b) => a.time.localeCompare(b.time))
                        .map((activity) => (
                          <ActivityItem
                            key={activity.id}
                            activity={activity}
                            currency={trip.currency}
                            onDelete={() => deleteActivity(trip.id, day.id, activity.id)}
                          />
                        ))}
                    </div>

                    {addingToDay === day.id ? (
                      <ActivityForm
                        onSubmit={(act) => {
                          addActivity(trip.id, day.id, act);
                          setAddingToDay(null);
                        }}
                        onCancel={() => setAddingToDay(null)}
                      />
                    ) : (
                      <button
                        onClick={() => setAddingToDay(day.id)}
                        className="w-full flex items-center justify-center gap-1.5 py-2.5 text-sm text-primary-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg border border-dashed border-primary-200 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        添加活动
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="space-y-4">
          <BudgetSummary trip={trip} totalSpent={totalSpent} />
        </div>
      </div>
    </div>
  );
}
