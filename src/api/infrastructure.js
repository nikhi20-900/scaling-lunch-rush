/**
 * Infrastructure API Client
 * Communicates strictly with the Express backend (/api/*)
 * Does NOT communicate directly with Prometheus or Kubernetes API.
 */

const API_BASE = ''; // Uses relative path with Vite proxy or window.location

export async function fetchMetricsSummary() {
  const res = await fetch(`${API_BASE}/api/metrics/summary`, {
    headers: { 'Accept': 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Metrics summary HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchClusterPods() {
  const res = await fetch(`${API_BASE}/api/cluster/pods`, {
    headers: { 'Accept': 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Cluster pods HTTP ${res.status}`);
  }
  return res.json();
}

export async function placeOrder() {
  const res = await fetch(`${API_BASE}/api/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ item: 'Lunch Combo', timestamp: Date.now() }),
  });
  if (!res.ok) {
    throw new Error(`Place order HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/api/health`, {
    headers: { 'Accept': 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Health check HTTP ${res.status}`);
  }
  return res.json();
}
