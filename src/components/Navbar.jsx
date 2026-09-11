import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Menu, X, BarChart3, BookOpen } from 'lucide-react';

export default function Navbar({ darkMode, setDarkMode, liveInfra, activeView, setActiveView }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const hasLive = Boolean(liveInfra?.summary);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-surface-950/80 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20'
          : 'bg-surface-950/50 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Brand */}
          <motion.a
            href="#"
            className="flex items-center gap-2 text-lg font-bold"
            whileHover={{ scale: 1.03 }}
            onClick={(e) => { e.preventDefault(); setActiveView('live'); }}
          >
            <span className="text-xl">🍔</span>
            <span className="gradient-text">LunchRush</span>
          </motion.a>

          {/* Desktop: View tabs + K8s badge + theme */}
          <div className="hidden md:flex items-center gap-2">
            {/* View switcher */}
            <button
              onClick={() => setActiveView('live')}
              className={`view-tab ${activeView === 'live' ? 'view-tab-active' : 'view-tab-inactive'}`}
              id="nav-live-ops-btn"
              aria-label="Switch to live cluster ops view"
            >
              <BarChart3 size={14} />
              Live Cluster Ops
            </button>
            <button
              onClick={() => setActiveView('casestudy')}
              className={`view-tab ${activeView === 'casestudy' ? 'view-tab-active' : 'view-tab-inactive'}`}
              id="nav-case-study-btn"
              aria-label="Switch to case study view"
            >
              <BookOpen size={14} />
              Case Study
            </button>

            {/* Divider */}
            <div className="w-px h-5 bg-white/10 mx-1" />

            {/* K8s Live badge */}
            {hasLive ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-mono font-semibold">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                </span>
                <span>K8s Live</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-500/10 border border-gray-500/20 text-gray-500 text-[10px] font-mono font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                <span>K8s Offline</span>
              </div>
            )}

            {/* Theme toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="ml-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200"
              aria-label="Toggle theme"
              id="theme-toggle"
            >
              {darkMode ? <Sun size={16} className="text-accent-400" /> : <Moon size={16} className="text-primary-400" />}
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition"
            id="mobile-menu-toggle"
            aria-label="Toggle mobile menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-surface-950/95 backdrop-blur-xl border-b border-white/10"
        >
          <div className="px-4 py-4 space-y-1">
            <button
              onClick={() => { setActiveView('live'); setMobileOpen(false); }}
              className={`flex items-center gap-2 w-full px-4 py-3 text-sm font-medium rounded-lg transition ${
                activeView === 'live' ? 'text-primary-400 bg-primary-500/10' : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <BarChart3 size={16} />
              Live Cluster Ops
            </button>
            <button
              onClick={() => { setActiveView('casestudy'); setMobileOpen(false); }}
              className={`flex items-center gap-2 w-full px-4 py-3 text-sm font-medium rounded-lg transition ${
                activeView === 'casestudy' ? 'text-primary-400 bg-primary-500/10' : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <BookOpen size={16} />
              Case Study & Architecture
            </button>
            <div className="flex items-center justify-between px-4 py-3">
              {hasLive ? (
                <div className="flex items-center gap-1.5 text-green-400 text-xs font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  K8s Live
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-gray-500 text-xs font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                  K8s Offline
                </div>
              )}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-300 hover:text-white rounded-lg hover:bg-white/5 transition"
              >
                {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                {darkMode ? 'Light' : 'Dark'}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
