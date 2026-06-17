LunchRush v2 - UX & Simulation Upgrade

Goal

Transform the project from a static Kubernetes dashboard into an interactive DevOps simulation where users can actively stress, break, and recover the system.

Do not redesign the entire application. Extend the existing architecture and reuse current components where possible.

⸻

1. Chaos Testing Module

Add a new “Chaos Engineering” section below the simulator.

Actions

* Kill Pod
* Kill Worker Node
* Simulate Memory Leak
* Simulate Network Failure

Behaviour

Kill Pod:

* Random pod enters Terminating state.
* Remove pod after animation.
* Kubernetes automatically creates replacement pod.
* Log recovery events.

Kill Node:

* Entire worker node becomes unhealthy.
* All pods on node disappear.
* Remaining node handles traffic.
* Kubernetes recreates pods.

Event Log Examples

[CHAOS] Pod-3 terminated
[K8S] Failure detected
[K8S] Scheduling replacement pod
[K8S] Pod-8 ready
[SYSTEM] Traffic restored

⸻

2. Architecture Visualization Upgrade

Replace static architecture diagram.

Current

Users → Load Balancer → Service → Nodes → Database

New

Animate traffic packets moving through system.

Show:

Users
↓
Load Balancer
↓
K8s Service
↓
Worker Nodes
↓
Pods
↓
Database

Requirements

* Moving request particles.
* Packet flow speed increases with traffic.
* Traffic visually distributes across pods.
* Failed pods stop receiving traffic.
* New pods immediately start receiving traffic.

⸻

3. Intelligent Pod Cards

Replace simple pod boxes.

Each pod should display:

Pod Name
CPU %
Memory %
Status

Example

Pod-1

CPU: 52%
Memory: 34%
Status: Healthy

States

Healthy
Scaling
Pending
Terminating
Failed

Animations

Creating:
Pulling Image
Starting Container
Ready

Terminating:
Graceful Shutdown
Removed

Use color-coded states.

Green = Healthy
Yellow = Pending
Red = Failed

⸻

4. Before vs After Comparison

Add side-by-side comparison section.

Title:

Without Kubernetes vs With Kubernetes

Left Side

Monolithic System

Metrics

CPU
Latency
Requests
Status

Right Side

Kubernetes Cluster

Metrics

CPU
Latency
Pods
Status

Behaviour

Connect comparison to traffic slider.

As traffic increases:

Without K8s:

* CPU reaches 100%
* Latency spikes
* System crashes

With K8s:

* Pods scale automatically
* CPU stabilizes
* System remains healthy

Goal:
Users instantly understand the benefit of Kubernetes.

⸻

5. Hero Section Redesign

Replace landing-page marketing hero.

Current hero feels static.

New Hero

Live System Status Dashboard

Display:

Traffic
CPU
Active Pods
Cluster Status

Example

Traffic: 8,421 req/sec
CPU: 58%
Pods: 7
Status: Healthy

Live Events

Show real-time updates:

Scaling Pod-5
Scaling Pod-6
Load Balanced
Traffic Surge Detected

Requirements

* Use real simulation data.
* Update continuously.
* Hero should immediately demonstrate system behaviour before user scrolls.

⸻

UI Improvements

Remove:

* Excessive glassmorphism.
* Fake marketing metrics.
* Static architecture diagrams.

Improve:

* Larger pod visuals.
* More motion.
* More system feedback.
* More state-based color usage.
* Stronger focus on simulation rather than presentation.

⸻

Success Criteria

A first-time user should be able to:

1. Increase traffic.
2. Watch pods scale.
3. Kill infrastructure.
4. Observe Kubernetes recovery.
5. Understand why Kubernetes prevents outages.

The application should feel like an interactive production system rather than a static educational dashboard.