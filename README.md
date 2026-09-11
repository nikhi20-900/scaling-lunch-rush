# Scaling Lunch Rush

> **A real-time Kubernetes autoscaling and observability platform that demonstrates how applications scale under real traffic.**

[![React](https://img.shields.io/badge/React-18-blue?logo=react&logoColor=white)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-22-green?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-1.35-326CE5?logo=kubernetes&logoColor=white)](https://kubernetes.io/)
[![Docker](https://img.shields.io/badge/Docker-Container-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Prometheus](https://img.shields.io/badge/Prometheus-Monitoring-E6522C?logo=prometheus&logoColor=white)](https://prometheus.io/)
[![Grafana](https://img.shields.io/badge/Grafana-Observability-F46800?logo=grafana&logoColor=white)](https://grafana.com/)
[![k6](https://img.shields.io/badge/k6-Load%20Testing-7D64FF?logo=k6&logoColor=white)](https://k6.io/)

This project began as an educational Kubernetes autoscaling simulation and evolved into a **real infrastructure platform** powered by a containerized Node.js backend, Kubernetes Horizontal Pod Autoscaler (HPA), Metrics Server, Prometheus Operator, Grafana, and an interactive React control-plane dashboard.

> [!IMPORTANT]
> **THIS IS NOT A FRONTEND-ONLY SIMULATION.**
> 
> Real HTTP traffic causes real CPU pressure on containerized backend processes. Real CPU pressure causes the Kubernetes HPA to dynamically scale Pod replicas (`1 → 2 → 3 → 5`). Prometheus scrapes application-level metrics every 15 seconds. The React dashboard polls the Express backend to stream live cluster telemetry in real-time.

---

## Architecture Overview

```text
                    ┌─────────────────────┐
                    │   React Dashboard   │
                    │   Live Control UI   │
                    └──────────┬──────────┘
                               │
                          HTTP /api/*
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Node.js + Express   │
                    │ Backend / API       │
                    └───────┬───────┬─────┘
                            │       │
                     Prometheus     │ Kubernetes API
                            │       │ (In-Cluster RBAC)
                            ▼       ▼
                    ┌─────────────────────┐
                    │     Kubernetes      │
                    │                     │
                    │ Deployment (1–5)    │
                    │ ClusterIP Service   │
                    │ Backend Pods        │
                    │ HPA (Target: 50%)   │
                    └───────┬─────────────┘
                            │
                      Metrics Server
                            │
                            ▼
                           HPA
                            │
                            ▼
               Scales Pods: 1 → 2 → 3 → 5

                    Prometheus
                         │
                         ▼
                      Grafana

                         ▲
                         │
                    k6 Load Test
                         │
                         └── Real HTTP traffic
```

### Component Details

- **React Dashboard**: Modern web interface displaying both live Kubernetes telemetry and an educational simulation sandbox. Features a 3-second polling loop and direct test order generation.
- **Node.js Express Backend**: Containerized REST service instrumented with `prom-client`. Exposes `/api/health`, `/api/orders`, `/metrics`, `/api/metrics/summary`, and `/api/cluster/pods`.
- **Kubernetes Deployment & Service**: Manages backend Pod replicas in namespace `scaling-lunch-rush`. Routed via a ClusterIP service on port 3001.
- **Metrics Server**: Collects container CPU and memory resource metrics (`v1beta1.metrics.k8s.io`).
- **Horizontal Pod Autoscaler (HPA)**: Monitors backend CPU against a 50% target threshold (relative to `100m` CPU request) and dynamically adjusts replica count between 1 and 5.
- **Prometheus Operator Stack**: Scrapes application metrics via a `ServiceMonitor` every 15 seconds, storing metrics for HTTP rates, durations, orders, process CPU, and memory.
- **Grafana**: Visualizes metrics through pre-configured Prometheus datasources and dashboards.
- **k6 Load Generator**: Generates staged virtual user traffic against the backend to produce authentic CPU load.

---

## Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion, Recharts, Lucide Icons
- **Backend**: Node.js (ES Modules), Express, `prom-client` (v15.1)
- **Infrastructure**: Docker, Kubernetes (v1.35 via OrbStack), Kubernetes HPA, Metrics Server
- **Observability**: Prometheus, Prometheus Operator, Grafana, kube-state-metrics, node-exporter, `ServiceMonitor`
- **Testing & Load**: k6 (via containerized runner `grafana/k6`)

---

## Real Autoscaling Demonstration

During automated load testing, the platform demonstrated full end-to-end autoscaling:

1. **Baseline State (Pre-Load)**:
   - Replicas: `1 Pod` (`scaling-lunch-rush-backend-...`)
   - CPU Utilization: `~12%` (well below the 50% threshold)
   - Baseline Traffic: Idle (`~0.3 req/s`)
2. **Peak Traffic Generation (k6)**:
   - Target: `http://localhost:3001/api/health`
   - Peak Concurrent Virtual Users: `40 VUs`
   - Peak Observed Traffic: **`597.26 req/s`**
   - Total HTTP Requests Processed: **`46,508 requests`**
   - HTTP Error Rate: **`0.00%`** (0 failed requests)
   - p95 Request Latency: **`7.12 ms`**
3. **Autoscaling Reaction**:
   - HPA CPU Utilization reached **`78%`** (exceeding the `50%` target)
   - Kubernetes automatically scaled the Deployment: **`1 → 2 → 3 → 5 Pods`**
   - All 5 Pods entered `Running` and `Ready: true` states
4. **Post-Load Settling & Scale-Down**:
   - Traffic dropped immediately from `597 req/s` to `0.35 req/s`
   - Application CPU dropped to `<1%`
   - HPA recorded condition `ScaleDownStabilized` (applying the standard 5-minute Kubernetes stabilization window before scaling down to prevent flapping)

> **Note on Hardware Variability**:
> Exact scaling speed, peak CPU metrics, and replica progression depend on host hardware performance and virtualization overhead.

---

## Observability & Metrics Architecture

### Metrics Collected

- **Application Telemetry (via Prometheus & `prom-client`)**:
  - `http_requests_total`: Request count partitioned by route, method, and HTTP status code
  - `http_request_duration_seconds`: Histogram measuring latency buckets
  - `http_active_requests`: Gauge tracking currently in-flight requests
  - `http_errors_total`: Counter tracking error responses (`>= 400`)
  - `lunch_rush_orders_total`: Business metric tracking orders received
  - `process_cpu_seconds_total`: Real CPU user/system seconds consumed by Node.js
  - `process_resident_memory_bytes`: Physical resident memory (RSS) consumed
- **Cluster State (via `kube-state-metrics`)**:
  - `kube_horizontalpodautoscaler_status_current_replicas`
  - `kube_horizontalpodautoscaler_status_desired_replicas`
  - `kube_horizontalpodautoscaler_spec_target_metric` (CPU Target: 50%)
  - `kube_horizontalpodautoscaler_status_target_metric` (Actual CPU Utilization %)
  - `kube_pod_status_phase` (Running, Pending, Terminating)

### Key Distinction: Application CPU vs. HPA CPU Utilization

- **Application Process CPU (%)**: Measures the percentage of CPU core cycles consumed by the single Node.js runtime process (reported via `prom-client`).
- **HPA CPU Utilization (%)**: Measures the aggregate pod CPU usage compared against the Pod's declared CPU **request** (`resources.requests.cpu: 100m`). When the pod uses `78m` of CPU, HPA utilization is `78%`.

These metrics represent different operational dimensions and are deliberately separated in both the API and the React UI.

---

## Live Dashboard Features

The React control-plane connects to Express via a reverse proxy and provides:

- **Application CPU & Memory**: Live usage and memory consumption in megabytes.
- **HPA Status**: Current replicas, desired replicas, minimum/maximum boundaries, and CPU target.
- **Request Rate & Latency**: Requests per second and average response time in milliseconds.
- **Total Orders**: Business metrics incremented live and scraped by Prometheus.
- **Live Order Trigger**: Interactive button allowing users to trigger `POST /api/orders` and watch Prometheus metrics increment.
- **Kubernetes Pod Ecosystem**: Displays real pod names, readiness booleans, restart counts, and per-pod memory directly from the Kubernetes API.
- **Security Separation**: The browser communicates **only** with Express (`/api/*`). Prometheus and the Kubernetes API are never exposed to the public browser.

---

## Security & Least-Privilege RBAC

The backend pod runs using a dedicated Kubernetes `ServiceAccount`:

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: scaling-lunch-rush-backend-reader
  namespace: scaling-lunch-rush
rules:
  - apiGroups: [""]
    resources: ["pods"]
    verbs: ["get", "list", "watch"]
  - apiGroups: ["apps"]
    resources: ["deployments"]
    verbs: ["get", "list", "watch"]
  - apiGroups: ["autoscaling"]
    resources: ["horizontalpodautoscalers"]
    verbs: ["get", "list", "watch"]
```

- **Least Privilege**: The backend possesses strictly read-only access (`get`, `list`, `watch`).
- **Scope Restriction**: Access is confined strictly to the `scaling-lunch-rush` namespace.
- **No Mutating Access**: Write, create, update, and delete verbs are explicitly denied.
- **No Cluster Admin**: The service account cannot access cluster-scoped resources or other namespaces.
- **Token Protection**: In-cluster ServiceAccount credentials remain inside `/var/run/secrets/kubernetes.io/serviceaccount` and are never forwarded to the browser.

---

## Project Structure

```text
scaling-lunch-rush/
├── backend/                        # Node.js + Express backend service
│   ├── Dockerfile                  # Production Alpine container image definition
│   ├── package.json                # Dependencies: express, prom-client, cors
│   └── server.js                   # API endpoints, telemetry & in-cluster K8s client
├── k8s/                            # Kubernetes declarative manifests
│   ├── namespace.yaml              # Namespace: scaling-lunch-rush
│   ├── serviceaccount.yaml         # ServiceAccount: scaling-lunch-rush-backend
│   ├── role.yaml                   # Least-privilege read Role
│   ├── rolebinding.yaml            # RoleBinding linking SA and Role
│   ├── deployment.yaml             # Backend Deployment with resource requests/limits
│   ├── service.yaml                # ClusterIP Service on port 3001
│   ├── hpa.yaml                    # HPA configuration (1-5 pods, 50% CPU target)
│   └── servicemonitor.yaml         # Prometheus Operator CRD for automated scraping
├── load-test/                      # Real load-testing suite
│   ├── README.md                   # Instructions for load generation and monitoring
│   └── smoke.js                    # k6 staged virtual-user load script
├── src/                            # React control-plane frontend
│   ├── api/
│   │   └── infrastructure.js       # Typed API client targeting Express backend
│   ├── components/
│   │   ├── MetricsDashboard.jsx    # Live cluster telemetry & simulation toggle
│   │   ├── AutoScalingSimulation.jsx # Interactive simulation & real Pod grid
│   │   ├── HeroSection.jsx         # Case study overview
│   │   ├── K8sArchitecture.jsx     # Visual architecture topology
│   │   └── Navbar.jsx              # Status bar with "K8s Live" badge
│   ├── hooks/
│   │   ├── useLiveInfrastructure.js # 3-second polling hook with error handling
│   │   └── useAutoScaling.js       # Educational simulation state machine
│   ├── App.jsx                     # Root application coordinator
│   └── index.css                   # Custom styling & glassmorphism system
├── .env.example                    # Environment variable template
├── package.json                    # Frontend Vite build & dependencies
└── vite.config.js                  # Vite configuration with API reverse proxy
```

---

## Installation & Setup Guide

### Prerequisites

- [Node.js](https://nodejs.org/) v20+ and npm
- [Docker Desktop](https://www.docker.com/) or [OrbStack](https://orbstack.dev/)
- [kubectl](https://kubernetes.io/docs/tasks/tools/) configured with your local cluster context
- [Helm](https://helm.sh/) v3+
- [Metrics Server](https://github.com/kubernetes-sigs/metrics-server) installed on the cluster

### 1. Clone the Repository

```bash
git clone https://github.com/nikhi20-900/scaling-lunch-rush.git
cd scaling-lunch-rush
```

### 2. Install Dependencies

Install frontend dependencies:
```bash
npm install
```

Install backend dependencies:
```bash
cd backend && npm install && cd ..
```

### 3. Build the Backend Docker Image

```bash
docker build -t scaling-lunch-rush-backend:latest ./backend
```

### 4. Deploy Kubernetes Infrastructure

Apply manifests in dependency order:

```bash
# 1. Namespace
kubectl apply -f k8s/namespace.yaml

# 2. RBAC (ServiceAccount, Role, RoleBinding)
kubectl apply -f k8s/serviceaccount.yaml -f k8s/role.yaml -f k8s/rolebinding.yaml

# 3. Workload (Deployment & Service)
kubectl apply -f k8s/deployment.yaml -f k8s/service.yaml

# 4. Autoscaling (HPA)
kubectl apply -f k8s/hpa.yaml
```

Verify deployment:
```bash
kubectl get pods,svc,hpa -n scaling-lunch-rush
```

### 5. Observability Stack (Prometheus & Grafana)

The observability stack uses the official `kube-prometheus-stack` Helm chart:

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install monitoring prometheus-community/kube-prometheus-stack --namespace monitoring --create-namespace
```

Apply the `ServiceMonitor` so Prometheus automatically discovers the backend:
```bash
kubectl apply -f k8s/servicemonitor.yaml
```

### 6. Start Local Access & Frontend

In separate terminal tabs:

**Terminal 1 — Port-forward Backend:**
```bash
kubectl port-forward svc/scaling-lunch-rush-backend 3001:3001 -n scaling-lunch-rush
```

**Terminal 2 — Start Frontend Dashboard:**
```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 5-Minute Recruiter Demo

1. **Cluster Overview**: Run `kubectl get pods,hpa -n scaling-lunch-rush` to show 1 Pod running and HPA active with target `cpu: 50%`.
2. **Open Dashboard**: Navigate to `http://localhost:5173`. Point out the green **"K8s Live"** badge in the navbar and the **"Live Infrastructure Connected"** status in the Metrics Dashboard.
3. **Inspect Real Pod Data**: Highlight the pod card in the dashboard showing the exact pod name matching `kubectl get pods`.
4. **Trigger Business Event**: Click **"Send Live Order"** in the dashboard. Watch Prometheus scrape the order and increment the total order count.
5. **Start Load Test**: Run the k6 load generator:
   ```bash
   docker run --rm --net=host -i grafana/k6 run - < load-test/smoke.js
   ```
6. **Watch Real-Time Autoscaling**:
   - In terminal: Run `kubectl get hpa -n scaling-lunch-rush -w`
   - In browser: Watch the request rate surge to **`>500 rps`**, CPU surge past **`70%`**, and the pod counter update from **`1 → 2 → 3 → 5 pods`**.
7. **Verify Grafana**: Show Prometheus collecting metrics across all 5 pods dynamically.
8. **Explain Scale-Down**: After the test completes, explain Kubernetes HPA scale-down stabilization (5-minute cooldown window preventing pod thrashing).

---

## Troubleshooting

| Issue | Diagnosis Command | Common Solution |
|-------|-------------------|-----------------|
| HPA shows `<unknown>/50%` | `kubectl get apiservice v1beta1.metrics.k8s.io` | Ensure Metrics Server is running in `kube-system`. |
| Backend Pod not starting | `kubectl describe pod -l app=scaling-lunch-rush-backend -n scaling-lunch-rush` | Check image name and ensure `scaling-lunch-rush-backend:latest` was built in your local Docker/OrbStack daemon. |
| Dashboard shows "Unable to connect" | `curl -s http://localhost:3001/api/health` | Ensure `kubectl port-forward svc/scaling-lunch-rush-backend 3001:3001 -n scaling-lunch-rush` is running. |
| Prometheus not scraping backend | `kubectl get servicemonitor -n scaling-lunch-rush -o yaml` | Ensure `servicemonitor.yaml` has the label `release: monitoring` matching Prometheus's selector. |
| Pod count remains at 5 after load test | `kubectl describe hpa scaling-lunch-rush-backend -n scaling-lunch-rush` | HPA has a standard 5-minute cooldown (`ScaleDownStabilized`). Replicas will step down automatically once the window closes. |

---

## Environment Variables

| Variable | Scope | Default | Description |
|----------|-------|---------|-------------|
| `PORT` | Backend | `3001` | Port on which the Express server listens |
| `NODE_ENV` | Backend | `development` | Runtime environment mode |
| `PROMETHEUS_URL` | Backend | `http://localhost:9090` | Base URL for Prometheus instant queries (`http://monitoring-kube-prometheus-prometheus.monitoring:9090` in-cluster) |

---

## Educational Simulation vs. Live Infrastructure

To preserve the rich interactive visual storytelling while demonstrating real infrastructure:

- **Live Infrastructure Mode**: Displays real-time data from the Kubernetes API and Prometheus. Pod cards, HPA replica states, application CPU, and request volumes directly reflect live cluster operations.
- **Simulation Mode**: A client-side sandbox allowing users to experiment with hypothetical traffic spikes and chaos vectors (memory leaks, node outages) without affecting the Kubernetes cluster.

Both modes are clearly demarcated in the UI via mode toggles and indicators.

---

## What This Demonstrates (Engineering Learnings)

1. **Declarative Infrastructure**: Managing complete lifecycle resources through clean YAML manifests.
2. **Horizontal Pod Autoscaling**: Converting resource metrics into automated scaling decisions.
3. **Application Instrumentation**: Exporting real RED (Rate, Errors, Duration) metrics using `prom-client`.
4. **Service Discovery with Prometheus Operator**: Automated target acquisition via `ServiceMonitor` CRDs.
5. **Least-Privilege Security**: Custom `ServiceAccount`, `Role`, and `RoleBinding` granting minimal read permissions.
6. **Architectural Separation**: Decoupling internal cluster APIs from client-facing interfaces.
7. **Resilient Local Development**: Clean fallback handling when running outside Kubernetes.
8. **Controlled Performance Testing**: Validating system thresholds and saturation behavior using `k6`.
9. **Real-Time Data Streaming**: Synchronizing frontend client state with cluster infrastructure via controlled polling.
10. **Scale-Down Stabilization**: Understanding Kubernetes cooling-off windows to prevent resource flapping.

---

## Portfolio Summary

> Built a real-time Kubernetes autoscaling and observability platform that connects a React control-plane dashboard to a Node.js backend, Prometheus, Grafana, and Kubernetes HPA. Demonstrated real traffic-driven scaling from 1 to 5 replicas under controlled k6 load while streaming live CPU, request rate, latency, pod lifecycle, and HPA telemetry.
