import { motion } from 'framer-motion';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Activity, Cpu, Server, Zap, TrendingUp } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

function MetricCard({ icon, label, value, unit, color, subtext }) {
  return (
    <motion.div
      className="glass-card p-5 hover:bg-white/[0.07] transition-all duration-300"
      whileHover={{ y: -4 }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl bg-${color}-500/10 flex items-center justify-center`}>
          {icon}
        </div>
        <span className="text-sm text-gray-400">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-3xl font-bold text-${color}-400`}>{value}</span>
        <span className="text-sm text-gray-500">{unit}</span>
      </div>
      {subtext && <p className="text-xs text-gray-600 mt-1">{subtext}</p>}
    </motion.div>
  );
}

export default function MetricsDashboard({ scaling, darkMode }) {
  const { cpu, pods, rps, history, k8sEnabled, traffic } = scaling;

  const memoryUsage = Math.round(cpu * 0.65);
  const latency = k8sEnabled ? Math.max(12, Math.round(50 + (cpu * 0.5))) : Math.max(12, Math.round(100 + (cpu * 3)));
  const errorRate = k8sEnabled ? (cpu > 80 ? 2.1 : 0.1) : (cpu > 70 ? 15.4 : 0.5);

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
          <motion.div variants={itemVariants} className="text-center mb-12">
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
          </motion.div>

          {/* Metric Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <MetricCard
              icon={<Cpu size={20} className="text-red-400" />}
              label="CPU Usage"
              value={cpu}
              unit="%"
              color="red"
              subtext={cpu > 70 ? 'High load' : 'Normal'}
            />
            <MetricCard
              icon={<Server size={20} className="text-green-400" />}
              label="Active Pods"
              value={pods}
              unit="pods"
              color="green"
              subtext={`of 12 max`}
            />
            <MetricCard
              icon={<Zap size={20} className="text-yellow-400" />}
              label="Requests/sec"
              value={rps}
              unit="rps"
              color="yellow"
            />
            <MetricCard
              icon={<TrendingUp size={20} className="text-blue-400" />}
              label="Avg Latency"
              value={latency}
              unit="ms"
              color="blue"
              subtext={latency > 200 ? 'Degraded' : 'Healthy'}
            />
          </motion.div>

          {/* Charts grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* CPU + Memory chart */}
            <motion.div variants={itemVariants} className="glass-card p-6">
              <h3 className="text-sm font-semibold text-gray-400 mb-4">CPU & Memory Over Time</h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={history.slice(-25)}>
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
              </ResponsiveContainer>
            </motion.div>

            {/* Pods scaling chart */}
            <motion.div variants={itemVariants} className="glass-card p-6">
              <h3 className="text-sm font-semibold text-gray-400 mb-4">Pod Scaling Activity</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={history.slice(-25)}>
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
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Bottom stats */}
          <motion.div variants={itemVariants} className="mt-8 glass-card p-6 md:p-8">
            <h3 className="text-sm font-semibold text-gray-400 mb-6">System Health Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'Memory', value: `${memoryUsage}%`, color: memoryUsage > 70 ? 'text-red-400' : 'text-green-400' },
                { label: 'Error Rate', value: `${errorRate}%`, color: errorRate > 5 ? 'text-red-400' : 'text-green-400' },
                { label: 'Uptime', value: k8sEnabled ? '99.95%' : '87.2%', color: k8sEnabled ? 'text-green-400' : 'text-red-400' },
                { label: 'Traffic Load', value: `${traffic}%`, color: traffic > 70 ? 'text-yellow-400' : 'text-green-400' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
