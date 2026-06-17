import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine } from 'recharts';
import { AlertTriangle, TrendingUp, ServerCrash } from 'lucide-react';

const trafficData = [
  { time: '8AM', traffic: 200, capacity: 800 },
  { time: '9AM', traffic: 350, capacity: 800 },
  { time: '10AM', traffic: 400, capacity: 800 },
  { time: '11AM', traffic: 600, capacity: 800 },
  { time: '11:30', traffic: 900, capacity: 800 },
  { time: '12PM', traffic: 2800, capacity: 800 },
  { time: '12:15', traffic: 3500, capacity: 800 },
  { time: '12:30', traffic: 4200, capacity: 800 },
  { time: '1PM', traffic: 3800, capacity: 800 },
  { time: '1:30', traffic: 2200, capacity: 800 },
  { time: '2PM', traffic: 800, capacity: 800 },
  { time: '3PM', traffic: 400, capacity: 800 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function ProblemSection() {
  return (
    <section id="problem" className="relative py-24 md:py-32">
      <div className="section-container">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium mb-6">
              <AlertTriangle size={14} />
              The Problem
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              When the <span className="text-red-400">Lunch Rush</span> Hits
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Every day at noon, traffic spikes by <span className="text-white font-semibold">5x</span>.
              The single server can't handle it — and the system crashes.
            </p>
          </motion.div>

          {/* Chart */}
          <motion.div variants={itemVariants} className="glass-card p-6 md:p-8 mb-12">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp size={20} className="text-red-400" />
              <h3 className="text-lg font-semibold">Traffic vs Server Capacity</h3>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={trafficData}>
                <defs>
                  <linearGradient id="trafficGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    fontSize: '13px',
                  }}
                />
                <ReferenceLine
                  y={800}
                  stroke="#f59e0b"
                  strokeDasharray="5 5"
                  label={{
                    value: '⚠️ Server Capacity',
                    position: 'right',
                    fill: '#f59e0b',
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="traffic"
                  stroke="#f87171"
                  strokeWidth={3}
                  fill="url(#trafficGradient)"
                  name="Traffic (req/s)"
                  dot={false}
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Crash animation */}
          <motion.div variants={itemVariants} className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <TrendingUp className="text-yellow-400" size={28} />,
                title: '11:30 AM — Traffic Surges',
                desc: 'Hungry users flood the app. Orders spike from 400 to 3,500+ requests per second.',
                color: 'yellow',
              },
              {
                icon: <ServerCrash className="text-red-400" size={28} />,
                title: '12:00 PM — System Crashes',
                desc: 'CPU hits 100%. Memory exhausted. Server returns 503 errors. Orders are lost.',
                color: 'red',
              },
              {
                icon: <AlertTriangle className="text-red-500" size={28} />,
                title: '12:30 PM — Total Outage',
                desc: 'App is down for 45 minutes. Revenue lost. Customers switch to competitors.',
                color: 'red',
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                className="glass-card p-6 hover:bg-white/[0.07] transition-all duration-300"
                whileHover={{ y: -4, scale: 1.02 }}
              >
                <div className={`w-12 h-12 rounded-xl bg-${card.color}-500/10 flex items-center justify-center mb-4`}>
                  {card.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
