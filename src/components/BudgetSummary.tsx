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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Wallet className="w-5 h-5 text-primary-500" />
        <h3 className="font-semibold text-gray-800">预算概览</h3>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">总预算</span>
          <span className="font-medium">{trip.currency} {trip.budget.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">已花费</span>
          <span className={`font-medium ${isOver ? 'text-red-500' : 'text-gray-800'}`}>
            {trip.currency} {totalSpent.toLocaleString()}
          </span>
        </div>
        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(percentage, 100)}%`,
              backgroundColor: isOver ? '#ef4444' : percentage > 80 ? '#f59e0b' : '#3b82f6',
            }}
          />
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">{percentage.toFixed(1)}%</span>
          <span className={`font-medium flex items-center gap-1 ${isOver ? 'text-red-500' : 'text-green-600'}`}>
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

      {Object.keys(categoryTotals).length > 0 && (
        <div className="pt-3 border-t border-gray-100 space-y-2">
          <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider">分类支出</h4>
          {Object.entries(categoryTotals)
            .sort(([, a], [, b]) => b - a)
            .map(([cat, amount]) => {
              const cfg = CATEGORY_CONFIG[cat as ActivityCategory];
              return (
                <div key={cat} className="flex items-center justify-between text-sm">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span>
                  <span className="text-gray-600 font-medium">
                    {trip.currency} {amount.toLocaleString()}
                  </span>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
