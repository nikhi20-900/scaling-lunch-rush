import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, ArrowRight, Wifi, Server, Globe, Database as DbIcon } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

function Pod({ index, status = 'running' }) {
  const colors = {
    running: 'bg-green-500/20 border-green-500/40 text-green-400',
    pending: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400',
    terminating: 'bg-red-500/20 border-red-500/40 text-red-400',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={`w-16 h-16 md:w-20 md:h-20 rounded-xl border ${colors[status]} flex flex-col items-center justify-center gap-1 pod-pulse`}
    >
      <Box size={16} />
      <span className="text-[10px] font-mono">Pod {index}</span>
    </motion.div>
  );
}

function K8sNode({ label, pods = [], color = 'primary' }) {
  const borderColor = color === 'primary' ? 'border-primary-500/30' : 'border-accent-500/30';
  const labelColor = color === 'primary' ? 'text-primary-400' : 'text-accent-400';
  const bgColor = color === 'primary' ? 'bg-primary-500/5' : 'bg-accent-500/5';

  return (
    <div className={`glass-card p-4 md:p-6 ${borderColor}`}>
      <div className="flex items-center gap-2 mb-4">
        <Server size={16} className={labelColor} />
        <span className={`text-sm font-semibold ${labelColor}`}>{label}</span>
      </div>
      <div className={`${bgColor} rounded-xl p-3 md:p-4 min-h-[100px] flex flex-wrap gap-2 items-center justify-center`}>
        <AnimatePresence>
          {pods.map((pod, i) => (
            <Pod key={`${label}-pod-${i}`} index={i + 1} status={pod} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function K8sArchitecture() {
  const [activePods, setActivePods] = useState(4);
  const [animStep, setAnimStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimStep(prev => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const podCounts = [3, 5, 8, 4];
    setActivePods(podCounts[animStep]);
  }, [animStep]);

  const node1Pods = Array(Math.min(activePods, 4)).fill('running');
  const node2Pods = Array(Math.max(0, activePods - 4)).fill('running');

  return (
    <section id="architecture" className="relative py-24 md:py-32">
      <div className="section-container">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-medium mb-6">
              <Box size={14} />
              Architecture
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Kubernetes <span className="gradient-text">Cluster</span> View
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              See how requests flow through the cluster. Pods dynamically scale across worker nodes.
            </p>
          </motion.div>

          {/* K8s Cluster Diagram */}
          <motion.div variants={itemVariants} className="glass-card-strong p-6 md:p-10">
            {/* Cluster Header */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <span className="font-mono text-sm text-green-400">k8s-cluster: lunch-rush-prod</span>
              <span className="text-gray-600 text-xs">|</span>
              <span className="font-mono text-xs text-gray-500">{activePods} pods running</span>
            </div>

            {/* Flow */}
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 mb-8">
              {/* Users */}
              <motion.div
                className="glass-card p-4 text-center min-w-[100px]"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Globe size={28} className="text-blue-400 mx-auto mb-2" />
                <span className="text-xs font-medium text-gray-400">Users</span>
              </motion.div>

              <ArrowRight className="text-gray-600 hidden md:block" size={20} />
              <span className="text-gray-600 md:hidden text-lg">↓</span>

              {/* Load Balancer */}
              <div className="glass-card p-4 text-center min-w-[140px] border-primary-500/30">
                <Wifi size={28} className="text-primary-400 mx-auto mb-2" />
                <span className="text-xs font-medium text-primary-400">Load Balancer</span>
                <div className="text-[10px] text-gray-500 mt-1">Ingress Controller</div>
              </div>

              <ArrowRight className="text-gray-600 hidden md:block" size={20} />
              <span className="text-gray-600 md:hidden text-lg">↓</span>

              {/* Service */}
              <div className="glass-card p-4 text-center min-w-[140px] border-accent-500/30">
                <Server size={28} className="text-accent-400 mx-auto mb-2" />
                <span className="text-xs font-medium text-accent-400">K8s Service</span>
                <div className="text-[10px] text-gray-500 mt-1">ClusterIP / NodePort</div>
              </div>
            </div>

            {/* Worker Nodes */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <K8sNode label="Worker Node 1" pods={node1Pods} color="primary" />
              <K8sNode label="Worker Node 2" pods={node2Pods} color="accent" />
            </div>

            {/* Database */}
            <div className="flex justify-center">
              <div className="glass-card p-4 text-center border-pink-500/30">
                <DbIcon size={24} className="text-pink-400 mx-auto mb-2" />
                <span className="text-xs font-medium text-pink-400">Persistent Volume</span>
                <div className="text-[10px] text-gray-500 mt-1">PostgreSQL + Redis</div>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-8 flex flex-wrap items-center gap-4 justify-center text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-500/30 border border-green-500/50" />
                <span>Running Pod</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-yellow-500/30 border border-yellow-500/50" />
                <span>Pending Pod</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-500/30 border border-red-500/50" />
                <span>Terminating Pod</span>
              </div>
            </div>
          </motion.div>

          {/* K8s Concepts */}
          <motion.div variants={itemVariants} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {[
              { term: 'Pod', desc: 'Smallest deployable unit. Runs one or more containers.', icon: '📦' },
              { term: 'Deployment', desc: 'Manages pod replicas and rolling updates.', icon: '🚀' },
              { term: 'Service', desc: 'Stable network endpoint for accessing pods.', icon: '🔗' },
              { term: 'HPA', desc: 'Horizontal Pod Autoscaler — scales based on metrics.', icon: '⚡' },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="glass-card p-5 hover:bg-white/[0.07] transition-all duration-300"
                whileHover={{ y: -4 }}
              >
                <span className="text-2xl mb-3 block">{item.icon}</span>
                <h4 className="text-sm font-semibold text-white mb-1">{item.term}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
