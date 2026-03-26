export interface Activity {
  id: string;
  time: string;
  title: string;
  location: string;
  notes: string;
  cost: number;
  category: ActivityCategory;
}

export type ActivityCategory =
  | 'transport'
  | 'food'
  | 'accommodation'
  | 'attraction'
  | 'shopping'
  | 'other';

export interface DayPlan {
  id: string;
  date: string;
  activities: Activity[];
}

export interface Trip {
  id: string;
  title: string;
  destination: string;
  coverImage: string;
  startDate: string;
  endDate: string;
  budget: number;
  currency: string;
  notes: string;
  days: DayPlan[];
  createdAt: string;
}

export const COVER_IMAGES = [
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80',
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80',
  'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=800&q=80',
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80',
  'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80',
  'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&q=80',
];

export const CATEGORY_CONFIG: Record<ActivityCategory, { label: string; icon: string; gradient: string; bg: string }> = {
  transport: { label: '交通', icon: '🚄', gradient: 'from-blue-500 to-cyan-400', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  food: { label: '餐饮', icon: '🍜', gradient: 'from-orange-500 to-amber-400', bg: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  accommodation: { label: '住宿', icon: '🏨', gradient: 'from-purple-500 to-violet-400', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  attraction: { label: '景点', icon: '🏛️', gradient: 'from-emerald-500 to-teal-400', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  shopping: { label: '购物', icon: '🛍️', gradient: 'from-pink-500 to-rose-400', bg: 'bg-pink-500/10 text-pink-400 border-pink-500/20' },
  other: { label: '其他', icon: '📌', gradient: 'from-slate-500 to-gray-400', bg: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
};
