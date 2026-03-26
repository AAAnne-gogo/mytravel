import { Link, useLocation } from 'react-router-dom';
import { Compass, Plus } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Ambient background effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary-600/8 blur-[120px] animate-glow" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-accent-500/8 blur-[100px] animate-glow" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full bg-warm-500/5 blur-[80px] animate-glow" style={{ animationDelay: '3s' }} />
      </div>

      <header className="glass sticky top-0 z-50 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:shadow-primary-500/40 transition-all duration-300 group-hover:scale-105">
              <Compass className="w-5 h-5 text-white" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent" />
            </div>
            <span className="text-xl font-bold gradient-text tracking-tight">
              MyTravel
            </span>
          </Link>

          {isHome && (
            <Link
              to="/create"
              className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm rounded-xl"
            >
              <Plus className="w-4 h-4" />
              创建旅行
            </Link>
          )}
        </div>
      </header>

      <main className="flex-1 relative">{children}</main>

      <footer className="border-t border-white/5 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 text-center text-sm text-white/20">
          &copy; {new Date().getFullYear()} MyTravel &mdash; 你的个人旅行规划助手
        </div>
      </footer>
    </div>
  );
}
