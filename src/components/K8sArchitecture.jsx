import { motion, AnimatePresence } from 'framer-motion';
import { Box, Server, Globe, Wifi, Database as DbIcon, ShieldAlert } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

function FlowConnector({ traffic, active = true, direction = 'horizontal', color = '#5c7cfa' }) {
  // Compute speed duration dynamically: higher traffic = faster particles
  // Traffic is 0 to 100.
  const duration = active ? `${Math.max(0.4, 4 - (traffic / 100) * 3.4)}s` : '0s';

  if (direction === 'horizontal') {
    return (
      <div className="relative w-12 h-6 flex items-center justify-center">
        <svg className="w-full h-full" viewBox="0 0 48 24">
          <path
            d="M 0 12 L 44 12"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M 38 7 L 45 12 L 38 17"
            fill="none"
            stroke={active ? color : 'rgba(255,255,255,0.1)'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {active && (
            <path
              d="M 0 12 L 44 12"
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeDasharray="6,18"
              strokeLinecap="round"
              style={{
                strokeDashoffset: 24,
                animation: `flowHorizontal ${duration} linear infinite`,
              }}
            />
          )}
        </svg>
        <style>{`
          @keyframes flowHorizontal {
            to { stroke-dashoffset: 0; }
          }
        `}</style>
      </div>
    );
  } else {
    return (
      <div className="relative w-6 h-12 flex items-center justify-center">
        <svg className="w-full h-full" viewBox="0 0 24 48">
          <path
            d="M 12 0 L 12 44"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M 7 38 L 12 45 L 17 38"
            fill="none"
            stroke={active ? color : 'rgba(255,255,255,0.1)'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {active && (
            <path
              d="M 12 0 L 12 44"
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeDasharray="6,18"
              strokeLinecap="round"
              style={{
                strokeDashoffset: 24,
                animation: `flowVertical ${duration} linear infinite`,
              }}
            />
          )}
        </svg>
        <style>{`
          @keyframes flowVertical {
            to { stroke-dashoffset: 0; }
          }
        `}</style>
      </div>
    );
  }
}

function BranchFlow({ traffic, active = true, target = 'left' }) {
  const duration = active ? `${Math.max(0.4, 4 - (traffic / 100) * 3.4)}s` : '0s';
  const color = active ? '#ffa726' : 'rgba(255,255,255,0.1)';

  // Left path curves from top-center to bottom-left. Right path curves from top-center to bottom-right.
  const pathD = target === 'left' 
    ? 'M 50 0 C 50 20, 15 20, 15 45' 
    : 'M 50 0 C 50 20, 85 20, 85 45';

  return (
    <div className="relative w-full h-12">
      <svg className="w-full h-full" viewBox="0 0 100 48" preserveAspectRatio="none">
        <path
          d={pathD}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="2"
        />
        {active && (
          <path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeDasharray="6,18"
            style={{
              strokeDashoffset: 24,
              animation: `flowCurve ${duration} linear infinite`,
            }}
          />
        )}
      </svg>
      <style>{`
        @keyframes flowCurve {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
}

function ArchPod({ name, status, cpu }) {
  // Status style maps
  const statusClasses = {
    Healthy: 'bg-green-500/10 border-green-500/30 text-green-400',
    Pending: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400 animate-pulse',
    Terminating: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    Failed: 'bg-red-500/10 border-red-500/30 text-red-500',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={`p-2 rounded-lg border ${statusClasses[status] || 'bg-white/5 text-gray-400'} flex items-center gap-1.5 text-[10px] font-mono`}
    >
      <Box size={10} className={status === 'Healthy' ? 'animate-spin-slow' : ''} />
      <div className="flex flex-col">
        <span className="font-semibold truncate max-w-[60px]">{name}</span>
        {status === 'Healthy' && <span className="opacity-70">{cpu}% CPU</span>}
        {status !== 'Healthy' && <span className="uppercase text-[8px]">{status}</span>}
      </div>
    </motion.div>
  );
}

function K8sNode({ label, status, pods = [], traffic }) {
  const isFailed = status === 'Failed';
  const borderColor = isFailed 
    ? 'border-red-500/30 bg-red-950/5' 
    : 'border-white/10 hover:border-white/15 bg-white/5';
  const labelColor = isFailed ? 'text-red-400' : 'text-gray-300';

  return (
    <div className={`glass-card p-4 transition-all duration-500 ${borderColor}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Server size={14} className={isFailed ? 'text-red-400' : 'text-primary-400'} />
          <span className={`text-xs font-bold font-mono ${labelColor}`}>{label}</span>
        </div>
        <span className={`status-badge ${isFailed ? 'status-failed' : 'status-healthy'}`}>
          {status}
        </span>
      </div>

      <div className="bg-black/20 rounded-xl p-3 min-h-[90px] flex flex-wrap gap-2 items-center justify-center border border-white/5">
        <AnimatePresence>
          {pods.map((pod) => (
            <ArchPod key={pod.id} name={pod.name} status={pod.status} cpu={pod.cpu} />
          ))}
          {pods.length === 0 && (
            <div className="text-gray-600 text-[10px] font-mono">No Active Pods</div>
          )}
        </AnimatePresence>
      </div>

      {/* Local flow to DB if active */}
      {!isFailed && pods.some(p => p.status === 'Healthy') && (
        <div className="flex justify-center mt-3 h-6">
          <svg className="w-4 h-full" viewBox="0 0 12 24">
            <path
              d="M 6 0 L 6 20"
              fill="none"
              stroke="#ec4899"
              strokeWidth="1.5"
              strokeDasharray="4,8"
              style={{
                strokeDashoffset: 12,
                animation: `flowVertical ${Math.max(0.5, 3 - (traffic / 100) * 2.5)}s linear infinite`,
              }}
            />
          </svg>
        </div>
      )}
    </div>
  );
}

export default function K8sArchitecture({ scaling }) {
  const {
    traffic = 20,
    podsList = [],
    nodeStatuses = { 'Worker Node 1': 'Active', 'Worker Node 2': 'Active' },
    clusterStatus = 'Healthy',
  } = scaling || {};

  // Split pods by node
  const node1Pods = podsList.filter(p => p.node === 'Worker Node 1');
  const node2Pods = podsList.filter(p => p.node === 'Worker Node 2');

  // Node active statuses
  const node1Active = nodeStatuses['Worker Node 1'] === 'Active';
  const node2Active = nodeStatuses['Worker Node 2'] === 'Active';

  // Overall architecture connection lines state
  const isNetworkFailure = scaling?.networkFailure || false;
  const isIngressActive = clusterStatus !== 'Node Down' && !isNetworkFailure;

  return (
    <section id="architecture" className="relative py-24 md:py-32 overflow-hidden">
      <div className="section-container">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-medium mb-6">
              <Box size={14} />
              Cluster Architecture
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Kubernetes <span className="gradient-text">Topography</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Real-time request routing visualization. Pod scaling dynamically balances traffic paths.
            </p>
          </motion.div>

          {/* Architecture Layout */}
          <motion.div variants={itemVariants} className="glass-card-strong p-6 md:p-10 border border-white/10 shadow-2xl relative">
            {/* Diagram Header */}
            <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${clusterStatus === 'Healthy' ? 'bg-green-500' : 'bg-amber-500'} animate-pulse`} />
                <span className="font-mono text-xs text-gray-300">k8s-cluster: lunch-rush-prod</span>
              </div>
              {isNetworkFailure && (
                <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-950/20 border border-red-500/30 px-2 py-0.5 rounded-full font-mono">
                  <ShieldAlert size={12} />
                  <span>NETWORK LATENCY INJECTED</span>
                </div>
              )}
            </div>

            {/* Ingress Stage (Horizontal flow in desktop, Vertical flow in mobile) */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mb-6">
              {/* Stage: Users */}
              <div className="glass-card p-4 text-center min-w-[120px] flex flex-col items-center border border-white/5 bg-white/[0.02]">
                <Globe size={28} className="text-blue-400 mb-2" />
                <span className="text-xs font-semibold text-gray-300">Users</span>
                <span className="text-[9px] text-gray-500 mt-0.5 font-mono">Public Internet</span>
              </div>

              {/* Connector: Users -> Load Balancer */}
              <div className="hidden md:block">
                <FlowConnector traffic={traffic} active={isIngressActive} direction="horizontal" color="#3b82f6" />
              </div>
              <div className="md:hidden">
                <FlowConnector traffic={traffic} active={isIngressActive} direction="vertical" color="#3b82f6" />
              </div>

              {/* Stage: Load Balancer */}
              <div className="glass-card p-4 text-center min-w-[140px] flex flex-col items-center border border-white/10">
                <Wifi size={28} className="text-primary-400 mb-2" />
                <span className="text-xs font-semibold text-primary-400">Nginx Ingress</span>
                <span className="text-[9px] text-gray-500 mt-0.5 font-mono">Load Balancer</span>
              </div>

              {/* Connector: Load Balancer -> K8s Service */}
              <div className="hidden md:block">
                <FlowConnector traffic={traffic} active={isIngressActive} direction="horizontal" color="#5c7cfa" />
              </div>
              <div className="md:hidden">
                <FlowConnector traffic={traffic} active={isIngressActive} direction="vertical" color="#5c7cfa" />
              </div>

              {/* Stage: K8s Service */}
              <div className="glass-card p-4 text-center min-w-[140px] flex flex-col items-center border border-white/10">
                <Server size={28} className="text-accent-400 mb-2" />
                <span className="text-xs font-semibold text-accent-400">Cluster IP Service</span>
                <span className="text-[9px] text-gray-500 mt-0.5 font-mono">Internal Proxy</span>
              </div>
            </div>

            {/* Routing branching flow lines from K8s Service to Worker Nodes */}
            <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto mb-2">
              <BranchFlow traffic={traffic} active={isIngressActive && node1Active} target="left" />
              <BranchFlow traffic={traffic} active={isIngressActive && node2Active} target="right" />
            </div>

            {/* Worker Nodes Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <K8sNode
                label="Worker Node 1"
                status={nodeStatuses['Worker Node 1']}
                pods={node1Pods}
                traffic={traffic}
              />
              <K8sNode
                label="Worker Node 2"
                status={nodeStatuses['Worker Node 2']}
                pods={node2Pods}
                traffic={traffic}
              />
            </div>

            {/* Persistent Storage Stage */}
            <div className="flex justify-center pt-2">
              <div className="glass-card p-4 text-center border border-pink-500/20 bg-pink-950/5 min-w-[160px] flex flex-col items-center">
                <DbIcon size={24} className="text-pink-400 mb-1.5" />
                <span className="text-xs font-bold text-pink-400">Database Engine</span>
                <span className="text-[9px] text-gray-500 mt-0.5 font-mono">Redis / PostgreSQL</span>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap items-center gap-6 justify-center text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded bg-green-500/20 border border-green-500/40" />
                <span>Healthy Pod (Routing active)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded bg-yellow-500/20 border border-yellow-500/40 animate-pulse" />
                <span>Pending (Bootstrapping container)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded bg-blue-500/20 border border-blue-500/40" />
                <span>Terminating (Graceful shutdown)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded bg-red-500/20 border border-red-500/40" />
                <span>Failed (OOM / Evicted)</span>
              </div>
            </div>
          </motion.div>

          {/* Concepts Grid */}
          <motion.div variants={itemVariants} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {[
              { term: 'Service Endpoints', desc: 'Kubernetes load-balances traffic across active, healthy pods matching the service selector labels.', icon: '🔗' },
              { term: 'Worker Node', desc: 'A node runs containerized application tasks. Nodes communicate with the cluster master plane.', icon: '🖥️' },
              { term: 'OOM Killed', desc: 'Out-Of-Memory termination. Pod exceeds memory limits, K8s kills and replaces it.', icon: '💀' },
              { term: 'Pod Eviction', desc: 'Moving workloads from a failed/offline node to healthy nodes automatically to restore state.', icon: '📦' },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="glass-card p-5 hover:bg-white/[0.07] transition-all duration-300 border border-white/5"
                whileHover={{ y: -4 }}
              >
                <span className="text-xl mb-3 block">{item.icon}</span>
                <h4 className="text-sm font-semibold text-white mb-1">{item.term}</h4>
                <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
