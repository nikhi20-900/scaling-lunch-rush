import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Cpu, Server, Zap, Activity, ShoppingBag, TrendingUp,
  RefreshCw, CheckCircle, AlertCircle, ArrowRight,
  Terminal, Clock, Box, Gauge, WifiOff,
} from 'lucide-react';

/* ─── animation variants ─── */
const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

/* ─── small helper: safe number display ─── */
function fmt(val, decimals = 1, fallback = '--') {
  if (val === null || val === undefined) return fallback;
  return Number(val).toFixed(decimals);
}
function fmtInt(val, fallback = '--') {
  if (val === null || val === undefined) return fallback;
  return Math.round(Number(val)).toLocaleString();
}

/* ═══════════════════════════════════════════
   TELEMETRY CARD
   ═══════════════════════════════════════════ */
function TelemetryCard({ icon, label, value, unit, sublabel, color = 'primary', pulse }) {
  return (
    <motion.div
      variants={fadeUp}
      className="ops-card group"
      whileHover={{ y: -2 }}
    >
      <div className="flex items-center gap-2.5 mb-3">
        <div className={`w-9 h-9 rounded-lg bg-${color}-500/10 flex items-center justify-center`}>
          {icon}
        </div>
        <span className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold">{label}</span>
        {pulse && (
          <span className="ml-auto flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className={`text-3xl font-bold text-${color}-400 font-mono tabular-nums`}>{value}</span>
        {unit && <span className="text-xs text-gray-500 font-medium">{unit}</span>}
      </div>
      {sublabel && <p className="text-[10px] text-gray-500 mt-1 font-mono">{sublabel}</p>}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   HPA STATUS PANEL
   ═══════════════════════════════════════════ */
function HpaPanel({ hpa }) {
  if (!hpa) {
    return (
      <div className="ops-card col-span-full text-center py-6">
        <span className="text-gray-500 text-sm">HPA data unavailable</span>
      </div>
    );
  }

  const current = hpa.currentReplicas ?? '--';
  const desired = hpa.desiredReplicas ?? '--';
  const min = hpa.minReplicas ?? 1;
  const max = hpa.maxReplicas ?? 5;
  const cpuUtil = hpa.currentCpuUtilization;
  const cpuTarget = hpa.cpuTarget ?? 50;
  const isScaling = current !== desired && desired !== '--' && current !== '--';
  const cpuPct = cpuUtil !== null && cpuUtil !== undefined ? cpuUtil : null;

  return (
    <motion.div variants={fadeUp} className="ops-card col-span-full">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Gauge size={16} className="text-primary-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">HPA Status</h3>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          isScaling
            ? 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 status-scaling'
            : 'bg-green-500/10 border border-green-500/20 text-green-400'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isScaling ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`} />
          {isScaling ? 'Scaling' : 'Stable'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="text-center">
          <div className="text-xl font-bold font-mono text-white tabular-nums">{current} <span className="text-gray-600">/</span> {max}</div>
          <div className="text-[10px] text-gray-500 mt-0.5">Replicas</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold font-mono text-primary-400 tabular-nums">{desired}</div>
          <div className="text-[10px] text-gray-500 mt-0.5">Desired</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold font-mono text-gray-400 tabular-nums">{min}</div>
          <div className="text-[10px] text-gray-500 mt-0.5">Min</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold font-mono text-gray-400 tabular-nums">{max}</div>
          <div className="text-[10px] text-gray-500 mt-0.5">Max</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold font-mono tabular-nums">
            <span className={cpuPct !== null && cpuPct > cpuTarget ? 'text-red-400' : 'text-green-400'}>
              {cpuPct !== null ? `${cpuPct}%` : 'N/A'}
            </span>
            <span className="text-gray-600 text-sm"> / {cpuTarget}%</span>
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">CPU Target</div>
        </div>
      </div>

      {/* CPU utilization bar */}
      {cpuPct !== null && (
        <div className="mt-4">
          <div className="h-2 bg-white/5 rounded-full overflow-hidden relative">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
              animate={{ width: `${Math.min(cpuPct, 100)}%` }}
              transition={{ duration: 0.5 }}
            />
            {/* target marker */}
            <div
              className="absolute top-0 h-full w-0.5 bg-white/60"
              style={{ left: `${cpuTarget}%` }}
              title={`Target: ${cpuTarget}%`}
            />
          </div>
          <div className="flex justify-between text-[9px] text-gray-600 mt-1 font-mono">
            <span>0%</span>
            <span>Target {cpuTarget}%</span>
            <span>100%</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   POD CARD
   ═══════════════════════════════════════════ */
function PodCard({ pod }) {
  const statusStyles = {
    Running: 'border-green-500/30 bg-green-500/[0.03]',
    Pending: 'border-yellow-500/30 bg-yellow-500/[0.03]',
    Failed: 'border-red-500/30 bg-red-500/[0.03]',
    Succeeded: 'border-blue-500/30 bg-blue-500/[0.03]',
  };
  const statusBadge = {
    Running: 'status-healthy',
    Pending: 'status-degraded',
    Failed: 'status-failed',
    Succeeded: 'status-healthy',
  };

  const memMb = pod.memory ? (pod.memory / (1024 * 1024)).toFixed(1) : '--';
  const cpuVal = pod.cpu !== null && pod.cpu !== undefined ? pod.cpu.toFixed(1) : '--';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3 }}
      className={`rounded-xl border p-4 ${statusStyles[pod.status] || 'border-white/10 bg-white/[0.02]'}`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <Box size={14} className={pod.status === 'Running' ? 'text-green-400' : 'text-gray-500'} />
          <span className="font-mono text-[11px] text-white truncate font-semibold" title={pod.name}>
            {pod.name}
          </span>
        </div>
        <span className={`status-badge text-[9px] flex-shrink-0 ${statusBadge[pod.status] || ''}`}>
          {pod.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10px] font-mono">
        <div className="flex justify-between text-gray-400">
          <span>Ready</span>
          <span className={pod.ready ? 'text-green-400' : 'text-red-400'}>
            {pod.ready ? '1/1' : '0/1'}
          </span>
        </div>
        <div className="flex justify-between text-gray-400">
          <span>CPU</span>
          <span className="text-white">{cpuVal}%</span>
        </div>
        <div className="flex justify-between text-gray-400">
          <span>Memory</span>
          <span className="text-white">{memMb} MB</span>
        </div>
        <div className="flex justify-between text-gray-400">
          <span>Restarts</span>
          <span className={pod.restarts > 0 ? 'text-yellow-400' : 'text-white'}>{pod.restarts ?? 0}</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   MAIN: LIVE CLUSTER OPS
   ═══════════════════════════════════════════ */
export default function LiveClusterOps({ liveInfra, onSwitchToCaseStudy }) {
  const [orderSending, setOrderSending] = useState(false);
  const [orderNotice, setOrderNotice] = useState(null);
  const [showK6Command, setShowK6Command] = useState(false);

  const {
    summary,
    pods: clusterPods = [],
    history: liveHistory = [],
    isLoading,
    error,
    lastUpdated,
    sendLiveOrder,
  } = liveInfra || {};

  const hasData = Boolean(summary);
  const backend = summary?.backend;
  const hpa = summary?.hpa;

  /* ── handle order ── */
  const handleOrderClick = async () => {
    if (orderSending) return;
    setOrderSending(true);
    try {
      if (sendLiveOrder) {
        await sendLiveOrder();
        setOrderNotice('✅ Order placed — Prometheus counter incremented');
        setTimeout(() => setOrderNotice(null), 4000);
      }
    } catch (err) {
      setOrderNotice('❌ Order failed: ' + err.message);
      setTimeout(() => setOrderNotice(null), 4000);
    } finally {
      setOrderSending(false);
    }
  };

  /* ── safe values ── */
  const appCpu = fmt(backend?.cpu);
  const hpaCpuVal = hpa?.currentCpuUtilization;
  const hpaCpu = hpaCpuVal !== null && hpaCpuVal !== undefined ? `${hpaCpuVal}` : '--';
  const hpaCpuTarget = hpa?.cpuTarget ?? 50;
  const podCount = backend?.pods ?? clusterPods.length ?? '--';
  const maxPods = hpa?.maxReplicas ?? 5;
  const rps = fmt(backend?.requestsPerSecond, 1, '0');
  const orders = fmtInt(backend?.orders, '0');
  const memMb = backend?.memory ? (backend.memory / (1024 * 1024)).toFixed(1) : '--';
  const errRate = fmt(backend?.errorRate, 2, '0.00');

  return (
    <div className="pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {/* ═══ OPS HEADER ═══ */}
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Scaling Lunch Rush
              </h1>
              <p className="text-xs text-gray-500 font-mono mt-0.5">CloudOps Control Plane</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Connection status */}
              {isLoading && !hasData && (
                <div className="ops-status-badge bg-yellow-500/10 border-yellow-500/20 text-yellow-400">
                  <RefreshCw size={11} className="animate-spin" />
                  <span>Connecting to infrastructure...</span>
                </div>
              )}
              {error && !hasData && (
                <div className="ops-status-badge bg-red-500/10 border-red-500/20 text-red-400">
                  <WifiOff size={11} />
                  <span>Infrastructure offline</span>
                </div>
              )}
              {hasData && (
                <div className="ops-status-badge bg-green-500/10 border-green-500/20 text-green-400">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                  </span>
                  <span>Live Infrastructure</span>
                </div>
              )}

              {/* Namespace */}
              <div className="ops-status-badge bg-white/5 border-white/10 text-gray-400">
                <Box size={11} />
                <span>scaling-lunch-rush</span>
              </div>

              {/* Last updated */}
              {lastUpdated && (
                <div className="ops-status-badge bg-white/5 border-white/10 text-gray-500">
                  <Clock size={11} />
                  <span>{lastUpdated.toLocaleTimeString()}</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* ═══ HERO TELEMETRY CARDS ═══ */}
          <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
            <TelemetryCard
              icon={<Cpu size={18} className="text-red-400" />}
              label="App CPU"
              value={appCpu}
              unit="%"
              sublabel="Application process CPU"
              color="red"
              pulse={hasData}
            />
            <TelemetryCard
              icon={<Gauge size={18} className="text-yellow-400" />}
              label="HPA CPU"
              value={hpaCpu}
              unit={hpaCpuVal !== null && hpaCpuVal !== undefined ? `/ ${hpaCpuTarget}%` : ''}
              sublabel="HPA CPU utilization"
              color="yellow"
              pulse={hasData}
            />
            <TelemetryCard
              icon={<Server size={18} className="text-green-400" />}
              label="Active Pods"
              value={podCount}
              unit={`/ ${maxPods}`}
              sublabel="Current / Maximum"
              color="green"
              pulse={hasData}
            />
            <TelemetryCard
              icon={<Zap size={18} className="text-cyan-400" />}
              label="Throughput"
              value={rps}
              unit="req/s"
              sublabel="HTTP request rate"
              color="cyan"
              pulse={hasData}
            />
            <TelemetryCard
              icon={<ShoppingBag size={18} className="text-purple-400" />}
              label="Orders"
              value={orders}
              unit=""
              sublabel="Total from Prometheus"
              color="purple"
              pulse={hasData}
            />
          </motion.div>

          {/* ═══ HPA STATUS ═══ */}
          <div className="mb-6">
            <HpaPanel hpa={hpa} />
          </div>

          {/* ═══ POD FLEET ═══ */}
          <motion.div variants={fadeUp} className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                <Terminal size={14} className="text-green-400" />
                Pod Fleet
                {clusterPods.length > 0 && (
                  <span className="text-[10px] font-mono text-gray-600 normal-case">
                    ({clusterPods.length} pod{clusterPods.length !== 1 ? 's' : ''})
                  </span>
                )}
              </h2>
              {hasData && (
                <span className="text-[10px] font-mono text-gray-600">
                  Source: Kubernetes API
                </span>
              )}
            </div>

            {/* Pod cards */}
            {clusterPods.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                <AnimatePresence mode="popLayout">
                  {clusterPods.map((pod) => (
                    <PodCard key={pod.name} pod={pod} />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="ops-card text-center py-10">
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Loading pod data...</span>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center gap-2 text-gray-500">
                    <WifiOff size={20} />
                    <span className="text-sm">Unable to retrieve pod information</span>
                    <span className="text-[10px] font-mono">Kubernetes API unreachable</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-500">
                    <Server size={20} />
                    <span className="text-sm">No pods found</span>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* ═══ CHARTS ═══ */}
          <motion.div variants={fadeUp} className="grid lg:grid-cols-2 gap-4 mb-6">
            {/* Chart 1: CPU */}
            <div className="ops-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">CPU Over Time</h3>
                <span className="text-[10px] font-mono text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded">
                  Prometheus
                </span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={liveHistory}>
                  <defs>
                    <linearGradient id="lcAppCpuGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f87171" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="lcHpaCpuGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="time" stroke="#334155" fontSize={9} tickLine={false} />
                  <YAxis stroke="#334155" fontSize={9} domain={[0, 100]} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                  />
                  <Area type="monotone" dataKey="appCpu" stroke="#f87171" fill="url(#lcAppCpuGrad)" strokeWidth={2} name="App CPU %" dot={false} />
                  <Area type="monotone" dataKey="hpaCpu" stroke="#fbbf24" fill="url(#lcHpaCpuGrad)" strokeWidth={1.5} name="HPA CPU %" dot={false} strokeDasharray="4 2" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Chart 2: Throughput + Pod count */}
            <div className="ops-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Throughput & Pods</h3>
                <span className="text-[10px] font-mono text-green-400 bg-green-500/10 px-2 py-0.5 rounded">
                  Kubernetes HPA
                </span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={liveHistory}>
                  <defs>
                    <linearGradient id="lcRpsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="time" stroke="#334155" fontSize={9} tickLine={false} />
                  <YAxis yAxisId="rps" stroke="#334155" fontSize={9} tickLine={false} />
                  <YAxis yAxisId="pods" orientation="right" stroke="#334155" fontSize={9} domain={[0, 5]} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                  />
                  <Area yAxisId="rps" type="monotone" dataKey="rps" stroke="#22d3ee" fill="url(#lcRpsGrad)" strokeWidth={2} name="Req/s" dot={false} />
                  <Bar yAxisId="pods" dataKey="pods" fill="rgba(34,197,94,0.4)" radius={[3, 3, 0, 0]} name="Pods" barSize={12} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* ═══ ACTIONS ═══ */}
          <motion.div variants={fadeUp} className="ops-card p-5 mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
              <Activity size={14} className="text-accent-400" />
              Actions
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              {/* Send Order */}
              <button
                onClick={handleOrderClick}
                disabled={orderSending || !hasData}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-purple-600/20 border border-purple-500/30 text-purple-300 hover:bg-purple-600/30 hover:text-purple-200 text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                id="ops-send-order-btn"
                aria-label="Send a live order to the backend"
              >
                <ShoppingBag size={14} />
                {orderSending ? 'Sending...' : 'Send Live Order'}
              </button>

              {/* Run Load Test */}
              <div className="relative">
                <button
                  onClick={() => setShowK6Command(!showK6Command)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-600/20 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-600/30 hover:text-cyan-200 text-xs font-bold uppercase tracking-wider transition-all"
                  id="ops-load-test-btn"
                  aria-label="Show load test command"
                >
                  <Zap size={14} />
                  Run Load Test
                </button>
                {showK6Command && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-0 mt-2 z-20 w-80 p-4 rounded-xl bg-surface-900 border border-white/10 shadow-xl"
                  >
                    <p className="text-[11px] text-gray-400 mb-2">Run this command from your terminal:</p>
                    <code className="block text-[10px] text-cyan-300 bg-black/50 p-3 rounded-lg font-mono break-all">
                      k6 run --vus 50 --duration 60s load-test/smoke.js
                    </code>
                    <p className="text-[9px] text-gray-600 mt-2">This sends real HTTP traffic through the cluster, triggering HPA scaling.</p>
                    <button
                      onClick={() => setShowK6Command(false)}
                      className="mt-2 text-[10px] text-gray-500 hover:text-gray-300 transition"
                    >
                      Dismiss
                    </button>
                  </motion.div>
                )}
              </div>

              {/* Explore Case Study */}
              <button
                onClick={onSwitchToCaseStudy}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white text-xs font-bold uppercase tracking-wider transition-all"
                id="ops-explore-casestudy-btn"
                aria-label="Switch to case study view"
              >
                <ArrowRight size={14} />
                Explore Case Study
              </button>

              {/* Order notice */}
              <AnimatePresence>
                {orderNotice && (
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-green-400 font-mono"
                  >
                    {orderNotice}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* ═══ SYSTEM HEALTH SUMMARY ═══ */}
          <motion.div variants={fadeUp} className="ops-card p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-5 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle size={14} className="text-green-400" />
                System Health
              </span>
              <span className="text-[10px] text-primary-400 font-mono normal-case">
                namespace: scaling-lunch-rush
              </span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'Process Memory', value: memMb !== '--' ? `${memMb} MB` : '--', color: 'text-green-400' },
                { label: 'Error Rate', value: `${errRate}%`, color: 'text-green-400' },
                { label: 'HPA Range', value: `${hpa?.minReplicas ?? 1}–${hpa?.maxReplicas ?? 5} pods`, color: 'text-primary-400' },
                { label: 'HPA CPU Target', value: `${hpa?.cpuTarget ?? 50}%`, color: 'text-yellow-400' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className={`text-xl font-bold font-mono tabular-nums ${stat.color}`}>{stat.value}</div>
                  <div className="text-[10px] text-gray-500 mt-1 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}
