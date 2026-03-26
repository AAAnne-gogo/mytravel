import { Link } from 'react-router-dom';
import { PlaneTakeoff, Map, Wallet, CalendarCheck, ArrowRight, Sparkles } from 'lucide-react';
import { useTripStore } from '../store/useTripStore';
import TripCard from '../components/TripCard';

export default function Home() {
  const trips = useTripStore((s) => s.trips);

  if (trips.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        {/* Hero */}
        <div className="relative flex flex-col items-center text-center pt-20 pb-16">
          <div className="relative mb-8 animate-slide-up">
            <div className="w-28 h-28 rounded-[2rem] bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center border border-white/10 animate-float">
              <span className="text-6xl">🌍</span>
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-xl bg-warm-400/20 flex items-center justify-center border border-warm-400/30 animate-float" style={{ animationDelay: '1s' }}>
              <span className="text-lg">✈️</span>
            </div>
            <div className="absolute -bottom-1 -left-3 w-7 h-7 rounded-lg bg-emerald-400/20 flex items-center justify-center border border-emerald-400/30 animate-float" style={{ animationDelay: '2s' }}>
              <span className="text-sm">📍</span>
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 animate-slide-up stagger-1">
            <span className="gradient-text">探索世界</span>
            <br />
            <span className="text-white/90">从规划开始</span>
          </h1>

          <p className="text-white/40 max-w-lg text-base leading-relaxed mb-10 animate-slide-up stagger-2">
            创建你的专属旅行计划，按天安排行程，实时追踪预算。
            <br className="hidden sm:block" />
            让每一次出发都充满期待，每一段旅程都井然有序。
          </p>

          <Link
            to="/create"
            className="btn-primary inline-flex items-center gap-2.5 px-8 py-3.5 text-base rounded-2xl animate-slide-up stagger-3"
          >
            <PlaneTakeoff className="w-5 h-5" />
            创建第一个旅行
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto pb-20">
          {[
            { icon: Map, title: '行程规划', desc: '按天安排活动，拖拽调整，时间线一目了然', gradient: 'from-primary-500 to-primary-400' },
            { icon: Wallet, title: '预算追踪', desc: '实时掌握每笔花费，分类汇总，超支预警', gradient: 'from-accent-500 to-accent-400' },
            { icon: CalendarCheck, title: '灵活管理', desc: '随时增删修改，所有数据安全保存在本地', gradient: 'from-warm-500 to-warm-400' },
          ].map((feature, i) => (
            <div
              key={feature.title}
              className={`glass-card rounded-2xl p-6 text-center group hover:scale-[1.02] transition-all duration-300 animate-slide-up stagger-${i + 3}`}
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-white/90 mb-2">{feature.title}</h3>
              <p className="text-sm text-white/30 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10">
      <div className="flex items-center justify-between mb-10 animate-slide-up">
        <div>
          <h1 className="text-3xl font-extrabold text-white/95 flex items-center gap-3">
            <Sparkles className="w-7 h-7 text-warm-400" />
            我的旅行
          </h1>
          <p className="text-sm text-white/30 mt-2">
            共 {trips.length} 个旅行计划 &middot; 点击查看详情
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {trips.map((trip, i) => (
          <div key={trip.id} className={`animate-slide-up stagger-${Math.min(i + 1, 5)}`}>
            <TripCard trip={trip} />
          </div>
        ))}
      </div>
    </div>
  );
}
