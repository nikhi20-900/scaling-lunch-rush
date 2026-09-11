import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * Scaling Lunch Rush - Controlled HPA Load Test Script
 *
 * Target: /api/health endpoint of the Node.js backend.
 * Purpose: Generate controlled HTTP traffic to exert CPU pressure on the backend pod,
 *          triggering Kubernetes Horizontal Pod Autoscaler (HPA) scaling (target: 50% CPU).
 *
 * Configuration:
 * - Target URL: Configurable via TARGET_URL environment variable (default: http://localhost:3001/api/health)
 * - Stages:
 *   1. 15s ramp-up to 10 VUs (initial traffic)
 *   2. 30s ramp-up to 30 VUs (moderate lunch rush)
 *   3. 45s sustained at 40 VUs (peak lunch rush to trigger HPA scaling)
 *   4. 15s ramp-down to 0 VUs (graceful cooldown)
 * - Total duration: ~1m 45s
 *
 * Safe Termination:
 * Press Ctrl+C at any time to safely terminate the test early.
 */

const TARGET_URL = __ENV.TARGET_URL || 'http://localhost:3001/api/health';

export const options = {
  stages: [
    { duration: '15s', target: 10 }, // Ramp up to 10 VUs
    { duration: '30s', target: 30 }, // Ramp up to 30 VUs
    { duration: '45s', target: 40 }, // Peak lunch rush load at 40 VUs
    { duration: '15s', target: 0 },  // Cooldown
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'], // HTTP errors should be less than 5%
    http_req_duration: ['p(95)<500'], // 95% of requests should complete within 500ms
  },
};

export default function () {
  const res = http.get(TARGET_URL);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'service is backend': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.service === 'scaling-lunch-rush-backend';
      } catch (e) {
        return false;
      }
    },
  });

  // Short pacing to keep requests flowing while remaining controllable
  sleep(0.05);
}
