# VentaCore — Structure & Working Architecture

This document provides a comprehensive technical breakdown of VentaCore's architecture, execution lifecycle, repository structure, and operational data flow.

---

## 1. High-Level System Architecture

VentaCore separates runtime control into three functional layers:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        1. PRESENTATION PLANE                           │
│  Interactive Visual Console & Public Landing App (React 19, Three.js)  │
│  - 3D Agent Scanner HUD & Neural Topology Network                      │
│  - Attack Chain & Taint Flow Explorer (@xyflow/react)                  │
│  - Live Forensic Investigation, Audit Logs & Policy Diff Viewer        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS / WebSocket / Mock
┌───────────────────────────────────▼────────────────────────────────────┐
│                        2. ENFORCEMENT & POLICY                         │
│  Security Gateway & Policy Engine                                      │
│  - Asymmetric JWT / Ed25519 Request Verification                       │
│  - OPA / Rego Declarative Policy Rule Evaluation                       │
│  - Multi-Detector Injection & Taint Analysis Pipeline                  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Transactional Persistence
┌───────────────────────────────────▼────────────────────────────────────┐
│                        3. STORAGE & TELEMETRY                          │
│  PostgreSQL (Append-Only Event Ledger) + Redis (Advisory State Cache)  │
│  - Row-Level Security (RLS) Tenant Isolation                           │
│  - Immutable Cryptographic Hash-Chained Audit Trail                    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Directory Structure

```
ventacore/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Automated GitHub Pages CI/CD deployment
├── 404.html                    # Single Page App routing fallback for GitHub Pages
├── index.html                  # HTML entry point with dark aesthetic styling
├── package.json                # Project dependencies and build scripts
├── vite.config.ts              # Vite bundler configuration (relative base, vendor chunks)
├── tsconfig.json               # TypeScript configuration
├── PRD.md                      # Product Requirements Document
├── Structure&working.md        # Technical architecture and operational mechanics
├── README.md                   # Repository overview and quick start guide
└── src/
    ├── main.tsx                # Application bootstrap
    ├── App.tsx                 # Route declarations with HashRouter
    ├── index.css               # Global Tailwind CSS directives
    ├── api/                    # API client foundation and simulated delay mechanisms
    │   ├── client.ts           # Type-safe response wrapper and fetch simulation
    │   ├── index.ts            # Public API exports
    │   ├── services/           # Service modules (agents, sessions, events, policies, etc.)
    │   └── simulator.ts        # Dynamic security incident and event generator
    ├── components/
    │   ├── canvas/             # Three.js 3D shaders, particles, and scanner HUDs
    │   ├── common/             # Modals (PolicyDiff, TaintFlow, IncidentExport, Search)
    │   ├── console/            # Console shell, AttackChainFlow, 3D network visualizations
    │   ├── motion/             # GSAP & Motion animation wrappers (TextReveal, SectionReveal)
    │   └── navigation/         # Responsive Navbar and FloatingDock
    ├── features/
    │   ├── landing/            # Landing page (Hero, AssetAtlas, AttackChain, BentoGrid)
    │   └── console/            # Full-featured operations console views:
    │       ├── OverviewView.tsx
    │       ├── AgentsView.tsx & AgentDetailsView.tsx
    │       ├── SessionsView.tsx & SessionDetailsView.tsx
    │       ├── SecurityEventsView.tsx
    │       ├── DecisionCenterView.tsx & DecisionDetailsView.tsx
    │       ├── AttackChainsWorkspaceView.tsx
    │       ├── ToolRegistryView.tsx & ToolDetailsView.tsx
    │       ├── ApprovalCenterView.tsx & ApprovalDetailsView.tsx
    │       ├── QuarantineView.tsx & QuarantineDetailsView.tsx
    │       ├── PoliciesView.tsx & PolicyDetailsView.tsx
    │       ├── AuditView.tsx & AuditDetailsView.tsx
    │       ├── AiSecurityLabView.tsx
    │       ├── ConnectorsView.tsx & ConnectorDetailsView.tsx
    │       └── SystemHealthView.tsx & SettingsView.tsx
    ├── hooks/                  # Custom React hooks (useLenisScroll, UI utilities)
    ├── lib/                    # Core library utilities (enforcement logic, animations)
    ├── mock/                   # Comprehensive realistic security data sets
    ├── styles/                 # Theme tokens and design system variables
    └── types/                  # Rigorous TypeScript interfaces for security contracts
```

---

## 3. How VentaCore Works (The Request Lifecycle)

Every agent tool call undergoes a systematic 6-step lifecycle before authorization:

1. **Interception & Identity Binding:**
   The agent's tool execution request is intercepted. The caller identity, agent registration, and active session epoch are cryptographically validated.

2. **Argument Canonicalization & Sanitization:**
   Incoming JSON payloads are sorted, normalized, and validated against the registered tool parameter schema to neutralize syntax bypasses and payload obfuscation.

3. **Multi-Detector Risk Pipeline:**
   The request is analyzed concurrently by specialized detectors:
   - *Prompt Injection Detector:* Checks for adversarial jailbreaks and system prompt overrides.
   - *Taint Tracker:* Validates if arguments contain untrusted inputs received from previous external queries.
   - *Destination Guard:* Checks egress domains and IPs against threat intelligence lists.

4. **OPA / Rego Policy Evaluation:**
   Organizational governance policies are evaluated against the canonicalized request and detector outputs. Policies specify rules such as mandatory dual-custody human approvals for financial transfers, read-only file constraints, or complete blocks on shell execution.

5. **Decision Synthesis:**
   - **ALLOW:** The request is approved and passed to the destination tool.
   - **REVIEW:** The tool call is suspended in the Approval Center; notifications are dispatched to designated security managers.
   - **BLOCK:** The request is denied immediately with structured reason codes.

6. **Audit & Forensics Chaining:**
   The decision, full request context, and taint metadata are committed to an append-only, tamper-evident audit ledger for compliance and forensic analysis.
