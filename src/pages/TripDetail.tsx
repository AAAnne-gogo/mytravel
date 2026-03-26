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
      <div className="max-w-2xl mx-auto px-5 py-20 text-center">
        <p className="text-white/30 mb-4">找不到该旅行计划</p>
        <Link to="/" className="text-primary-400 hover:text-primary-300 text-sm transition-colors">
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
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-sm text-white/30 hover:text-white/60 transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        返回
      </button>

      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden mb-8 animate-slide-up">
        <img
          src={trip.coverImage}
          alt={trip.destination}
          className="w-full h-60 sm:h-72 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f1a] via-[#0f0f1a]/50 to-[#0f0f1a]/10" />
        <div className="absolute bottom-6 left-7 right-7">
          <h1 className="text-white text-3xl sm:text-4xl font-extrabold drop-shadow-lg mb-3 tracking-tight">
            {trip.title}
          </h1>
          <div className="flex flex-wrap gap-4 text-white/70 text-sm">
            <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              <MapPin className="w-3.5 h-3.5" />
              {trip.destination}
            </span>
            <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              <Calendar className="w-3.5 h-3.5" />
              {format(parseISO(trip.startDate), 'MM月dd日', { locale: zhCN })} &mdash;{' '}
              {format(parseISO(trip.endDate), 'MM月dd日', { locale: zhCN })}
              <span className="bg-primary-500/30 text-primary-200 px-2 py-0.5 rounded-full text-xs font-bold">
                {totalDays}天
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {trip.notes && (
        <div className="glass-card rounded-xl p-4 mb-8 flex gap-3 animate-slide-up stagger-1">
          <StickyNote className="w-5 h-5 text-warm-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-warm-200/70 leading-relaxed">{trip.notes}</p>
        </div>
      )}

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Day list */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-lg font-bold text-white/90 mb-5 flex items-center gap-2 animate-slide-up stagger-1">
            <span className="w-1.5 h-6 rounded-full bg-gradient-to-b from-primary-400 to-accent-400" />
            每日行程
          </h2>
          {trip.days.map((day, idx) => {
            const isExpanded = expandedDay === day.id;
            const daySpent = day.activities.reduce((s, a) => s + a.cost, 0);

            return (
              <div
                key={day.id}
                className={`glass-card rounded-2xl overflow-hidden transition-all duration-300 animate-slide-up stagger-${Math.min(idx + 2, 5)}`}
              >
                <button
                  onClick={() => toggleDay(day.id)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-500/5 flex items-center justify-center border border-primary-500/20">
                      <span className="text-primary-300 text-sm font-bold">{idx + 1}</span>
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-semibold text-white/85">
                        第{idx + 1}天
                      </span>
                      <span className="text-xs text-white/25 ml-2">
                        {format(parseISO(day.date), 'MM月dd日 EEEE', { locale: zhCN })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-white/25">
                      {day.activities.length > 0
                        ? `${day.activities.length} 项活动`
                        : '暂无活动'}
                      {daySpent > 0 && (
                        <span className="text-primary-300 ml-2 font-medium">
                          {trip.currency}{daySpent.toLocaleString()}
                        </span>
                      )}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-white/20" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-white/20" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 space-y-3 border-t border-white/5 animate-scale-in">
                    <div className="pt-4 space-y-2">
                      {day.activities.length === 0 && addingToDay !== day.id && (
                        <p className="text-sm text-white/15 text-center py-8">
                          还没有安排活动，点击下方按钮添加
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
                        className="w-full flex items-center justify-center gap-2 py-3 text-sm text-primary-400 hover:text-primary-300 hover:bg-primary-500/5 rounded-xl border border-dashed border-primary-500/20 hover:border-primary-500/40 transition-all"
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

        {/* Budget sidebar */}
        <div className="space-y-4 animate-slide-up stagger-2">
          <BudgetSummary trip={trip} totalSpent={totalSpent} />
        </div>
      </div>
    </div>
  );
}
