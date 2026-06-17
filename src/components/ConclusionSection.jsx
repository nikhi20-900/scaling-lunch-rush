import { motion } from 'framer-motion';
import { TrendingUp, Shield, DollarSign, CheckCircle } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const benefits = [
  {
    icon: <TrendingUp size={32} />,
    title: 'Scalability',
    desc: 'Handle 10x traffic spikes automatically. Pods scale up during lunch rush and scale back down after.',
    stats: '3,500+ req/s',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: <Shield size={32} />,
    title: 'Reliability',
    desc: 'Zero downtime deployments. Self-healing pods. Automatic restarts and health checks.',
    stats: '99.95% uptime',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: <DollarSign size={32} />,
    title: 'Cost Efficiency',
    desc: 'Scale down during low traffic. Pay only for what you use. No over-provisioning.',
    stats: '40% savings',
    color: 'from-purple-500 to-violet-500',
  },
];

export default function ConclusionSection() {
  return (
    <section id="conclusion" className="relative py-24 md:py-32">
      <div className="section-container">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium mb-6">
              <CheckCircle size={14} />
              Conclusion
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why <span className="gradient-text">Kubernetes</span>?
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              The lunch rush is no longer a crisis. It's just another load spike handled gracefully.
            </p>
          </motion.div>

          {/* Benefits Grid */}
          <motion.div variants={itemVariants} className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                className="glass-card-strong p-8 text-center group hover:bg-white/[0.08] transition-all duration-500"
                whileHover={{ y: -10, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className={`w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br ${benefit.color} p-5 text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">{benefit.desc}</p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-semibold text-white">
                  {benefit.stats}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
