import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Activity, Cpu, Server, Zap, TrendingUp, ShoppingBag, Radio, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

function MetricCard({ icon, label, value, unit, color, subtext, isLive }) {
  return (
    <motion.div
      className="glass-card p-5 hover:bg-white/[0.07] transition-all duration-300 relative overflow-hidden"
      whileHover={{ y: -4 }}
    >
      {isLive && (
        <span className="absolute top-2 right-2 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </span>
      )}
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl bg-${color}-500/10 flex items-center justify-center`}>
          {icon}
        </div>
        <span className="text-sm text-gray-400">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-3xl font-bold text-${color}-400 font-mono`}>{value}</span>
        {unit && <span className="text-sm text-gray-500">{unit}</span>}
      </div>
      {subtext && <p className="text-xs text-gray-500 mt-1.5 font-mono">{subtext}</p>}
    </motion.div>
  );
}

export default function MetricsDashboard({ scaling, darkMode, liveInfra }) {
  const [sourceMode, setSourceMode] = useState('live'); // 'live' | 'simulation'
  const [orderSending, setOrderSending] = useState(false);
  const [orderNotice, setOrderNotice] = useState(null);

  const {
    summary,
    pods: clusterPods = [],
    history: liveHistory = [],
    isLoading: liveLoading,
    error: liveError,
    lastUpdated,
    sendLiveOrder,
  } = liveInfra || {};

  const hasLive = Boolean(summary);
  const isLiveActive = sourceMode === 'live' && hasLive;

  // Simulation metrics fallback
  const { cpu: simCpu, pods: simPods, rps: simRps, history: simHistory, k8sEnabled } = scaling || {};
  const simMemoryUsage = Math.round(simCpu * 0.65);
  const simLatency = k8sEnabled ? Math.max(12, Math.round(50 + (simCpu * 0.5))) : Math.max(12, Math.round(100 + (simCpu * 3)));
  const simErrorRate = k8sEnabled ? (simCpu > 80 ? 2.1 : 0.1) : (simCpu > 70 ? 15.4 : 0.5);

  // Real backend metrics
  const backend = summary?.backend;
  const hpa = summary?.hpa;

  // Format real values
  const liveAppCpu = backend?.cpu !== null && backend?.cpu !== undefined ? backend.cpu.toFixed(1) : '--';
  const liveHpaCpu = hpa?.currentCpuUtilization !== null && hpa?.currentCpuUtilization !== undefined ? `${hpa.currentCpuUtilization}%` : 'N/A';
  const liveHpaTarget = hpa?.cpuTarget !== null && hpa?.cpuTarget !== undefined ? `${hpa.cpuTarget}%` : '50%';
  const livePodsCount = backend?.pods !== null && backend?.pods !== undefined ? backend.pods : (clusterPods.length || '--');
  const liveRps = backend?.requestsPerSecond !== null && backend?.requestsPerSecond !== undefined ? backend.requestsPerSecond.toFixed(2) : '0.00';
  const liveLatency = backend?.requestLatency !== null && backend?.requestLatency !== undefined ? backend.requestLatency.toFixed(1) : '--';
  const liveOrders = backend?.orders !== null && backend?.orders !== undefined ? backend.orders : 0;
  const liveMemoryMb = backend?.memory !== null && backend?.memory !== undefined ? (backend.memory / (1024 * 1024)).toFixed(1) : '--';
  const liveErrorRate = backend?.errorRate !== null && backend?.errorRate !== undefined ? backend.errorRate.toFixed(2) : '0.00';

  const handleOrderClick = async () => {
    if (orderSending) return;
    setOrderSending(true);
    try {
      if (sendLiveOrder) {
        await sendLiveOrder();
        setOrderNotice('Order placed! Scraped by Prometheus.');
        setTimeout(() => setOrderNotice(null), 4000);
      }
    } catch (err) {
      setOrderNotice('Order failed: ' + err.message);
      setTimeout(() => setOrderNotice(null), 4000);
    } finally {
      setOrderSending(false);
    }
  };

  return (
    <section id="metrics" className="relative py-24 md:py-32">
      <div className="section-container">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-6">
              <Activity size={14} />
              Live Dashboard
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Metrics <span className="gradient-text">Dashboard</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Real-time monitoring of cluster health, performance, and resource utilization.
            </p>

            {/* Live Connection Banner */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {liveLoading && !hasLive && (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-mono">
                  <RefreshCw size={12} className="animate-spin" />
                  Connecting to infrastructure...
                </div>
              )}

              {liveError && !hasLive && (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
                  <AlertCircle size={12} />
                  Unable to connect to infrastructure
                </div>
              )}

              {hasLive && (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-mono">
                  <CheckCircle size={12} />
                  Live Infrastructure Connected (K8s + Prometheus)
                  {lastUpdated && (
                    <span className="text-gray-500 text-[10px]">
                      Updated {lastUpdated.toLocaleTimeString()}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Source Mode Toggle */}
            <div className="mt-6 inline-flex p-1 rounded-xl bg-white/5 border border-white/10">
              <button
                onClick={() => setSourceMode('live')}
                disabled={!hasLive}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                  isLiveActive
                    ? 'bg-primary-500 text-white shadow-lg'
                    : hasLive
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-600 cursor-not-allowed'
                }`}
                id="source-mode-live-btn"
              >
                <Radio size={14} className={isLiveActive ? 'animate-pulse' : ''} />
                Live Cluster Data
              </button>
              <button
                onClick={() => setSourceMode('sim')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                  !isLiveActive
                    ? 'bg-accent-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
                id="source-mode-sim-btn"
              >
                <Zap size={14} />
                Simulation Model
              </button>
            </div>
          </motion.div>

          {/* Metric Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <MetricCard
              icon={<Cpu size={20} className="text-red-400" />}
              label={isLiveActive ? "Application CPU" : "CPU Usage"}
              value={isLiveActive ? liveAppCpu : simCpu}
              unit="%"
              color="red"
              subtext={
                isLiveActive
                  ? `HPA CPU: ${liveHpaCpu} (Target: ${liveHpaTarget})`
                  : (simCpu > 70 ? 'High load' : 'Normal')
              }
              isLive={isLiveActive}
            />
            <MetricCard
              icon={<Server size={20} className="text-green-400" />}
              label="Active Pods"
              value={isLiveActive ? livePodsCount : simPods}
              unit="pods"
              color="green"
              subtext={
                isLiveActive
                  ? `HPA: ${hpa?.currentReplicas ?? 1}/${hpa?.maxReplicas ?? 5} max`
                  : 'of 12 max'
              }
              isLive={isLiveActive}
            />
            <MetricCard
              icon={<Zap size={20} className="text-yellow-400" />}
              label="Requests/sec"
              value={isLiveActive ? liveRps : simRps}
              unit="rps"
              color="yellow"
              subtext={
                isLiveActive
                  ? `Avg Latency: ${liveLatency} ms`
                  : undefined
              }
              isLive={isLiveActive}
            />
            <MetricCard
              icon={isLiveActive ? <ShoppingBag size={20} className="text-purple-400" /> : <TrendingUp size={20} className="text-blue-400" />}
              label={isLiveActive ? "Total Orders" : "Avg Latency"}
              value={isLiveActive ? liveOrders : simLatency}
              unit={isLiveActive ? "orders" : "ms"}
              color={isLiveActive ? "purple" : "blue"}
              subtext={
                isLiveActive
                  ? "Real orders from Prometheus"
                  : (simLatency > 200 ? 'Degraded' : 'Healthy')
              }
              isLive={isLiveActive}
            />
          </motion.div>

          {/* Interactive Test Order Trigger in Live Mode */}
          {isLiveActive && (
            <motion.div variants={itemVariants} className="mb-8 p-4 rounded-2xl glass-card flex flex-col sm:flex-row items-center justify-between gap-4 border border-purple-500/20">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <ShoppingBag size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-white uppercase tracking-wider">
                    Generate Real Lunch Rush Traffic
                  </div>
                  <div className="text-[11px] text-gray-400">
                    Triggers POST /api/orders on backend → Prometheus increments lunch_rush_orders_total
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {orderNotice && (
                  <span className="text-xs text-green-400 font-mono animate-fade-in">
                    {orderNotice}
                  </span>
                )}
                <button
                  onClick={handleOrderClick}
                  disabled={orderSending}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-purple-500/25 flex items-center gap-2"
                  id="send-test-order-btn"
                >
                  <ShoppingBag size={14} />
                  {orderSending ? 'Sending Order...' : 'Send Live Order'}
                </button>
              </div>
            </motion.div>
          )}

          {/* Charts grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* CPU Chart */}
            <motion.div variants={itemVariants} className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-400">
                  {isLiveActive ? 'Real Application & HPA CPU Over Time' : 'CPU & Memory Over Time'}
                </h3>
                {isLiveActive && (
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                    Prometheus Scrapes
                  </span>
                )}
              </div>
              <ResponsiveContainer width="100%" height={250}>
                {isLiveActive ? (
                  <AreaChart data={liveHistory}>
                    <defs>
                      <linearGradient id="appCpuGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="hpaCpuGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="time" stroke="#475569" fontSize={10} />
                    <YAxis stroke="#475569" fontSize={10} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '10px',
                        fontSize: '12px',
                      }}
                    />
                    <Area type="monotone" dataKey="appCpu" stroke="#f87171" fill="url(#appCpuGrad)" strokeWidth={2} name="App CPU %" dot={false} />
                    <Area type="monotone" dataKey="hpaCpu" stroke="#fbbf24" fill="url(#hpaCpuGrad)" strokeWidth={2} name="HPA Target CPU %" dot={false} />
                  </AreaChart>
                ) : (
                  <AreaChart data={simHistory?.slice(-25) || []}>
                    <defs>
                      <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="time" stroke="#475569" fontSize={10} />
                    <YAxis stroke="#475569" fontSize={10} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '10px',
                        fontSize: '12px',
                      }}
                    />
                    <Area type="monotone" dataKey="cpu" stroke="#f87171" fill="url(#cpuGrad)" strokeWidth={2} name="CPU %" dot={false} />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </motion.div>

            {/* Pods scaling chart */}
            <motion.div variants={itemVariants} className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-400">Pod Scaling Activity</h3>
                {isLiveActive && (
                  <span className="text-[10px] font-mono text-green-400 bg-green-500/10 px-2 py-0.5 rounded">
                    Kubernetes HPA
                  </span>
                )}
              </div>
              <ResponsiveContainer width="100%" height={250}>
                {isLiveActive ? (
                  <BarChart data={liveHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="time" stroke="#475569" fontSize={10} />
                    <YAxis stroke="#475569" fontSize={10} domain={[0, 5]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '10px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="pods" fill="#22c55e" radius={[4, 4, 0, 0]} name="Active Pods" />
                  </BarChart>
                ) : (
                  <BarChart data={simHistory?.slice(-25) || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="time" stroke="#475569" fontSize={10} />
                    <YAxis stroke="#475569" fontSize={10} domain={[0, 12]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '10px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="pods" fill="#22c55e" radius={[4, 4, 0, 0]} name="Active Pods" />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Bottom stats: System Health Summary */}
          <motion.div variants={itemVariants} className="mt-8 glass-card p-6 md:p-8">
            <h3 className="text-sm font-semibold text-gray-400 mb-6 flex items-center justify-between">
              <span>System Health Summary</span>
              {isLiveActive && (
                <span className="text-xs text-primary-400 font-mono">
                  Target Namespace: scaling-lunch-rush
                </span>
              )}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                {
                  label: isLiveActive ? 'Process Memory' : 'Memory',
                  value: isLiveActive ? `${liveMemoryMb} MB` : `${simMemoryUsage}%`,
                  color: 'text-green-400',
                },
                {
                  label: 'Error Rate',
                  value: isLiveActive ? `${liveErrorRate}%` : `${simErrorRate}%`,
                  color: 'text-green-400',
                },
                {
                  label: isLiveActive ? 'HPA Limits' : 'Uptime',
                  value: isLiveActive ? `${hpa?.minReplicas ?? 1}–${hpa?.maxReplicas ?? 5} pods` : (k8sEnabled ? '99.95%' : '87.2%'),
                  color: 'text-primary-400',
                },
                {
                  label: isLiveActive ? 'HPA CPU Target' : 'Traffic Load',
                  value: isLiveActive ? `${hpa?.cpuTarget ?? 50}%` : `${scaling?.traffic ?? 20}%`,
                  color: 'text-yellow-400',
                },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-gray-500 mt-1 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
