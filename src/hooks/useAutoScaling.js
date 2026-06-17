import { useState, useEffect, useCallback, useRef } from 'react';

const MIN_PODS = 2;
const MAX_PODS = 12;
const SCALE_UP_THRESHOLD = 70;
const SCALE_DOWN_THRESHOLD = 30;
const TICK_INTERVAL = 800;

function generateLog(type, podCount, cpu) {
  const ts = new Date().toLocaleTimeString();
  const messages = {
    scaleUp: [
      `[${ts}] ⚡ HPA triggered: CPU ${cpu}% > ${SCALE_UP_THRESHOLD}% threshold → scaling up to ${podCount} pods`,
      `[${ts}] 🚀 Deployment scaled: replicas ${podCount - 1} → ${podCount}`,
      `[${ts}] 📦 New pod spinning up... container pulling image`,
    ],
    scaleDown: [
      `[${ts}] 📉 HPA: CPU ${cpu}% < ${SCALE_DOWN_THRESHOLD}% → scaling down to ${podCount} pods`,
      `[${ts}] 🔽 Terminating excess pod... graceful shutdown initiated`,
    ],
    steady: [
      `[${ts}] ✅ All ${podCount} pods healthy | CPU: ${cpu}% | Memory: ${Math.round(cpu * 0.6)}%`,
      `[${ts}] 📊 Metrics collected: ${podCount} pods, avg CPU ${cpu}%`,
      `[${ts}] 🔄 Load balancer distributing across ${podCount} endpoints`,
    ],
    crash: [
      `[${ts}] 🔥 CRITICAL: Server overload! CPU at ${cpu}%`,
      `[${ts}] ❌ ERROR: Request timeout - 503 Service Unavailable`,
      `[${ts}] 💀 Pod crash detected! OOMKilled - restarting...`,
    ],
  };
  const pool = messages[type] || messages.steady;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function useAutoScaling() {
  const [traffic, setTraffic] = useState(20);
  const [pods, setPods] = useState(MIN_PODS);
  const [cpu, setCpu] = useState(15);
  const [rps, setRps] = useState(50);
  const [isRunning, setIsRunning] = useState(true);
  const [k8sEnabled, setK8sEnabled] = useState(true);
  const [logs, setLogs] = useState([]);
  const [history, setHistory] = useState([]);
  const [crashCount, setCrashCount] = useState(0);
  const tickRef = useRef(0);

  const addLog = useCallback((msg) => {
    setLogs(prev => [msg, ...prev].slice(0, 50));
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      tickRef.current += 1;

      // Calculate CPU based on traffic and pod count
      const baseCpu = k8sEnabled
        ? Math.min(95, Math.round((traffic * 2.5) / Math.max(pods, 1)))
        : Math.min(100, Math.round(traffic * 1.8));

      const jitter = (Math.random() - 0.5) * 10;
      const newCpu = Math.max(5, Math.min(100, Math.round(baseCpu + jitter)));
      setCpu(newCpu);

      // RPS calculation
      const newRps = Math.round(traffic * 12 + (Math.random() - 0.5) * 30);
      setRps(Math.max(0, newRps));

      // Auto-scaling logic
      if (k8sEnabled) {
        setPods(prev => {
          let newPods = prev;
          if (newCpu > SCALE_UP_THRESHOLD && prev < MAX_PODS) {
            newPods = Math.min(MAX_PODS, prev + 1);
            addLog(generateLog('scaleUp', newPods, newCpu));
          } else if (newCpu < SCALE_DOWN_THRESHOLD && prev > MIN_PODS) {
            newPods = Math.max(MIN_PODS, prev - 1);
            addLog(generateLog('scaleDown', newPods, newCpu));
          } else if (tickRef.current % 4 === 0) {
            addLog(generateLog('steady', prev, newCpu));
          }
          return newPods;
        });
      } else {
        setPods(1);
        if (newCpu > 90) {
          setCrashCount(c => c + 1);
          addLog(generateLog('crash', 1, newCpu));
        } else if (tickRef.current % 3 === 0) {
          addLog(generateLog('steady', 1, newCpu));
        }
      }

      // History
      setHistory(prev => {
        const now = new Date();
        const time = `${now.getMinutes()}:${now.getSeconds().toString().padStart(2, '0')}`;
        const point = { time, cpu: newCpu, rps: newRps, pods: k8sEnabled ? undefined : 1, traffic };
        // pods will be set by the time history is read
        return [...prev.slice(-30), point];
      });
    }, TICK_INTERVAL);

    return () => clearInterval(interval);
  }, [isRunning, traffic, pods, k8sEnabled, addLog]);

  // Update history with current pod count
  useEffect(() => {
    setHistory(prev => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      updated[updated.length - 1] = { ...updated[updated.length - 1], pods };
      return updated;
    });
  }, [pods]);

  return {
    traffic,
    setTraffic,
    pods,
    cpu,
    rps,
    isRunning,
    setIsRunning,
    k8sEnabled,
    setK8sEnabled,
    logs,
    history,
    crashCount,
    MIN_PODS,
    MAX_PODS,
  };
}
