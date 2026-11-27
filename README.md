# VentaCore — AI Runtime Security Control Plane

<p align="center">
  <img src="https://img.shields.io/badge/Security-Runtime%20Control%20Plane-00FF66?style=for-the-badge&logo=shield&logoColor=black" alt="Security Control Plane" />
  <img src="https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-8.4-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/License-Apache%202.0-blue.svg?style=for-the-badge" alt="License" />
</p>

---

## 🌐 Live Application
Experience the interactive security control plane and visual console live on GitHub Pages:  
👉 **[https://ad069-rezero.github.io/VentaCore/](https://ad069-rezero.github.io/VentaCore/)**

---

## 🛡️ Overview

**VentaCore** is an enterprise-grade AI Runtime Security, Monitoring, and Governance Control Plane engineered for autonomous and tool-using AI agents. As AI systems transition from read-only chatbots to autonomous decision-makers capable of querying databases, mutating files, and invoking third-party APIs, traditional static perimeter defenses become obsolete.

VentaCore intercepts agent actions at runtime, analyzes adversarial risks, enforces fine-grained organizational policies, tracks data taint across multi-step execution chains, and synthesizes authoritative enforcement decisions: **ALLOW**, **REVIEW**, or **BLOCK**.

---

## 📑 Core Documentation
- 📄 **[PRD.md](file:///E:/ventacore/PRD.md):** Complete Product Requirements Document defining target personas, functional requirements, and capability models.
- ⚙️ **[Structure&working.md](file:///E:/ventacore/Structure&working.md):** Detailed technical architecture, request lifecycle walkthrough, and module catalog.

---

## ✨ Features & Capabilities

### 1. Operations & Forensic Console
- **Real-Time Threat Overview:** Dynamic security posture tracking, active session count, blocked attempts, and live telemetry feeds.
- **Agent Registry & Session Explorer:** Deep inspection of connected agents, authorization epochs, token states, and execution histories.
- **Attack Chains Workspace:** Visual node-based graph powered by `@xyflow/react` showing taint propagation and blast radius across multi-turn agent sessions.
- **Tool Governance & Connectors:** Fine-grained tool permission controls, schema enforcement, and rate-limiting rules.
- **Approval Center:** Human-in-the-loop (HITL) review queue for high-risk actions (quarantines, sensitive database writes, API modifications).
- **Quarantine Vault:** Real-time containment and isolation chamber for compromised agent sessions.
- **Policy Lifecycle & Diff Viewer:** Visual authoring, backtesting, and version comparison for Open Policy Agent (OPA) rules.
- **AI Security Lab:** Sandbox environment to simulate prompt injection attacks, exfiltration vectors, and anomalous tool behaviors.

### 2. High-Fidelity Visual Experience
- **Cinematic 3D Shaders:** Interactive Three.js and React Three Fiber HUD particles, neural network topologies, and biometric scanning animations.
- **Fluid Micro-Interactions:** Smooth Lenis scrolling with coordinated GSAP and Motion reveal animations.
- **Responsive Dark Design:** Tailored high-contrast cyber-defense aesthetic built with Tailwind CSS v4.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | React 19, TypeScript |
| **Build & Bundler** | Vite 8, Rolldown engine |
| **Styling** | Tailwind CSS v4, Motion, GSAP |
| **3D & Visualizations** | Three.js, React Three Fiber, React Flow (`@xyflow/react`), Recharts |
| **State & Data Fetching**| TanStack Query v5, Context API |
| **Icons** | Lucide React |
| **Routing** | React Router 7 (`HashRouter` for zero-configuration static hosting) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm or yarn / pnpm / bun

### Installation & Run

```bash
# Clone the repository
git clone https://github.com/AD069-ReZero/VentaCore.git
cd VentaCore

# Install dependencies
npm install

# Start development server
npm run dev
```

Open your browser and navigate to `http://localhost:3000` to explore the interface.

### Production Build

```bash
# Compile and bundle assets
npm run build

# Preview production build locally
npm run preview
```

---

## 🔒 Security & Privacy Notice
All telemetry, agent session data, and incident events in this distribution use realistic synthetic data generators and embedded mock providers. No production credentials, tokens, or live customer data are exposed.

---

## 📄 License
This project is licensed under the Apache 2.0 License. See `LICENSE` for details.
