import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { eachDayOfInterval, format, parseISO } from 'date-fns';
import type { Trip, Activity, DayPlan } from '../types';

interface TripStore {
  trips: Trip[];
  addTrip: (trip: Omit<Trip, 'id' | 'days' | 'createdAt'>) => string;
  deleteTrip: (id: string) => void;
  updateTrip: (id: string, updates: Partial<Trip>) => void;
  addActivity: (tripId: string, dayId: string, activity: Omit<Activity, 'id'>) => void;
  updateActivity: (tripId: string, dayId: string, activityId: string, updates: Partial<Activity>) => void;
  deleteActivity: (tripId: string, dayId: string, activityId: string) => void;
  getTotalSpent: (tripId: string) => number;
}

function generateDayPlans(startDate: string, endDate: string): DayPlan[] {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  if (start > end) return [];
  const days = eachDayOfInterval({ start, end });
  return days.map((day) => ({
    id: uuidv4(),
    date: format(day, 'yyyy-MM-dd'),
    activities: [],
  }));
}

export const useTripStore = create<TripStore>()(
  persist(
    (set, get) => ({
      trips: [],

      addTrip: (tripData) => {
        const id = uuidv4();
        const newTrip: Trip = {
          ...tripData,
          id,
          days: generateDayPlans(tripData.startDate, tripData.endDate),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ trips: [newTrip, ...state.trips] }));
        return id;
      },

      deleteTrip: (id) => {
        set((state) => ({ trips: state.trips.filter((t) => t.id !== id) }));
      },

      updateTrip: (id, updates) => {
        set((state) => ({
          trips: state.trips.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }));
      },

      addActivity: (tripId, dayId, activity) => {
        set((state) => ({
          trips: state.trips.map((trip) => {
            if (trip.id !== tripId) return trip;
            return {
              ...trip,
              days: trip.days.map((day) => {
                if (day.id !== dayId) return day;
                return {
                  ...day,
                  activities: [...day.activities, { ...activity, id: uuidv4() }],
                };
              }),
            };
          }),
        }));
      },

      updateActivity: (tripId, dayId, activityId, updates) => {
        set((state) => ({
          trips: state.trips.map((trip) => {
            if (trip.id !== tripId) return trip;
            return {
              ...trip,
              days: trip.days.map((day) => {
                if (day.id !== dayId) return day;
                return {
                  ...day,
                  activities: day.activities.map((a) =>
                    a.id === activityId ? { ...a, ...updates } : a
                  ),
                };
              }),
            };
          }),
        }));
      },

      deleteActivity: (tripId, dayId, activityId) => {
        set((state) => ({
          trips: state.trips.map((trip) => {
            if (trip.id !== tripId) return trip;
            return {
              ...trip,
              days: trip.days.map((day) => {
                if (day.id !== dayId) return day;
                return {
                  ...day,
                  activities: day.activities.filter((a) => a.id !== activityId),
                };
              }),
            };
          }),
        }));
      },

      getTotalSpent: (tripId) => {
        const trip = get().trips.find((t) => t.id === tripId);
        if (!trip) return 0;
        return trip.days.reduce(
          (total, day) =>
            total + day.activities.reduce((dayTotal, act) => dayTotal + act.cost, 0),
          0
        );
      },
    }),
    { name: 'mytravel-storage' }
  )
);
