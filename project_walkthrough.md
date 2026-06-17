# Scaling the Lunch Rush 🍔🚀
### DevOps & Kubernetes Auto-Scaling Interactive Walkthrough Project

This project is an interactive, educational web application designed to demonstrate the problem of a food delivery application crashing during peak traffic hours (the "Lunch Rush") and the corresponding solution: a **Kubernetes (K8s)-based microservices architecture** with **Horizontal Pod Auto-scaling (HPA)**.

---

## 📂 Project Structure

Here is a breakdown of the key files and folders in this project:

```text
scaling-lunch-rush/
├── index.html                   # Entry HTML file with Google Fonts & global meta description
├── package.json                 # Dependency definitions (React, Recharts, Framer Motion, Tailwind, Lucide React)
├── postcss.config.js            # PostCSS configuration for Tailwind
├── tailwind.config.js           # Custom Tailwind theme setup (primary/accent colors, float/pulse animations)
├── vite.config.js               # Vite configurations
└── src/
    ├── main.jsx                 # React root mounting
    ├── App.jsx                  # Main application orchestrator & theme manager
    ├── index.css                # Global styling, glassmorphism cards, and custom CSS animations
    ├── hooks/
    │   └── useAutoScaling.js    # Simulation state machine & HPA auto-scaling logic
    └── components/
        ├── Navbar.jsx           # Dark/light mode theme toggle and navigation
        ├── HeroSection.jsx      # Title screen with floating food elements and call to action
        ├── ProblemSection.jsx   # Visual crash explanation, 5x peak traffic chart, & crash timeline
        ├── SolutionSection.jsx  # Monolith vs Microservices comparison and individual services
        ├── K8sArchitecture.jsx  # Interactive Kubernetes cluster diagram (Nodes, Pods, Services, DB)
        ├── AutoScalingSimulation.jsx # Live HPA slider simulator with real-time Pod scaling and terminal logs
        ├── DevOpsPipeline.jsx   # Automated CI/CD flow diagram and raw YAML configurations
        ├── MetricsDashboard.jsx # Live metrics monitors (latency, CPU, memory, RPS, errors)
        ├── ConclusionSection.jsx # Side-by-side comparison of benefits (reliability, cost, scale)
        └── Footer.jsx           # Clean footer and credits
```

---

## ⚙️ Tech Stack & Key Libraries

- **UI Framework**: React.js (V18) with Vite
- **Styling**: Tailwind CSS for rapid styling, custom Vanilla CSS variables, glassmorphic card classes, and custom animation definitions in [index.css](file:///Users/nikhilchhetri/kubernets/devops/scaling-lunch-rush/src/index.css)
- **Animations**: Framer Motion for premium fluid card reveals, springy pod scaling, and interactive toggles
- **Charts**: Recharts for responsive, hardware-accelerated area, line, and bar charts
- **Icons**: Lucide React for consistent modern symbols

---

## 🧠 Core Logic & Scaling Mechanics

The heart of the simulation runs in [useAutoScaling.js](file:///Users/nikhilchhetri/kubernets/devops/scaling-lunch-rush/src/hooks/useAutoScaling.js). It handles all metrics, traffic fluctuations, HPA logic, and event log generation.

### Simulation Parameters:
- **Min Pods**: 2 pods
- **Max Pods**: 12 pods
- **Tick Rate**: Updates every `800ms`
- **Auto-Scaling Metrics**:
  - **Scale-Up Threshold**: CPU > 70%
  - **Scale-Down Threshold**: CPU < 30%

### Calculations:
- **CPU Calculation**:
  - **When K8s is Enabled (ON)**: CPU load is distributed across pods.
    $$\text{Base CPU} = \min\left(95\%, \frac{\text{Traffic} \times 2.5}{\max(\text{Pods}, 1)}\right) \pm \text{Jitter}$$
  - **When K8s is Disabled (OFF)**: System acts as a single-node monolith.
    $$\text{Base CPU} = \min\left(100\%, \text{Traffic} \times 1.8\right) \pm \text{Jitter}$$
- **Crashes**: When K8s is disabled and CPU usage exceeds 90%, a server overload is registered, triggering a simulated `OOMKilled` crash event.

---

## 🧩 Visual Walkthrough of Components

### 1. Landing / Hero Section
- **File**: [HeroSection.jsx](file:///Users/nikhilchhetri/kubernets/devops/scaling-lunch-rush/src/components/HeroSection.jsx)
- **Visuals**: Animated floating food emojis (pizza, burger, taco, ramen) drifting at different rates, combined with gradient background meshes.
- **Goal**: Introduces the DevOps case study and presents primary CTAs.

### 2. Problem Visualization
- **File**: [ProblemSection.jsx](file:///Users/nikhilchhetri/kubernets/devops/scaling-lunch-rush/src/components/ProblemSection.jsx)
- **Visuals**: Contains an AreaChart illustrating the daily 12:00 PM surge compared against fixed monolith server capacity (800 requests/sec).
- **Goal**: Visualizes a 3-stage timeline (traffic surge, system crash, total outage).

### 3. Monolith vs Microservices
- **File**: [SolutionSection.jsx](file:///Users/nikhilchhetri/kubernets/devops/scaling-lunch-rush/src/components/SolutionSection.jsx)
- **Visuals**: Side-by-side cards comparing a coupled monolith against decoupled microservices. Includes cards for:
  - **API Gateway**: Routing, rate limiting, and auth
  - **User Service**: Sessions & profiles
  - **Order Service**: Order lifecycle
  - **Payment Service**: Processing transactions
  - **Database**: PostgreSQL with read replicas

### 4. Kubernetes Cluster View
- **File**: [K8sArchitecture.jsx](file:///Users/nikhilchhetri/kubernets/devops/scaling-lunch-rush/src/components/K8sArchitecture.jsx)
- **Visuals**: Flow diagram tracing user traffic through the Ingress Load Balancer and Kubernetes Service into Pods.
- **Goal**: Highlights how Pods scale and balance themselves across Worker Node 1 and Worker Node 2 in real-time.

### 5. Interactive Simulator
- **File**: [AutoScalingSimulation.jsx](file:///Users/nikhilchhetri/kubernets/devops/scaling-lunch-rush/src/components/AutoScalingSimulation.jsx)
- **Controls**: A slider allowing manual control of traffic levels (0% to 100%), play/pause buttons, and a K8s ON/OFF toggle.
- **Interactive elements**:
  - **CPU Gauge**: Changes color dynamically (Green $\rightarrow$ Yellow $\rightarrow$ Red).
  - **Pod Cluster**: Smoothly spins up or terminates container pods using Framer Motion exit animations.
  - **Chart**: Real-time line graph plotting CPU and Pod counts side-by-side.
  - **K8s Event Logs**: A scrollable mock terminal writing diagnostic messages such as HPA scaling events, container image pulls, or monolith crashes.

### 6. Metrics & Performance
- **File**: [MetricsDashboard.jsx](file:///Users/nikhilchhetri/kubernets/devops/scaling-lunch-rush/src/components/MetricsDashboard.jsx)
- **Visuals**: Displays real-time cards tracking Latency, Error Rates, Uptime, and Memory alongside Area and Bar charts of CPU and Pod activity.

### 7. DevOps Pipeline & YAML Config
- **File**: [DevOpsPipeline.jsx](file:///Users/nikhilchhetri/kubernets/devops/scaling-lunch-rush/src/components/DevOpsPipeline.jsx)
- **Visuals**: Step-by-step pipeline sequence from code commit (`git push`) to rolling deployment (`kubectl rollout`).
- **Goal**: Provides an interactive code block showing a real-world Kubernetes `deployment.yaml` and `HorizontalPodAutoscaler` configuration.

---

## 🚀 How to Run Locally

To spin up this interactive presentation on your machine, follow these steps:

1. **Navigate to the project directory**:
   ```bash
   cd scaling-lunch-rush
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Start the development server**:
   ```bash
   npm run dev
   ```
4. **Open in browser**:
   Click the local address provided in the terminal (usually `http://localhost:5173`).
