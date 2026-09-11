import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchMetricsSummary, fetchClusterPods, placeOrder } from '../api/infrastructure';

const POLL_INTERVAL = 3000; // 3 seconds

export function useLiveInfrastructure() {
  const [summary, setSummary] = useState(null);
  const [pods, setPods] = useState([]);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const isMountedRef = useRef(true);
  const consecutiveErrorsRef = useRef(0);

  const fetchData = useCallback(async () => {
    try {
      const [summaryData, podsData] = await Promise.all([
        fetchMetricsSummary(),
        fetchClusterPods().catch(err => {
          // If in local dev and 503 is returned, catch gracefully
          console.warn('Cluster pods query notice:', err.message);
          return null;
        }),
      ]);

      if (!isMountedRef.current) return;

      consecutiveErrorsRef.current = 0;
      setError(null);
      setIsLoading(false);
      setSummary(summaryData);
      setLastUpdated(new Date());

      if (podsData && Array.isArray(podsData)) {
        setPods(podsData);
      }

      // Add to rolling history (last 30 samples)
      const now = new Date();
      const timeStr = `${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      
      const appCpu = summaryData?.backend?.cpu !== null ? Number(summaryData.backend.cpu.toFixed(1)) : null;
      const hpaCpu = summaryData?.hpa?.currentCpuUtilization !== null ? Number(summaryData.hpa.currentCpuUtilization.toFixed(1)) : null;
      const podCount = summaryData?.backend?.pods !== null ? summaryData.backend.pods : (podsData ? podsData.length : null);
      const rps = summaryData?.backend?.requestsPerSecond !== null ? Number(summaryData.backend.requestsPerSecond.toFixed(1)) : null;

      setHistory(prev => [
        ...prev.slice(-29),
        {
          time: timeStr,
          appCpu,
          hpaCpu,
          pods: podCount,
          rps,
        }
      ]);
    } catch (err) {
      if (!isMountedRef.current) return;
      consecutiveErrorsRef.current += 1;
      // If we already have data, keep last successful data but set error status
      if (consecutiveErrorsRef.current >= 2) {
        setError('Unable to connect to infrastructure');
      }
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    fetchData();

    const timer = setInterval(() => {
      fetchData();
    }, POLL_INTERVAL);

    return () => {
      isMountedRef.current = false;
      clearInterval(timer);
    };
  }, [fetchData]);

  const sendLiveOrder = useCallback(async () => {
    try {
      await placeOrder();
      // Immediately trigger a poll
      fetchData();
      return true;
    } catch (err) {
      console.error('Failed to send live order:', err);
      throw err;
    }
  }, [fetchData]);

  return {
    summary,
    pods,
    history,
    isLoading,
    error,
    lastUpdated,
    sendLiveOrder,
    refresh: fetchData,
  };
}
