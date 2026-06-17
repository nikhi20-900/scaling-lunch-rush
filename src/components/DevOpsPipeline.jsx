import { motion } from 'framer-motion';
import { GitBranch, Container, Cloud, Rocket, CheckCircle, ArrowRight } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const pipelineSteps = [
  {
    icon: <GitBranch size={28} />,
    title: 'GitHub',
    desc: 'Developer pushes code to main branch',
    detail: 'git push origin main',
    color: 'from-gray-500 to-gray-400',
    borderColor: 'border-gray-500/30',
  },
  {
    icon: <CheckCircle size={28} />,
    title: 'CI/CD Pipeline',
    desc: 'GitHub Actions runs tests & builds',
    detail: 'npm test && npm run build',
    color: 'from-blue-500 to-cyan-500',
    borderColor: 'border-blue-500/30',
  },
  {
    icon: <Container size={28} />,
    title: 'Docker',
    desc: 'Build & push container image',
    detail: 'docker build -t app:v2.1 .',
    color: 'from-sky-500 to-blue-500',
    borderColor: 'border-sky-500/30',
  },
  {
    icon: <Cloud size={28} />,
    title: 'Registry',
    desc: 'Push to container registry',
    detail: 'docker push ghcr.io/app:v2.1',
    color: 'from-purple-500 to-violet-500',
    borderColor: 'border-purple-500/30',
  },
  {
    icon: <Rocket size={28} />,
    title: 'K8s Deploy',
    desc: 'Rolling update with zero downtime',
    detail: 'kubectl rollout restart deploy',
    color: 'from-green-500 to-emerald-500',
    borderColor: 'border-green-500/30',
  },
];

export default function DevOpsPipeline() {
  return (
    <section id="pipeline" className="relative py-24 md:py-32">
      <div className="section-container">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-6">
              <Rocket size={14} />
              DevOps Pipeline
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              CI/CD <span className="gradient-text">Pipeline</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              From code commit to production deployment — fully automated with zero downtime.
            </p>
          </motion.div>

          {/* Pipeline Flow */}
          <motion.div variants={itemVariants} className="glass-card-strong p-6 md:p-10">
            {/* Desktop horizontal */}
            <div className="hidden lg:flex items-center justify-between gap-2">
              {pipelineSteps.map((step, i) => (
                <div key={i} className="flex items-center gap-2">
                  <motion.div
                    className={`glass-card p-6 text-center min-w-[160px] ${step.borderColor} hover:bg-white/[0.07] transition-all duration-300`}
                    whileHover={{ y: -8, scale: 1.05 }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.15 }}
                    viewport={{ once: true }}
                  >
                    <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${step.color} p-3 text-white mb-3`}>
                      {step.icon}
                    </div>
                    <h4 className="font-semibold text-sm mb-1">{step.title}</h4>
                    <p className="text-xs text-gray-500 mb-2">{step.desc}</p>
                    <code className="text-[10px] text-primary-400 bg-primary-500/5 px-2 py-1 rounded font-mono">
                      {step.detail}
                    </code>
                  </motion.div>
                  {i < pipelineSteps.length - 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.15 + 0.1 }}
                      viewport={{ once: true }}
                    >
                      <ArrowRight size={20} className="text-gray-600" />
                    </motion.div>
                  )}
                </div>
              ))}
            </div>

            {/* Mobile vertical */}
            <div className="lg:hidden space-y-4">
              {pipelineSteps.map((step, i) => (
                <div key={i}>
                  <motion.div
                    className={`glass-card p-5 flex items-center gap-4 ${step.borderColor}`}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} p-2.5 text-white flex-shrink-0`}>
                      {step.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{step.title}</h4>
                      <p className="text-xs text-gray-500">{step.desc}</p>
                      <code className="text-[10px] text-primary-400">{step.detail}</code>
                    </div>
                  </motion.div>
                  {i < pipelineSteps.length - 1 && (
                    <div className="flex justify-center py-1">
                      <div className="w-px h-6 bg-gradient-to-b from-gray-600 to-transparent" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* YAML snippet */}
          <motion.div variants={itemVariants} className="mt-8 glass-card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <span className="text-xs font-mono text-gray-500">deployment.yaml</span>
            </div>
            <pre className="text-xs md:text-sm font-mono text-gray-300 overflow-x-auto leading-relaxed">
              <code>{`apiVersion: apps/v1
kind: Deployment
metadata:
  name: lunch-rush-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: lunch-rush
  template:
    spec:
      containers:
      - name: api
        image: ghcr.io/lunch-rush:latest
        resources:
          requests:
            cpu: "250m"
            memory: "256Mi"
          limits:
            cpu: "500m"
            memory: "512Mi"
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: lunch-rush-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: lunch-rush-api
  minReplicas: 2
  maxReplicas: 12
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70`}</code>
            </pre>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
