import { Wallet, TrendingUp, AlertTriangle } from 'lucide-react';
import type { Trip } from '../types';
import { CATEGORY_CONFIG, type ActivityCategory } from '../types';

interface Props {
  trip: Trip;
  totalSpent: number;
}

export default function BudgetSummary({ trip, totalSpent }: Props) {
  const remaining = trip.budget - totalSpent;
  const percentage = trip.budget > 0 ? (totalSpent / trip.budget) * 100 : 0;
  const isOver = totalSpent > trip.budget;

  const categoryTotals = trip.days.reduce<Record<string, number>>((acc, day) => {
    day.activities.forEach((act) => {
      acc[act.category] = (acc[act.category] || 0) + act.cost;
    });
    return acc;
  }, {});

  return (
    <div className="glass-card rounded-2xl p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center border border-white/10">
          <Wallet className="w-5 h-5 text-primary-400" />
        </div>
        <div>
          <h3 className="font-bold text-white/90">预算概览</h3>
          <p className="text-xs text-white/30">实时追踪旅行花费</p>
        </div>
      </div>

      {/* Main budget display */}
      <div className="relative">
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-xs text-white/30 mb-1">已花费</p>
            <p className={`text-2xl font-bold ${isOver ? 'text-red-400' : 'text-white/95'}`}>
              {trip.currency} {totalSpent.toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/30 mb-1">总预算</p>
            <p className="text-lg font-semibold text-white/50">
              {trip.currency} {trip.budget.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="h-3 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 relative"
            style={{
              width: `${Math.min(percentage, 100)}%`,
              background: isOver
                ? 'linear-gradient(90deg, #ef4444, #f87171)'
                : percentage > 80
                  ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                  : 'linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa)',
            }}
          >
            <div className="absolute inset-0 animate-shimmer rounded-full" />
          </div>
        </div>

        <div className="flex justify-between mt-2">
          <span className="text-xs text-white/20">{percentage.toFixed(1)}%</span>
          <span className={`text-xs font-semibold flex items-center gap-1 ${isOver ? 'text-red-400' : 'text-emerald-400'}`}>
            {isOver ? (
              <>
                <AlertTriangle className="w-3 h-3" />
                超出 {trip.currency} {Math.abs(remaining).toLocaleString()}
              </>
            ) : (
              <>
                <TrendingUp className="w-3 h-3" />
                剩余 {trip.currency} {remaining.toLocaleString()}
              </>
            )}
          </span>
        </div>
      </div>

      {/* Category breakdown */}
      {Object.keys(categoryTotals).length > 0 && (
        <div className="pt-4 border-t border-white/5 space-y-3">
          <h4 className="text-xs font-medium text-white/30 uppercase tracking-wider">分类支出</h4>
          {Object.entries(categoryTotals)
            .sort(([, a], [, b]) => b - a)
            .map(([cat, amount]) => {
              const cfg = CATEGORY_CONFIG[cat as ActivityCategory];
              const catPct = trip.budget > 0 ? (amount / trip.budget) * 100 : 0;
              return (
                <div key={cat} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full border ${cfg.bg}`}>
                      {cfg.icon} {cfg.label}
                    </span>
                    <span className="text-white/60 font-medium">
                      {trip.currency} {amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${cfg.gradient} transition-all duration-500`}
                      style={{ width: `${Math.min(catPct, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
