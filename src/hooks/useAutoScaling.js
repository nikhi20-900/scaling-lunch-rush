import { useState, useEffect, useCallback, useRef } from 'react';

const MIN_PODS = 2;
const MAX_PODS = 12;
const SCALE_UP_THRESHOLD = 70;
const SCALE_DOWN_THRESHOLD = 30;
const TICK_INTERVAL = 800;

let podIdCounter = 0;
function nextPodId() {
  podIdCounter += 1;
  return `pod-${podIdCounter}`;
}

function randomNodeAssignment(nodeStatuses) {
  const activeNodes = Object.entries(nodeStatuses)
    .filter(([, s]) => s === 'Active')
    .map(([name]) => name);
  if (activeNodes.length === 0) return 'Worker Node 1';
  return activeNodes[Math.floor(Math.random() * activeNodes.length)];
}

function createPod(nodeStatuses) {
  const id = nextPodId();
  return {
    id,
    name: `lunch-app-${id.split('-')[1]}`,
    status: 'Pending',
    cpu: 0,
    memory: 0,
    node: randomNodeAssignment(nodeStatuses),
    leak: false,
    pendingTicks: 0,
    terminatingTicks: 0,
  };
}

function generateLog(type, extra = {}) {
  const ts = new Date().toLocaleTimeString();
  const msgs = {
    scaleUp: [
      `[${ts}] ⚡ HPA triggered: CPU ${extra.cpu}% > ${SCALE_UP_THRESHOLD}% → scaling to ${extra.count} pods`,
      `[${ts}] 🚀 Deployment scaled: replicas → ${extra.count}`,
      `[${ts}] 📦 Pod ${extra.name || ''} spinning up... pulling image`,
    ],
    scaleDown: [
      `[${ts}] 📉 HPA: CPU ${extra.cpu}% < ${SCALE_DOWN_THRESHOLD}% → scaling to ${extra.count} pods`,
      `[${ts}] 🔽 Terminating pod ${extra.name || ''}... graceful shutdown`,
    ],
    steady: [
      `[${ts}] ✅ ${extra.count} pods healthy | CPU: ${extra.cpu}% | Mem: ${extra.mem || 0}%`,
      `[${ts}] 📊 Metrics: ${extra.count} pods, avg CPU ${extra.cpu}%`,
      `[${ts}] 🔄 Load balancer distributing across ${extra.count} endpoints`,
    ],
    crash: [
      `[${ts}] 🔥 CRITICAL: Server overload! CPU at ${extra.cpu}%`,
      `[${ts}] ❌ ERROR: Request timeout - 503 Service Unavailable`,
      `[${ts}] 💀 Pod crash detected! OOMKilled - restarting...`,
    ],
    podReady: [
      `[${ts}] ✅ Pod ${extra.name || ''} is Ready — containers started`,
    ],
    podFailed: [
      `[${ts}] 💀 Pod ${extra.name || ''} FAILED — ${extra.reason || 'unknown'}`,
    ],
    podTerminating: [
      `[${ts}] 🔽 Pod ${extra.name || ''} terminating — graceful shutdown`,
    ],
    nodeDown: [
      `[${ts}] 🚨 NODE DOWN: ${extra.node} — all pods evicted!`,
    ],
    nodeRecovered: [
      `[${ts}] ✅ NODE RECOVERED: ${extra.node} — accepting pods`,
    ],
    memoryLeak: [
      `[${ts}] ⚠️ Memory leak detected in ${extra.name || ''}: ${extra.mem}% used`,
    ],
    oomKill: [
      `[${ts}] 💀 OOMKilled: ${extra.name || ''} — memory exceeded 100%`,
    ],
    networkFailure: [
      `[${ts}] 🌐 NETWORK FAILURE: Latency spike + packet drops detected!`,
    ],
    networkRecovered: [
      `[${ts}] ✅ Network recovered — latency returning to normal`,
    ],
  };
  const pool = msgs[type] || msgs.steady;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function useAutoScaling() {
  const [traffic, setTraffic] = useState(20);
  const [podsList, setPodsList] = useState([]);
  const [cpu, setCpu] = useState(15);
  const [rps, setRps] = useState(50);
  const [isRunning, setIsRunning] = useState(true);
  const [k8sEnabled, setK8sEnabled] = useState(true);
  const [logs, setLogs] = useState([]);
  const [history, setHistory] = useState([]);
  const [crashCount, setCrashCount] = useState(0);
  const [nodeStatuses, setNodeStatuses] = useState({
    'Worker Node 1': 'Active',
    'Worker Node 2': 'Active',
  });
  const [networkFailure, setNetworkFailure] = useState(false);
  const networkFailureTicksRef = useRef(0);
  const tickRef = useRef(0);
  const initializedRef = useRef(false);

  // Derived values
  const healthyPods = podsList.filter(p => p.status === 'Healthy');
  const pods = healthyPods.length + podsList.filter(p => p.status === 'Pending').length;
  const activeNodeCount = Object.values(nodeStatuses).filter(s => s === 'Active').length;

  // Cluster status
  const clusterStatus = (() => {
    if (activeNodeCount === 0) return 'Node Down';
    if (Object.values(nodeStatuses).some(s => s === 'Failed')) return 'Degraded';
    if (cpu > 85) return 'Overloaded';
    return 'Healthy';
  })();

  const addLog = useCallback((msg) => {
    setLogs(prev => [msg, ...prev].slice(0, 50));
  }, []);

  // Initialize pods
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      const initial = [];
      for (let i = 0; i < MIN_PODS; i++) {
        const p = createPod({ 'Worker Node 1': 'Active', 'Worker Node 2': 'Active' });
        p.status = 'Healthy';
        p.cpu = 15;
        p.memory = 10;
        initial.push(p);
      }
      setPodsList(initial);
    }
  }, []);

  // Main simulation tick
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      tickRef.current += 1;

      setPodsList(prev => {
        let list = [...prev.map(p => ({ ...p }))];
        const healthy = list.filter(p => p.status === 'Healthy');
        const healthyCount = healthy.length;

        // Calculate base CPU based on traffic and healthy pod count
        const baseCpu = k8sEnabled
          ? Math.min(95, Math.round((traffic * 2.5) / Math.max(healthyCount, 1)))
          : Math.min(100, Math.round(traffic * 1.8));

        const jitter = (Math.random() - 0.5) * 10;
        const newCpu = Math.max(5, Math.min(100, Math.round(baseCpu + jitter)));
        setCpu(newCpu);

        // RPS
        const newRps = Math.round(traffic * 12 + (Math.random() - 0.5) * 30);
        setRps(Math.max(0, newRps));

        // Update individual pod metrics
        list.forEach(p => {
          if (p.status === 'Healthy') {
            const podJitter = (Math.random() - 0.5) * 15;
            p.cpu = Math.max(3, Math.min(98, Math.round(newCpu + podJitter)));
            if (p.leak) {
              p.memory = Math.min(100, p.memory + Math.round(8 + Math.random() * 7));
            } else {
              p.memory = Math.max(5, Math.min(85, Math.round(newCpu * 0.6 + (Math.random() - 0.5) * 10)));
            }
          }
        });

        // Handle memory leak OOMKill
        const leaking = list.filter(p => p.leak && p.memory >= 100);
        leaking.forEach(lp => {
          lp.status = 'Failed';
          lp.leak = false;
          addLog(generateLog('oomKill', { name: lp.name, mem: 100 }));
        });

        // Log memory leak progress
        const leakingInProgress = list.filter(p => p.leak && p.memory < 100 && p.memory > 60);
        leakingInProgress.forEach(lp => {
          if (tickRef.current % 2 === 0) {
            addLog(generateLog('memoryLeak', { name: lp.name, mem: lp.memory }));
          }
        });

        // Progress pending pods
        list.forEach(p => {
          if (p.status === 'Pending') {
            p.pendingTicks += 1;
            if (p.pendingTicks >= 2) {
              p.status = 'Healthy';
              p.cpu = newCpu;
              p.memory = Math.round(newCpu * 0.4);
              addLog(generateLog('podReady', { name: p.name }));
            }
          }
        });

        // Progress terminating pods
        list.forEach(p => {
          if (p.status === 'Terminating') {
            p.terminatingTicks += 1;
          }
        });
        list = list.filter(p => !(p.status === 'Terminating' && p.terminatingTicks >= 2));

        // Remove failed pods after 1 tick  
        const failedPods = list.filter(p => p.status === 'Failed');
        list = list.filter(p => p.status !== 'Failed');

        if (k8sEnabled) {
          const currentHealthy = list.filter(p => p.status === 'Healthy').length;
          const currentPending = list.filter(p => p.status === 'Pending').length;
          const currentTotal = currentHealthy + currentPending;

          // Replace failed pods
          failedPods.forEach(() => {
            if (currentTotal + list.filter(p => p.status === 'Pending').length < MAX_PODS) {
              const ns = {};
              Object.entries(nodeStatuses).forEach(([k, v]) => { ns[k] = v; });
              const newPod = createPod(ns);
              list.push(newPod);
            }
          });

          // Auto-scaling logic
          if (newCpu > SCALE_UP_THRESHOLD && currentTotal < MAX_PODS) {
            const ns = {};
            Object.entries(nodeStatuses).forEach(([k, v]) => { ns[k] = v; });
            const newPod = createPod(ns);
            list.push(newPod);
            addLog(generateLog('scaleUp', { cpu: newCpu, count: currentTotal + 1, name: newPod.name }));
          } else if (newCpu < SCALE_DOWN_THRESHOLD && currentTotal > MIN_PODS) {
            // Terminate oldest healthy pod
            const healthyList = list.filter(p => p.status === 'Healthy');
            if (healthyList.length > MIN_PODS) {
              const toTerminate = healthyList[0];
              toTerminate.status = 'Terminating';
              toTerminate.terminatingTicks = 0;
              addLog(generateLog('scaleDown', { cpu: newCpu, count: currentTotal - 1, name: toTerminate.name }));
              addLog(generateLog('podTerminating', { name: toTerminate.name }));
            }
          } else if (tickRef.current % 4 === 0) {
            addLog(generateLog('steady', { count: currentTotal, cpu: newCpu, mem: Math.round(newCpu * 0.6) }));
          }
        } else {
          // K8s OFF — single pod mode
          if (list.length > 1) {
            list = [list[0]];
            list[0].status = 'Healthy';
          }
          if (list.length === 0) {
            const ns = { 'Worker Node 1': 'Active', 'Worker Node 2': 'Active' };
            const p = createPod(ns);
            p.status = 'Healthy';
            list = [p];
          }
          list[0].cpu = newCpu;
          list[0].memory = Math.round(newCpu * 0.65);
          if (newCpu > 90) {
            setCrashCount(c => c + 1);
            addLog(generateLog('crash', { cpu: newCpu }));
          } else if (tickRef.current % 3 === 0) {
            addLog(generateLog('steady', { count: 1, cpu: newCpu, mem: Math.round(newCpu * 0.65) }));
          }
        }

        return list;
      });

      // Network failure auto-recovery
      if (networkFailure) {
        networkFailureTicksRef.current += 1;
        if (networkFailureTicksRef.current >= 10) {
          setNetworkFailure(false);
          networkFailureTicksRef.current = 0;
          addLog(generateLog('networkRecovered', {}));
        }
      }

      // History
      setHistory(prev => {
        const now = new Date();
        const time = `${now.getMinutes()}:${now.getSeconds().toString().padStart(2, '0')}`;
        return [...prev.slice(-30), { time, cpu: 0, rps: 0, pods: 0, traffic }];
      });
    }, TICK_INTERVAL);

    return () => clearInterval(interval);
  }, [isRunning, traffic, k8sEnabled, addLog, networkFailure, nodeStatuses]);

  // Sync history with latest values
  useEffect(() => {
    setHistory(prev => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      updated[updated.length - 1] = { ...updated[updated.length - 1], pods, cpu, rps };
      return updated;
    });
  }, [pods, cpu, rps]);

  // --- Chaos Actions ---

  const killPod = useCallback((id) => {
    setPodsList(prev => {
      const updated = prev.map(p => ({ ...p }));
      const target = updated.find(p => p.id === id && p.status === 'Healthy');
      if (target) {
        target.status = 'Failed';
        addLog(generateLog('podFailed', { name: target.name, reason: 'Killed by chaos action' }));
      }
      return updated;
    });
  }, [addLog]);

  const killRandomPod = useCallback(() => {
    setPodsList(prev => {
      const healthy = prev.filter(p => p.status === 'Healthy');
      if (healthy.length === 0) return prev;
      const target = healthy[Math.floor(Math.random() * healthy.length)];
      const updated = prev.map(p => {
        if (p.id === target.id) {
          addLog(generateLog('podFailed', { name: p.name, reason: 'Killed by chaos action' }));
          return { ...p, status: 'Failed' };
        }
        return { ...p };
      });
      return updated;
    });
  }, [addLog]);

  const killNode = useCallback((nodeName) => {
    setNodeStatuses(prev => ({ ...prev, [nodeName]: 'Failed' }));
    addLog(generateLog('nodeDown', { node: nodeName }));
    setPodsList(prev => {
      return prev.map(p => {
        if (p.node === nodeName && (p.status === 'Healthy' || p.status === 'Pending')) {
          addLog(generateLog('podFailed', { name: p.name, reason: `Node ${nodeName} down` }));
          return { ...p, status: 'Failed' };
        }
        return { ...p };
      });
    });
  }, [addLog]);

  const recoverNode = useCallback((nodeName) => {
    setNodeStatuses(prev => ({ ...prev, [nodeName]: 'Active' }));
    addLog(generateLog('nodeRecovered', { node: nodeName }));
  }, [addLog]);

  const simulateMemoryLeak = useCallback(() => {
    setPodsList(prev => {
      const healthy = prev.filter(p => p.status === 'Healthy' && !p.leak);
      if (healthy.length === 0) return prev;
      const target = healthy[Math.floor(Math.random() * healthy.length)];
      addLog(`[${new Date().toLocaleTimeString()}] ⚠️ Injecting memory leak into ${target.name}...`);
      return prev.map(p =>
        p.id === target.id ? { ...p, leak: true, memory: Math.max(p.memory, 50) } : { ...p }
      );
    });
  }, [addLog]);

  const simulateNetworkFailure = useCallback(() => {
    setNetworkFailure(true);
    networkFailureTicksRef.current = 0;
    addLog(generateLog('networkFailure', {}));
  }, [addLog]);

  return {
    traffic,
    setTraffic,
    pods,
    podsList,
    cpu,
    rps,
    isRunning,
    setIsRunning,
    k8sEnabled,
    setK8sEnabled,
    logs,
    history,
    crashCount,
    nodeStatuses,
    clusterStatus,
    networkFailure,
    killPod,
    killRandomPod,
    killNode,
    recoverNode,
    simulateMemoryLeak,
    simulateNetworkFailure,
    MIN_PODS,
    MAX_PODS,
  };
}
