import { Link, useLocation } from 'react-router-dom';
import { Compass, PlaneTakeoff } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              MyTravel
            </span>
          </Link>

          {isHome && (
            <Link
              to="/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-medium rounded-xl shadow-md hover:shadow-lg hover:from-primary-600 hover:to-primary-700 transition-all active:scale-[0.97]"
            >
              <PlaneTakeoff className="w-4 h-4" />
              创建旅行
            </Link>
          )}
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-white/60 backdrop-blur-sm border-t border-gray-200/40 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} MyTravel &mdash; 你的个人旅行规划助手
        </div>
      </footer>
    </div>
  );
}
