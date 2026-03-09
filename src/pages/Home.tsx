import { Link } from 'react-router-dom';
import { PlaneTakeoff, Globe, Sparkles } from 'lucide-react';
import { useTripStore } from '../store/useTripStore';
import TripCard from '../components/TripCard';

export default function Home() {
  const trips = useTripStore((s) => s.trips);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {trips.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center mb-6">
            <Globe className="w-12 h-12 text-primary-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-3">开始规划你的旅行</h1>
          <p className="text-gray-400 max-w-md mb-8 leading-relaxed">
            创建你的第一个旅行计划，添加目的地、行程安排和预算追踪，让每一次出发都井然有序。
          </p>
          <Link
            to="/create"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-medium rounded-2xl shadow-lg hover:shadow-xl hover:from-primary-600 hover:to-accent-600 transition-all active:scale-[0.97]"
          >
            <PlaneTakeoff className="w-5 h-5" />
            创建第一个旅行
          </Link>
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl">
            {[
              { icon: '🗺️', title: '行程规划', desc: '按天安排你的旅行活动' },
              { icon: '💰', title: '预算追踪', desc: '实时掌握旅行花费' },
              { icon: '📝', title: '灵活管理', desc: '随时调整你的计划' },
            ].map((feature) => (
              <div key={feature.title} className="text-center p-4">
                <div className="text-3xl mb-2">{feature.icon}</div>
                <h3 className="font-semibold text-gray-700 text-sm">{feature.title}</h3>
                <p className="text-xs text-gray-400 mt-1">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-warm-400" />
                我的旅行
              </h1>
              <p className="text-sm text-gray-400 mt-1">共 {trips.length} 个旅行计划</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
