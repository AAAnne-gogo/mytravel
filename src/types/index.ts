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

export const CATEGORY_CONFIG: Record<ActivityCategory, { label: string; color: string }> = {
  transport: { label: '交通', color: 'bg-blue-100 text-blue-700' },
  food: { label: '餐饮', color: 'bg-orange-100 text-orange-700' },
  accommodation: { label: '住宿', color: 'bg-purple-100 text-purple-700' },
  attraction: { label: '景点', color: 'bg-green-100 text-green-700' },
  shopping: { label: '购物', color: 'bg-pink-100 text-pink-700' },
  other: { label: '其他', color: 'bg-gray-100 text-gray-700' },
};
