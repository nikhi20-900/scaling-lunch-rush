import express from 'express';
import cors from 'cors';
import client from 'prom-client';
import fs from 'node:fs';
import https from 'node:https';

const app = express();
const PORT = process.env.PORT || 3001;
const PROMETHEUS_URL = process.env.PROMETHEUS_URL || 'http://localhost:9090';

// Collect default Node.js process and runtime metrics
client.collectDefaultMetrics();

// Application metrics
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const httpRequestDurationSeconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
});

const httpActiveRequests = new client.Gauge({
  name: 'http_active_requests',
  help: 'Number of currently active HTTP requests'
});

const httpErrorsTotal = new client.Counter({
  name: 'http_errors_total',
  help: 'Total number of HTTP error responses (status >= 400)',
  labelNames: ['method', 'route', 'status_code']
});

const lunchRushOrdersTotal = new client.Counter({
  name: 'lunch_rush_orders_total',
  help: 'Total number of lunch rush orders received'
});

const lunchRushOrderProcessingSeconds = new client.Histogram({
  name: 'lunch_rush_order_processing_seconds',
  help: 'Duration of lunch rush order processing in seconds',
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1]
});

// Enable CORS
app.use(cors());

// Enable JSON request parsing
app.use(express.json());

// HTTP instrumentation middleware
app.use((req, res, next) => {
  // Exclude /metrics and cluster polling endpoints from application telemetry
  if (req.path === '/metrics' || req.path === '/api/metrics/summary' || req.path === '/api/cluster/pods') {
    return next();
  }

  httpActiveRequests.inc();
  const start = process.hrtime();

  res.on('finish', () => {
    httpActiveRequests.dec();

    const diff = process.hrtime(start);
    const durationInSeconds = diff[0] + diff[1] / 1e9;
    const route = req.baseUrl + (req.route?.path || req.path);
    const statusCode = res.statusCode.toString();

    httpRequestsTotal.inc({
      method: req.method,
      route,
      status_code: statusCode
    });

    httpRequestDurationSeconds.observe(
      {
        method: req.method,
        route,
        status_code: statusCode
      },
      durationInSeconds
    );

    if (res.statusCode >= 400) {
      httpErrorsTotal.inc({
        method: req.method,
        route,
        status_code: statusCode
      });
    }
  });

  next();
});

// Helper for querying Prometheus instant query API
async function queryPrometheus(query) {
  const url = `${PROMETHEUS_URL}/api/v1/query?query=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) {
      console.error(`Prometheus query "${query}" failed with HTTP ${res.status}`);
      return null;
    }
    const body = await res.json();
    if (body.status !== 'success') {
      console.error(`Prometheus query "${query}" returned unsuccessful status:`, body.error);
      return null;
    }
    return body.data?.result || [];
  } catch (err) {
    console.error(`Prometheus query error for "${query}":`, err.message);
    return null;
  }
}

function extractScalarValue(result) {
  if (!result || !Array.isArray(result) || result.length === 0) {
    return null;
  }
  const valStr = result[0]?.value?.[1];
  if (valStr === undefined || valStr === null) {
    return null;
  }
  const parsed = parseFloat(valStr);
  return Number.isFinite(parsed) ? parsed : null;
}

// Helper for querying Kubernetes API in-cluster
const K8S_TOKEN_PATH = '/var/run/secrets/kubernetes.io/serviceaccount/token';
const K8S_CA_PATH = '/var/run/secrets/kubernetes.io/serviceaccount/ca.crt';

function hasKubernetesInClusterConfig() {
  return fs.existsSync(K8S_TOKEN_PATH) && fs.existsSync(K8S_CA_PATH);
}

async function getKubernetesPods() {
  if (!hasKubernetesInClusterConfig()) {
    const err = new Error('Kubernetes in-cluster access unavailable in local environment');
    err.statusCode = 503;
    throw err;
  }

  const token = fs.readFileSync(K8S_TOKEN_PATH, 'utf8').trim();
  const ca = fs.readFileSync(K8S_CA_PATH);
  const k8sHost = process.env.KUBERNETES_SERVICE_HOST || 'kubernetes.default.svc';
  const k8sPort = process.env.KUBERNETES_SERVICE_PORT || '443';

  const path = `/api/v1/namespaces/scaling-lunch-rush/pods?labelSelector=${encodeURIComponent('app=scaling-lunch-rush-backend')}`;

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: k8sHost,
      port: k8sPort,
      path,
      method: 'GET',
      ca,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      timeout: 5000,
    }, (res) => {
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          const err = new Error(`Kubernetes API returned HTTP ${res.statusCode}: ${rawData}`);
          err.statusCode = res.statusCode;
          return reject(err);
        }
        try {
          const parsed = JSON.parse(rawData);
          const pods = (parsed.items || []).map((item) => {
            const isTerminating = Boolean(item.metadata?.deletionTimestamp);
            const readyCondition = (item.status?.conditions || []).find((c) => c.type === 'Ready');
            const isReady = !isTerminating && (readyCondition ? readyCondition.status === 'True' : false);
            const containerStatus = (item.status?.containerStatuses || [])[0];
            const restarts = containerStatus ? containerStatus.restartCount : 0;
            const status = isTerminating ? 'Terminating' : (item.status?.phase || 'Unknown');
            return {
              name: item.metadata.name,
              status,
              ready: isReady,
              restarts,
              node: item.spec?.nodeName || null,
              startTime: item.status?.startTime || null,
            };
          });
          resolve(pods);
        } catch (parseErr) {
          reject(parseErr);
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Kubernetes API request timed out'));
    });
    req.end();
  });
}

// Health check endpoint (preserved contract)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'scaling-lunch-rush-backend',
    timestamp: new Date().toISOString()
  });
});

// Orders endpoint for demo telemetry
app.post('/api/orders', (req, res) => {
  const start = process.hrtime();
  lunchRushOrdersTotal.inc();
  const diff = process.hrtime(start);
  const durationInSeconds = diff[0] + diff[1] / 1e9;
  lunchRushOrderProcessingSeconds.observe(durationInSeconds);

  res.json({
    status: 'accepted'
  });
});

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  } catch (err) {
    res.status(500).end(err.message);
  }
});

// Infrastructure metrics summary endpoint
app.get('/api/metrics/summary', async (req, res) => {
  try {
    const [
      cpuRes,
      memoryRes,
      podsRes,
      rpsRes,
      errorRateRes,
      ordersRes,
      latencyRes,
      hpaCurrentRes,
      hpaDesiredRes,
      hpaMinRes,
      hpaMaxRes,
      hpaCpuTargetRes,
      hpaCurrentCpuRes
    ] = await Promise.all([
      queryPrometheus('sum(rate(process_cpu_seconds_total{namespace="scaling-lunch-rush"}[1m])) * 100'),
      queryPrometheus('sum(process_resident_memory_bytes{namespace="scaling-lunch-rush"})'),
      queryPrometheus('count(kube_pod_status_phase{namespace="scaling-lunch-rush",phase="Running",pod=~"scaling-lunch-rush-backend-.*"} == 1)'),
      queryPrometheus('sum(rate(http_requests_total{namespace="scaling-lunch-rush"}[1m]))'),
      queryPrometheus('sum(rate(http_errors_total{namespace="scaling-lunch-rush"}[1m]))'),
      queryPrometheus('sum(lunch_rush_orders_total{namespace="scaling-lunch-rush"})'),
      queryPrometheus('sum(rate(http_request_duration_seconds_sum{namespace="scaling-lunch-rush"}[1m])) / sum(rate(http_request_duration_seconds_count{namespace="scaling-lunch-rush"}[1m]))'),
      queryPrometheus('kube_horizontalpodautoscaler_status_current_replicas{horizontalpodautoscaler="scaling-lunch-rush-backend"}'),
      queryPrometheus('kube_horizontalpodautoscaler_status_desired_replicas{horizontalpodautoscaler="scaling-lunch-rush-backend"}'),
      queryPrometheus('kube_horizontalpodautoscaler_spec_min_replicas{horizontalpodautoscaler="scaling-lunch-rush-backend"}'),
      queryPrometheus('kube_horizontalpodautoscaler_spec_max_replicas{horizontalpodautoscaler="scaling-lunch-rush-backend"}'),
      queryPrometheus('kube_horizontalpodautoscaler_spec_target_metric{horizontalpodautoscaler="scaling-lunch-rush-backend",metric_name="cpu"}'),
      queryPrometheus('kube_horizontalpodautoscaler_status_target_metric{horizontalpodautoscaler="scaling-lunch-rush-backend",metric_name="cpu",metric_target_type="utilization"}')
    ]);

    const summary = {
      timestamp: new Date().toISOString(),
      backend: {
        cpu: extractScalarValue(cpuRes), // Application Process CPU %
        memory: extractScalarValue(memoryRes), // Memory in bytes
        pods: extractScalarValue(podsRes) !== null ? Math.round(extractScalarValue(podsRes)) : null,
        requestsPerSecond: extractScalarValue(rpsRes),
        errorRate: extractScalarValue(errorRateRes),
        orders: extractScalarValue(ordersRes) !== null ? Math.round(extractScalarValue(ordersRes)) : null,
        requestLatency: extractScalarValue(latencyRes) !== null ? extractScalarValue(latencyRes) * 1000 : null // converted to milliseconds
      },
      hpa: {
        currentReplicas: extractScalarValue(hpaCurrentRes) !== null ? Math.round(extractScalarValue(hpaCurrentRes)) : null,
        desiredReplicas: extractScalarValue(hpaDesiredRes) !== null ? Math.round(extractScalarValue(hpaDesiredRes)) : null,
        minReplicas: extractScalarValue(hpaMinRes) !== null ? Math.round(extractScalarValue(hpaMinRes)) : null,
        maxReplicas: extractScalarValue(hpaMaxRes) !== null ? Math.round(extractScalarValue(hpaMaxRes)) : null,
        cpuTarget: extractScalarValue(hpaCpuTargetRes) !== null ? Math.round(extractScalarValue(hpaCpuTargetRes)) : null,
        currentCpuUtilization: extractScalarValue(hpaCurrentCpuRes) !== null ? extractScalarValue(hpaCurrentCpuRes) : null
      }
    };

    res.json(summary);
  } catch (err) {
    console.error('Error fetching infrastructure summary:', err);
    res.status(500).json({ error: 'Failed to retrieve metrics summary', details: err.message });
  }
});

// Pod information endpoint
app.get('/api/cluster/pods', async (req, res) => {
  try {
    const k8sPods = await getKubernetesPods();

    // Query per-pod CPU and memory from Prometheus to enrich pod data
    const [podCpuRes, podMemRes] = await Promise.all([
      queryPrometheus('rate(process_cpu_seconds_total{namespace="scaling-lunch-rush"}[1m]) * 100'),
      queryPrometheus('process_resident_memory_bytes{namespace="scaling-lunch-rush"}')
    ]);

    const podCpuMap = {};
    if (podCpuRes && Array.isArray(podCpuRes)) {
      podCpuRes.forEach((item) => {
        const podName = item.metric?.pod;
        const val = parseFloat(item.value?.[1]);
        if (podName && Number.isFinite(val)) {
          podCpuMap[podName] = val;
        }
      });
    }

    const podMemMap = {};
    if (podMemRes && Array.isArray(podMemRes)) {
      podMemRes.forEach((item) => {
        const podName = item.metric?.pod;
        const val = parseFloat(item.value?.[1]);
        if (podName && Number.isFinite(val)) {
          podMemMap[podName] = val;
        }
      });
    }

    const enrichedPods = k8sPods.map((p) => ({
      name: p.name,
      status: p.status,
      ready: p.ready,
      restarts: p.restarts,
      cpu: podCpuMap[p.name] !== undefined ? podCpuMap[p.name] : null,
      memory: podMemMap[p.name] !== undefined ? podMemMap[p.name] : null,
      node: p.node,
      startTime: p.startTime,
    }));

    res.json(enrichedPods);
  } catch (err) {
    if (err.statusCode === 503) {
      return res.status(503).json({
        error: 'Kubernetes in-cluster access unavailable in local environment',
        message: err.message
      });
    }
    console.error('Error fetching cluster pods:', err);
    res.status(500).json({ error: 'Failed to retrieve cluster pods', details: err.message });
  }
});

const server = app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
});

