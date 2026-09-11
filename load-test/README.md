# Scaling Lunch Rush — Load Testing & Live HPA Scaling

This directory contains the controlled load-testing suite for demonstrating **Kubernetes Horizontal Pod Autoscaler (HPA)** behavior under simulated lunch rush traffic.

---

## Architecture Overview

```text
k6 Load Generator
       │
       ▼ (HTTP GET /api/health)
localhost:3001 (port-forwarded)
       │
       ▼
Kubernetes ClusterIP Service (scaling-lunch-rush-backend:3001)
       │
       ▼
Backend Pod(s) [scaling-lunch-rush-backend]
       │
       ▼ (CPU metrics scraped every 15s)
Metrics Server ───► Kubernetes HPA (Target: 50% CPU)
                          │
                          ▼ (Scales Deployment 1 → 2 → 3+ replicas)
                     Kubernetes API
```

---

## Prerequisites

1. **Kubernetes Cluster**: Active with `scaling-lunch-rush-backend` deployment and HPA running in namespace `scaling-lunch-rush`.
2. **Metrics Server**: Running in `kube-system` (`v1beta1.metrics.k8s.io` Available).
3. **Execution Tool**:
   - If `k6` is installed locally: `k6 run load-test/smoke.js`
   - If `k6` is not installed locally: run via Docker without system-wide package installation:
     ```bash
     docker run --rm --net=host -i grafana/k6 run - < load-test/smoke.js
     ```

---

## Step-by-Step Instructions

### 1. Start the Port-Forward

In a dedicated terminal, expose the backend Service locally:

```bash
kubectl port-forward service/scaling-lunch-rush-backend 3001:3001 -n scaling-lunch-rush
```

Verify reachability:

```bash
curl -s http://localhost:3001/api/health
# Expected: {"status":"healthy","service":"scaling-lunch-rush-backend",...}
```

### 2. Monitor Cluster State (Open in separate terminals)

Watch the HPA:
```bash
kubectl get hpa scaling-lunch-rush-backend -n scaling-lunch-rush -w
```

Watch the Pods:
```bash
kubectl get pods -n scaling-lunch-rush -w
```

Check real-time CPU and memory usage:
```bash
kubectl top pods -n scaling-lunch-rush
```

### 3. Run the Controlled Load Test

Run with Docker (no installation needed):
```bash
docker run --rm --net=host -i grafana/k6 run - < load-test/smoke.js
```

Or run with native `k6` if installed:
```bash
k6 run load-test/smoke.js
```

To stop the test safely at any point, press `Ctrl+C`.

---

## Load Stages & Expected Behavior

| Stage | Duration | Target VUs | Purpose |
|-------|----------|------------|---------|
| 1     | 15s      | 10 VUs     | Warm-up and baseline traffic |
| 2     | 30s      | 30 VUs     | Ramp-up to create CPU pressure |
| 3     | 45s      | 40 VUs     | Peak sustained load to exceed HPA 50% target |
| 4     | 15s      | 0 VUs      | Graceful cooldown |

> **Note on HPA Behavior**:
> HPA scaling depends on actual CPU pressure relative to the requested CPU limit (`requests.cpu: 100m`). Scaling thresholds may trigger faster or slower depending on host hardware performance and virtualization overhead. The HPA evaluates metrics every 15 seconds. After load ceases, the HPA scale-down stabilization window (~5 minutes by default) will gradually scale replicas back down to 1.
