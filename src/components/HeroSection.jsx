import { motion } from 'framer-motion';
import { ChevronDown, Zap, Users, Server, Activity, Terminal } from 'lucide-react';

const floatingIcons = [
  { icon: '🍕', x: '10%', y: '20%', delay: 0, duration: 5 },
  { icon: '🍔', x: '85%', y: '15%', delay: 1, duration: 6 },
  { icon: '🌮', x: '75%', y: '70%', delay: 0.5, duration: 4.5 },
  { icon: '🍜', x: '15%', y: '75%', delay: 1.5, duration: 5.5 },
  { icon: '🍣', x: '50%', y: '85%', delay: 2, duration: 7 },
  { icon: '☕', x: '90%', y: '50%', delay: 0.8, duration: 5 },
  { icon: '🥗', x: '30%', y: '10%', delay: 1.2, duration: 6 },
];

export default function HeroSection({ scaling }) {
  const {
    traffic = 20,
    pods = 2,
    cpu = 15,
    rps = 50,
    logs = [],
    clusterStatus = 'Healthy',
  } = scaling || {};

  // Status styling
  const statusColors = {
    Healthy: 'status-healthy',
    Degraded: 'status-degraded',
    Overloaded: 'status-overloaded',
    'Node Down': 'status-node-down',
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Animated grid */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
      </div>

      {/* Floating food emojis */}
      {floatingIcons.map((item, i) => (
        <motion.div
          key={i}
          className="absolute text-3xl md:text-4xl opacity-20 pointer-events-none select-none"
          style={{ left: item.x, top: item.y }}
          animate={{
            y: [0, -30, 0],
            rotate: [0, 10, -10, 0],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{
            duration: item.duration,
            repeat: Infinity,
            delay: item.delay,
            ease: 'easeInOut',
          }}
        >
          {item.icon}
        </motion.div>
      ))}

      {/* Gradient orbs */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full bg-primary-600/20 blur-[100px]"
        style={{ top: '10%', left: '20%' }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full bg-accent-500/15 blur-[80px]"
        style={{ bottom: '10%', right: '15%' }}
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto w-full flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-300 text-sm font-medium mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Zap size={14} className="text-accent-400" />
            DevOps Case Study · Kubernetes Auto-Scaling
          </motion.div>
        </motion.div>

        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-6"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="block">Scaling the</span>
          <span className="gradient-text">Lunch Rush</span>
          <span className="inline-block ml-3 text-5xl md:text-6xl">🍔🚀</span>
        </motion.h1>

        <motion.p
          className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          A food delivery app crashes every day at noon. Thousands of orders lost, customers frustrated.
          Watch how <span className="text-primary-400 font-semibold">Kubernetes auto-scaling</span> transforms chaos into reliability.
        </motion.p>

        {/* Live System Status Dashboard (Replacing static buttons and stats) */}
        <motion.div
          className="w-full max-w-3xl glass-card-strong p-6 md:p-8 mb-8 text-left border border-white/15 shadow-2xl relative overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-white/15 pb-4">
            <div className="flex items-center gap-2">
              <Activity className="text-primary-400 animate-pulse" size={20} />
              <h3 className="font-bold text-white tracking-wide">Simulation Cluster Overview</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-mono">Status:</span>
              <span className={`status-badge ${statusColors[clusterStatus] || 'status-healthy'}`}>
                {clusterStatus}
              </span>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
              <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">Traffic Load</div>
              <div className="text-2xl font-black text-accent-400 font-mono">{traffic}%</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
              <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">Req / Sec</div>
              <div className="text-2xl font-black text-primary-300 font-mono">{rps}</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
              <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">Avg Pod CPU</div>
              <div className="text-2xl font-black text-red-400 font-mono">{cpu}%</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
              <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">Active Pods</div>
              <div className="text-2xl font-black text-green-400 font-mono">{pods}</div>
            </div>
          </div>

          {/* Scrollable Event Logs Terminal */}
          <div className="bg-black/60 rounded-xl p-4 border border-white/10 font-mono text-[11px] leading-relaxed">
            <div className="flex items-center gap-2 text-gray-400 mb-2 pb-1 border-b border-white/5">
              <Terminal size={12} />
              <span>Event Stream</span>
            </div>
            <div className="h-16 overflow-y-auto space-y-1 scrollbar-thin">
              {logs.slice(0, 3).map((log, i) => (
                <div key={i} className="text-gray-300 truncate">
                  <span className="text-primary-500 mr-1.5">&gt;</span>
                  {log}
                </div>
              ))}
              {logs.length === 0 && (
                <div className="text-gray-500">Initializing simulation cluster logs...</div>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <motion.a
            href="#simulation"
            className="group relative px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/25"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            id="try-simulation-btn"
          >
            <span className="relative z-10 flex items-center gap-2">
              🎮 Try Interactive Simulator
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.a>

          <motion.a
            href="#problem"
            className="px-8 py-4 glass-card text-white font-semibold hover:bg-white/10 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            id="explore-solution-btn"
          >
            Explore Case Study
          </motion.a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ChevronDown size={24} className="text-gray-500" />
      </motion.div>
    </section>
  );
}
