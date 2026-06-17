import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Gauge, Play, Pause, ToggleLeft, ToggleRight, Zap, AlertTriangle, Terminal, Trash2, RefreshCw, Activity, WifiOff } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

function CpuGauge({ value }) {
  const color = value > 75 ? '#ef4444' : value > 40 ? '#fb8c00' : '#22c55e';
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
          style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
        <span className="text-2xl font-bold font-mono" style={{ color }}>{value}%</span>
        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Average CPU</span>
      </div>
    </div>
  );
}

function DetailPodCard({ pod, onKill }) {
  const { id, name, status, cpu, memory, node, leak } = pod;

  // Status mapping
  const statusClasses = {
    Healthy: 'status-healthy',
    Pending: 'status-pending',
    Terminating: 'status-terminating',
    Failed: 'status-failed',
  };

  const borderClass = {
    Healthy: 'pod-card-healthy',
    Pending: 'pod-card-pending',
    Terminating: 'pod-card-terminating',
    Failed: 'pod-card-failed',
  };

  const isHealthy = status === 'Healthy';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`pod-card ${borderClass[status] || ''} flex flex-col justify-between`}
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex flex-col truncate">
            <span className="font-bold text-white text-xs truncate">{name}</span>
            <span className="text-[9px] text-gray-500 font-mono truncate">{node}</span>
          </div>
          <span className={`status-badge ${statusClasses[status] || ''}`}>
            {status}
          </span>
        </div>

        {/* Pod resource usages */}
        <div className="space-y-1.5 mt-2">
          {/* CPU Usage */}
          <div>
            <div className="flex justify-between text-[8px] mb-0.5 text-gray-400 font-mono">
              <span>CPU</span>
              <span>{isHealthy ? `${cpu}%` : '0%'}</span>
            </div>
            <div className="resource-bar">
              <div
                className="resource-bar-fill bg-primary-500"
                style={{ width: `${isHealthy ? cpu : 0}%` }}
              />
            </div>
          </div>

          {/* Memory Usage */}
          <div>
            <div className="flex justify-between text-[8px] mb-0.5 text-gray-400 font-mono">
              <span>Memory {leak && '⚠️'}</span>
              <span>{isHealthy ? `${memory}%` : '0%'}</span>
            </div>
            <div className="resource-bar">
              <div
                className={`resource-bar-fill ${leak ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`}
                style={{ width: `${isHealthy ? memory : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Manual Kill Pod Button */}
      {isHealthy && (
        <div className="flex justify-end mt-3 pt-2 border-t border-white/5">
          <button
            onClick={() => onKill(id)}
            className="text-gray-500 hover:text-red-400 transition-colors p-1 rounded hover:bg-white/5"
            title="Inject Pod Fault"
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}
    </motion.div>
  );
}

export default function AutoScalingSimulation({ scaling, darkMode }) {
  const {
    traffic, setTraffic, pods, podsList = [], cpu, rps,
    isRunning, setIsRunning, k8sEnabled, setK8sEnabled,
    logs = [], history = [], crashCount, nodeStatuses = {},
    clusterStatus, networkFailure,
    killPod, killRandomPod, killNode, recoverNode,
    simulateMemoryLeak, simulateNetworkFailure,
    MIN_PODS, MAX_PODS,
  } = scaling || {};

  const activePods = podsList.filter(p => p.status === 'Healthy' || p.status === 'Pending');

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
              Interactive Simulation
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Auto-Scaling <span className="gradient-text-warm">Simulator</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Simulate peak noon-hour traffic spikes, introduce targeted chaos tests, and compare performance results live.
            </p>
          </motion.div>

          {/* Master Controller & Dashboard */}
          <motion.div variants={itemVariants} className="glass-card-strong p-6 md:p-8 mb-8 border border-white/10 shadow-xl">
            <div className="flex flex-col lg:flex-row items-stretch gap-6">
              {/* Traffic control */}
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    🍔 Simulation Traffic Level
                  </label>
                  <span className="text-sm font-mono font-bold text-accent-400">{traffic}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={traffic}
                  onChange={(e) => setTraffic(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/5"
                  style={{
                    background: `linear-gradient(to right, #22c55e ${traffic * 0.3}%, #f59e0b ${traffic * 0.6}%, #ef4444 ${traffic}%, rgba(255,255,255,0.05) ${traffic}%)`,
                  }}
                  id="traffic-slider"
                />
                <div className="flex justify-between text-[10px] text-gray-500 mt-2 font-mono">
                  <span>Quiet Morning (5%)</span>
                  <span>Lunch Peak Rush (100%) 🔥</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-3 justify-start lg:justify-end">
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                    isRunning
                      ? 'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20'
                      : 'bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20'
                  }`}
                  id="play-pause-btn"
                >
                  {isRunning ? <Pause size={14} /> : <Play size={14} />}
                  {isRunning ? 'Pause Sim' : 'Resume Sim'}
                </button>

                <button
                  onClick={() => setK8sEnabled(!k8sEnabled)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                    k8sEnabled
                      ? 'bg-primary-500/10 border border-primary-500/20 text-primary-400 hover:bg-primary-500/20'
                      : 'bg-gray-500/10 border border-gray-500/20 text-gray-400 hover:bg-gray-500/20'
                  }`}
                  id="k8s-toggle-btn"
                >
                  {k8sEnabled ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                  K8s Services: {k8sEnabled ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Two-Column Simulation Zone */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Left: Metrics & Chaos Panel */}
            <div className="space-y-6">
              {/* Live Status Summary */}
              <motion.div variants={itemVariants} className="glass-card p-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
                  <Activity size={14} className="text-primary-400" /> System Metrics
                </h3>
                <CpuGauge value={cpu} />
                <div className="grid grid-cols-2 gap-3 mt-5">
                  <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                    <div className="text-2xl font-black text-primary-400 font-mono">{pods}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Active Pods</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                    <div className="text-2xl font-black text-accent-400 font-mono">{rps}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Requests/s</div>
                  </div>
                </div>

                {!k8sEnabled && cpu > 80 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20"
                  >
                    <AlertTriangle size={14} className="text-red-400" />
                    <span className="text-xs text-red-400 font-medium">Overload Failures: {crashCount}</span>
                  </motion.div>
                )}
              </motion.div>

              {/* Chaos Engineering Panel */}
              <motion.div variants={itemVariants} className="glass-card p-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
                  <WifiOff size={14} className="text-accent-400" /> Chaos Engineering
                </h3>
                <p className="text-gray-500 text-[11px] leading-relaxed mb-4">
                  Inject failure vectors to test Kubernetes resiliency features (HPA, node failovers, self-healing pod lifecycles).
                </p>

                <div className="space-y-3">
                  {/* Pod failures */}
                  <button
                    disabled={!k8sEnabled || activePods.length === 0}
                    onClick={killRandomPod}
                    className="chaos-btn chaos-btn-danger w-full"
                  >
                    💥 Kill Random Pod
                  </button>

                  {/* Node 1 failures */}
                  <div className="flex gap-2">
                    {nodeStatuses['Worker Node 1'] === 'Active' ? (
                      <button
                        disabled={!k8sEnabled}
                        onClick={() => killNode('Worker Node 1')}
                        className="chaos-btn chaos-btn-warning flex-1"
                      >
                        ⚠️ Down Node 1
                      </button>
                    ) : (
                      <button
                        disabled={!k8sEnabled}
                        onClick={() => recoverNode('Worker Node 1')}
                        className="chaos-btn chaos-btn-success flex-1"
                      >
                        <RefreshCw size={12} className="animate-spin-slow" /> Recover Node 1
                      </button>
                    )}

                    {/* Node 2 failures */}
                    {nodeStatuses['Worker Node 2'] === 'Active' ? (
                      <button
                        disabled={!k8sEnabled}
                        onClick={() => killNode('Worker Node 2')}
                        className="chaos-btn chaos-btn-warning flex-1"
                      >
                        ⚠️ Down Node 2
                      </button>
                    ) : (
                      <button
                        disabled={!k8sEnabled}
                        onClick={() => recoverNode('Worker Node 2')}
                        className="chaos-btn chaos-btn-success flex-1"
                      >
                        <RefreshCw size={12} className="animate-spin-slow" /> Recover Node 2
                      </button>
                    )}
                  </div>

                  {/* Memory leak */}
                  <button
                    disabled={!k8sEnabled || activePods.length === 0}
                    onClick={simulateMemoryLeak}
                    className="chaos-btn chaos-btn-danger w-full"
                  >
                    🔥 Inject Memory Leak
                  </button>

                  {/* Network failure */}
                  <button
                    disabled={!k8sEnabled || networkFailure}
                    onClick={simulateNetworkFailure}
                    className="chaos-btn chaos-btn-info w-full"
                  >
                    {networkFailure ? '🌐 Network Degraded...' : '🌐 Spurious Network Delay'}
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Right: Pod Status & Details Grid */}
            <motion.div variants={itemVariants} className="lg:col-span-2 glass-card p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                    <Terminal size={14} className="text-green-400" /> Pod Ecosystem Grid
                  </h3>
                  <span className="text-[10px] font-mono text-gray-500">
                    Replica Set Capacity: {activePods.length}/{MAX_PODS} pods ({Math.round((activePods.length / MAX_PODS) * 100)}%)
                  </span>
                </div>

                {/* Scaling gauge bar */}
                <div className="h-2 bg-white/5 rounded-full mb-6 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                    animate={{ width: `${(activePods.length / MAX_PODS) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>

                {/* Pod Cards Container */}
                <div className="bg-black/20 rounded-2xl p-4 min-h-[220px] border border-white/5">
                  <AnimatePresence>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {podsList.map((pod) => (
                        <DetailPodCard key={pod.id} pod={pod} onKill={killPod} />
                      ))}
                    </div>
                  </AnimatePresence>
                  {podsList.length === 0 && (
                    <div className="text-gray-600 text-center py-16 text-xs font-mono">
                      No active pod resources deployed in namespace.
                    </div>
                  )}
                </div>
              </div>

              {/* Metric indicators */}
              <div className="flex flex-wrap gap-4 mt-6 text-[10px] text-gray-500 border-t border-white/5 pt-4">
                <div className="flex items-center gap-1.5 text-yellow-500 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-yellow-500" />
                  HPA Up threshold: &gt; 70% CPU
                </div>
                <div className="flex items-center gap-1.5 text-green-500 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  HPA Down threshold: &lt; 30% CPU
                </div>
                <div className="flex items-center gap-1.5 text-gray-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-gray-500" />
                  Replica limits: Min {MIN_PODS} / Max {MAX_PODS}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Charts & Logs Terminal Section */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Live Chart */}
            <motion.div variants={itemVariants} className="glass-card p-6 border border-white/5 shadow-lg">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">📊 Real-Time Metrics Chart</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={history.slice(-20)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="time" stroke="#475569" fontSize={9} fontClassName="font-mono" />
                  <YAxis stroke="#475569" fontSize={9} fontClassName="font-mono" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '10px',
                      fontSize: '11px',
                    }}
                  />
                  <Line type="monotone" dataKey="cpu" stroke="#ef4444" strokeWidth={2} dot={false} name="CPU %" />
                  <Line type="monotone" dataKey="pods" stroke="#22c55e" strokeWidth={2} dot={false} name="Replica Count" />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Event Logs Panel */}
            <motion.div variants={itemVariants} className="glass-card p-6 border border-white/5 shadow-lg">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
                <Terminal size={14} className="text-primary-400" /> Cluster Event Logging Stream
              </h3>
              <div className="bg-black/50 rounded-xl p-4 h-[220px] overflow-y-auto font-mono text-[10px] leading-relaxed space-y-1.5 scrollbar-thin">
                <AnimatePresence>
                  {logs.map((log, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`${
                        log.includes('CRITICAL') || log.includes('ERROR') || log.includes('💀') || log.includes('🚨')
                          ? 'text-red-400'
                          : log.includes('⚡') || log.includes('🚀') || log.includes('⚠️')
                          ? 'text-yellow-400'
                          : log.includes('📉') || log.includes('🔽')
                          ? 'text-blue-400'
                          : 'text-gray-400'
                      }`}
                    >
                      {log}
                    </motion.div>
                  ))}
                </AnimatePresence>
                {logs.length === 0 && (
                  <div className="text-gray-600 text-center pt-12">
                    Awaiting next replica status event tick...
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
