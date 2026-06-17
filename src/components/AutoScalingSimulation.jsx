import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Gauge, Play, Pause, Box, ToggleLeft, ToggleRight, Zap, AlertTriangle, Terminal } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

function MiniPod({ index }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
      className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-green-500/20 border border-green-500/40 flex items-center justify-center pod-pulse"
    >
      <Box size={14} className="text-green-400" />
    </motion.div>
  );
}

function CpuGauge({ value }) {
  const color = value > 70 ? '#ef4444' : value > 40 ? '#f59e0b' : '#22c55e';
  const radius = 50;
  const circumference = Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative w-32 h-20 mx-auto">
      <svg viewBox="0 0 120 70" className="w-full h-full">
        <path
          d="M 10 65 A 50 50 0 0 1 110 65"
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <motion.path
          d="M 10 65 A 50 50 0 0 1 110 65"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5 }}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
        <span className="text-2xl font-bold" style={{ color }}>{value}%</span>
        <span className="text-[10px] text-gray-500">CPU</span>
      </div>
    </div>
  );
}

export default function AutoScalingSimulation({ scaling, darkMode }) {
  const {
    traffic, setTraffic, pods, cpu, rps,
    isRunning, setIsRunning, k8sEnabled, setK8sEnabled,
    logs, history, crashCount, MIN_PODS, MAX_PODS,
  } = scaling;

  return (
    <section id="simulation" className="relative py-24 md:py-32">
      <div className="section-container">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-400 text-sm font-medium mb-6">
              <Zap size={14} />
              Interactive Demo
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Auto-Scaling <span className="gradient-text-warm">Simulation</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Control the traffic slider and watch Kubernetes scale pods in real-time.
              Toggle K8s off to see the system crash.
            </p>
          </motion.div>

          {/* Controls */}
          <motion.div variants={itemVariants} className="glass-card-strong p-6 md:p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
              {/* Traffic slider */}
              <div className="flex-1 w-full">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-300">
                    🍔 Lunch Traffic Level
                  </label>
                  <span className="text-sm font-mono text-accent-400">{traffic}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={traffic}
                  onChange={(e) => setTraffic(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #22c55e ${traffic * 0.3}%, #f59e0b ${traffic * 0.6}%, #ef4444 ${traffic}%, rgba(255,255,255,0.1) ${traffic}%)`,
                  }}
                  id="traffic-slider"
                />
                <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                  <span>Quiet Morning</span>
                  <span>Lunch Rush! 🔥</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all ${
                    isRunning
                      ? 'bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20'
                      : 'bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20'
                  }`}
                  id="play-pause-btn"
                >
                  {isRunning ? <Pause size={16} /> : <Play size={16} />}
                  {isRunning ? 'Pause' : 'Start'}
                </button>

                <button
                  onClick={() => setK8sEnabled(!k8sEnabled)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all ${
                    k8sEnabled
                      ? 'bg-primary-500/10 border border-primary-500/30 text-primary-400 hover:bg-primary-500/20'
                      : 'bg-gray-500/10 border border-gray-500/30 text-gray-400 hover:bg-gray-500/20'
                  }`}
                  id="k8s-toggle-btn"
                >
                  {k8sEnabled ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                  K8s: {k8sEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Metrics + Pods Grid */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Live Metrics */}
            <motion.div variants={itemVariants} className="glass-card p-6">
              <h3 className="text-sm font-semibold text-gray-400 mb-4 flex items-center gap-2">
                <Gauge size={16} /> Live Metrics
              </h3>
              <CpuGauge value={cpu} />
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-primary-400">{pods}</div>
                  <div className="text-[10px] text-gray-500">Active Pods</div>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-accent-400">{rps}</div>
                  <div className="text-[10px] text-gray-500">Req/sec</div>
                </div>
              </div>
              {!k8sEnabled && cpu > 80 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-3 flex items-center gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20"
                >
                  <AlertTriangle size={14} className="text-red-400" />
                  <span className="text-xs text-red-400">System overloaded! Crashes: {crashCount}</span>
                </motion.div>
              )}
            </motion.div>

            {/* Pod Visualization */}
            <motion.div variants={itemVariants} className="lg:col-span-2 glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-400 flex items-center gap-2">
                  <Box size={16} /> Pod Cluster
                </h3>
                <span className="text-xs font-mono text-gray-600">
                  {pods}/{MAX_PODS} pods ({Math.round((pods / MAX_PODS) * 100)}% capacity)
                </span>
              </div>

              {/* Pod capacity bar */}
              <div className="h-2 bg-white/5 rounded-full mb-6 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                  animate={{ width: `${(pods / MAX_PODS) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              {/* Pods */}
              <div className="bg-white/[0.02] rounded-xl p-4 min-h-[120px] flex flex-wrap gap-2 items-center justify-center border border-white/5">
                <AnimatePresence>
                  {Array.from({ length: pods }).map((_, i) => (
                    <MiniPod key={`sim-pod-${i}`} index={i} />
                  ))}
                </AnimatePresence>
              </div>

              {/* Scale rules */}
              <div className="flex flex-wrap gap-4 mt-4 text-[11px]">
                <div className="flex items-center gap-2 text-yellow-400">
                  <span className="w-2 h-2 rounded-full bg-yellow-400" />
                  CPU &gt; 70% → Scale Up
                </div>
                <div className="flex items-center gap-2 text-green-400">
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                  CPU &lt; 30% → Scale Down
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <span className="w-2 h-2 rounded-full bg-gray-500" />
                  Min: {MIN_PODS} | Max: {MAX_PODS}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Chart + Logs */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* History chart */}
            <motion.div variants={itemVariants} className="glass-card p-6">
              <h3 className="text-sm font-semibold text-gray-400 mb-4">📊 Real-Time Metrics</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={history.slice(-20)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="time" stroke="#475569" fontSize={10} />
                  <YAxis stroke="#475569" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '10px',
                      fontSize: '12px',
                    }}
                  />
                  <Line type="monotone" dataKey="cpu" stroke="#f87171" strokeWidth={2} dot={false} name="CPU %" />
                  <Line type="monotone" dataKey="pods" stroke="#22c55e" strokeWidth={2} dot={false} name="Pods" />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Logs */}
            <motion.div variants={itemVariants} className="glass-card p-6">
              <h3 className="text-sm font-semibold text-gray-400 mb-4 flex items-center gap-2">
                <Terminal size={14} /> K8s Event Logs
              </h3>
              <div className="bg-black/40 rounded-xl p-4 h-[220px] overflow-y-auto font-mono text-[11px] leading-relaxed space-y-1 scrollbar-thin">
                <AnimatePresence>
                  {logs.slice(0, 20).map((log, i) => (
                    <motion.div
                      key={`log-${i}-${log.slice(0, 20)}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`${
                        log.includes('CRITICAL') || log.includes('ERROR') || log.includes('💀')
                          ? 'text-red-400'
                          : log.includes('⚡') || log.includes('🚀')
                          ? 'text-yellow-400'
                          : log.includes('📉') || log.includes('🔽')
                          ? 'text-blue-400'
                          : 'text-gray-500'
                      }`}
                    >
                      {log}
                    </motion.div>
                  ))}
                </AnimatePresence>
                {logs.length === 0 && (
                  <div className="text-gray-600 text-center pt-8">
                    Waiting for events...
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
