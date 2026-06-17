import { motion } from 'framer-motion';
import { TrendingUp, Server, Wifi, Zap, AlertTriangle } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

function AnimatedBar({ value, max, color, label }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="mb-2">
      <div className="flex justify-between text-[10px] mb-1">
        <span className="text-gray-400">{label}</span>
        <span style={{ color }}>{value}{label.includes('Latency') ? 'ms' : '%'}</span>
      </div>
      <div className="resource-bar">
        <motion.div
          className="resource-bar-fill"
          style={{ background: color }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
}

function SystemCard({ title, metrics, status, statusColor, icon, borderColor }) {
  return (
    <div className="glass-card-strong p-6 border-l-4" style={{ borderLeftColor: borderColor }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon}
          <h4 className="text-sm font-bold text-white">{title}</h4>
        </div>
        <span className={`status-badge ${statusColor}`}>
          {status}
        </span>
      </div>
      <div className="space-y-2">
        {metrics.map((m, i) => (
          <AnimatedBar key={i} {...m} />
        ))}
      </div>
    </div>
  );
}

export default function BeforeAfterComparison({ scaling }) {
  const { traffic, pods, cpu, k8sEnabled } = scaling;

  // Monolithic system simulation (always degrades with traffic)
  const monoCpu = Math.min(100, Math.round(traffic * 1.8 + (Math.random() - 0.5) * 5));
  const monoMemory = Math.min(100, Math.round(traffic * 1.5));
  const monoLatency = traffic > 70 ? Math.round(800 + traffic * 15) : Math.round(50 + traffic * 5);
  const monoErrorRate = traffic > 80 ? Math.round(20 + (traffic - 80) * 4) : traffic > 60 ? Math.round((traffic - 60) * 1) : 0;
  const monoStatus = monoCpu >= 95 ? 'CRASHED' : monoCpu >= 75 ? 'DEGRADED' : 'HEALTHY';
  const monoStatusColor = monoStatus === 'CRASHED' ? 'status-failed' : monoStatus === 'DEGRADED' ? 'status-degraded' : 'status-healthy';

  // Kubernetes system simulation (scales gracefully)
  const k8sCpu = k8sEnabled ? cpu : monoCpu;
  const k8sMemory = k8sEnabled ? Math.round(cpu * 0.55) : monoMemory;
  const k8sLatency = k8sEnabled ? Math.max(12, Math.round(30 + cpu * 0.4)) : monoLatency;
  const k8sErrorRate = k8sEnabled ? (cpu > 85 ? 1.5 : 0.1) : monoErrorRate;
  const k8sStatus = !k8sEnabled ? monoStatus : cpu > 85 ? 'SCALING' : 'HEALTHY';
  const k8sStatusColor = k8sStatus === 'HEALTHY' ? 'status-healthy' : k8sStatus === 'SCALING' ? 'status-pending' : monoStatusColor;

  return (
    <section id="comparison" className="relative py-24 md:py-32">
      <div className="section-container">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-6">
              <TrendingUp size={14} />
              Live Comparison
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Monolith vs <span className="gradient-text">Kubernetes</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Same traffic, same lunch rush. Watch how each architecture handles the load in real-time.
            </p>
          </motion.div>

          {/* Traffic indicator */}
          <motion.div variants={itemVariants} className="flex items-center justify-center gap-4 mb-8">
            <span className="text-sm text-gray-500">Current Traffic Load:</span>
            <div className="flex items-center gap-2">
              <div className="w-40 h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: traffic > 70 ? 'linear-gradient(to right, #f59e0b, #ef4444)' : 'linear-gradient(to right, #22c55e, #f59e0b)',
                  }}
                  animate={{ width: `${traffic}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <span className="text-sm font-mono font-bold text-white">{traffic}%</span>
            </div>
          </motion.div>

          {/* Side-by-side cards */}
          <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-8">
            {/* Monolithic */}
            <SystemCard
              title="Monolithic Server"
              icon={<Server size={18} className="text-red-400" />}
              borderColor={monoStatus === 'CRASHED' ? '#ef4444' : monoStatus === 'DEGRADED' ? '#f97316' : '#22c55e'}
              status={monoStatus}
              statusColor={monoStatusColor}
              metrics={[
                { value: monoCpu, max: 100, color: monoCpu > 80 ? '#ef4444' : monoCpu > 50 ? '#f59e0b' : '#22c55e', label: 'CPU Usage' },
                { value: monoMemory, max: 100, color: monoMemory > 80 ? '#ef4444' : '#f59e0b', label: 'Memory Usage' },
                { value: Math.min(monoLatency, 2000), max: 2000, color: monoLatency > 500 ? '#ef4444' : '#f59e0b', label: `Latency: ${monoLatency}ms` },
                { value: Math.min(monoErrorRate, 100), max: 100, color: monoErrorRate > 10 ? '#ef4444' : '#22c55e', label: 'Error Rate' },
              ]}
            />

            {/* Kubernetes */}
            <SystemCard
              title="Kubernetes + HPA"
              icon={<Wifi size={18} className="text-green-400" />}
              borderColor={k8sStatus === 'HEALTHY' ? '#22c55e' : k8sStatus === 'SCALING' ? '#eab308' : '#ef4444'}
              status={k8sStatus}
              statusColor={k8sStatusColor}
              metrics={[
                { value: k8sCpu, max: 100, color: k8sCpu > 80 ? '#f59e0b' : '#22c55e', label: 'CPU Usage' },
                { value: k8sMemory, max: 100, color: k8sMemory > 70 ? '#f59e0b' : '#22c55e', label: 'Memory Usage' },
                { value: Math.min(k8sLatency, 2000), max: 2000, color: k8sLatency > 200 ? '#f59e0b' : '#22c55e', label: `Latency: ${k8sLatency}ms` },
                { value: Math.min(k8sErrorRate, 100), max: 100, color: k8sErrorRate > 5 ? '#f59e0b' : '#22c55e', label: 'Error Rate' },
              ]}
            />
          </motion.div>

          {/* Bottom insight */}
          <motion.div variants={itemVariants} className="mt-8 text-center">
            {traffic > 60 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/10"
              >
                {monoStatus === 'CRASHED' ? (
                  <>
                    <AlertTriangle size={16} className="text-red-400" />
                    <span className="text-sm text-gray-300">
                      Monolith <span className="text-red-400 font-bold">crashed</span> at {traffic}% traffic — K8s scaled to <span className="text-green-400 font-bold">{pods} pods</span> and stayed healthy
                    </span>
                  </>
                ) : (
                  <>
                    <Zap size={16} className="text-yellow-400" />
                    <span className="text-sm text-gray-300">
                      Monolith struggling at <span className="text-yellow-400 font-bold">{monoCpu}% CPU</span> — K8s distributing load across <span className="text-green-400 font-bold">{pods} pods</span>
                    </span>
                  </>
                )}
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
