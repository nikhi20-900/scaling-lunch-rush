import { motion } from 'framer-motion';
import { Network, Shield, Globe, Database, CreditCard, Users, ShoppingCart, Layers } from 'lucide-react';

const services = [
  { icon: <Globe size={24} />, name: 'API Gateway', desc: 'Routes requests, rate limiting, auth', color: 'from-blue-500 to-cyan-500' },
  { icon: <Users size={24} />, name: 'User Service', desc: 'Authentication, profiles, sessions', color: 'from-green-500 to-emerald-500' },
  { icon: <ShoppingCart size={24} />, name: 'Order Service', desc: 'Order lifecycle management', color: 'from-orange-500 to-amber-500' },
  { icon: <CreditCard size={24} />, name: 'Payment Service', desc: 'Payment processing & validation', color: 'from-purple-500 to-violet-500' },
  { icon: <Database size={24} />, name: 'Database', desc: 'PostgreSQL with read replicas', color: 'from-pink-500 to-rose-500' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function SolutionSection() {
  return (
    <section id="solution" className="relative py-24 md:py-32">
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
              <Shield size={14} />
              The Solution
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">Microservices</span> + Kubernetes
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Break the monolith into independent services. Let Kubernetes handle scaling each one automatically.
            </p>
          </motion.div>

          {/* Architecture comparison */}
          <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Monolith */}
            <div className="glass-card p-8 border-red-500/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <Layers size={20} className="text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-400">❌ Monolith Architecture</h3>
                  <p className="text-gray-500 text-xs">Before</p>
                </div>
              </div>
              <div className="relative p-6 rounded-xl bg-red-500/5 border border-red-500/10">
                <div className="text-center space-y-3">
                  <div className="bg-red-500/10 rounded-lg p-3 text-sm font-mono text-red-300">
                    Single Server
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {['Users', 'Orders', 'Payments', 'Database'].map((s) => (
                      <div key={s} className="bg-red-500/5 border border-red-500/10 rounded p-2 text-red-300/70">{s}</div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">All tightly coupled. One fails → all fail.</p>
                </div>
              </div>
            </div>

            {/* Microservices */}
            <div className="glass-card p-8 border-green-500/20 glow-border">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Network size={20} className="text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-400">✅ Microservices Architecture</h3>
                  <p className="text-gray-500 text-xs">After</p>
                </div>
              </div>
              <div className="relative p-6 rounded-xl bg-green-500/5 border border-green-500/10">
                <div className="text-center space-y-3">
                  <div className="bg-green-500/10 rounded-lg p-3 text-sm font-mono text-green-300">
                    API Gateway (Load Balanced)
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {['User Svc ×3', 'Order Svc ×5', 'Payment Svc ×3', 'DB Replicas ×2'].map((s) => (
                      <div key={s} className="bg-green-500/5 border border-green-500/10 rounded p-2 text-green-300/70">{s}</div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">Independent scaling. Isolated failures.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Service cards */}
          <motion.div variants={itemVariants}>
            <h3 className="text-2xl font-bold text-center mb-8">Service Components</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {services.map((svc, i) => (
                <motion.div
                  key={i}
                  className="glass-card p-5 text-center hover:bg-white/[0.07] transition-all duration-300 group"
                  whileHover={{ y: -6, scale: 1.03 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${svc.color} p-3 text-white mb-3 group-hover:scale-110 transition-transform`}>
                    {svc.icon}
                  </div>
                  <h4 className="font-semibold text-sm mb-1">{svc.name}</h4>
                  <p className="text-xs text-gray-500">{svc.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
