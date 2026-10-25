# Unified Campus Resource & Maintenance System (UCRMS)

[![Course](https://img.shields.io/badge/Course-B.Tech_CS301_Software_Engineering-blue.svg)](https://iiitp.ac.in)
[![Institution](https://img.shields.io/badge/Institution-IIIT_Pune-1b365d.svg)](https://iiitp.ac.in)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)]()
[![Tests](https://img.shields.io/badge/Tests-6%2F6_Passing-emerald.svg)]()
[![JMeter](https://img.shields.io/badge/JMeter-5.6.3_Verified-orange.svg)]()

> **Unified Campus Resource & Maintenance System (UCRMS)** is an enterprise-grade full-stack web application developed for the campus community of **Indian Institute of Information Technology Pune (IIIT Pune)**. It integrates campus resource scheduling, maintenance work-order dispatch, automated event-driven safety synchronization, and ACID concurrency guarantees into a responsive desktop dashboard.

---

## 🏛️ Project Highlights & Key Features

1. **ACID Mutual Exclusion & Race Condition Prevention:**
   - Implements pessimistic key-level mutex locking (`lock:{roomId}:{date}`) in the backend engine.
   - Rigorously tested under 50 simultaneous threads attempting to book the identical room slot: **0% double-booking, exactly 1 reservation accepted (HTTP 201), 49 requests blocked with HTTP 409 Conflict**.
2. **Automated Safety Interlocking (EventBridge Relay):**
   - When a `High` priority hazard (e.g. electrical sparking, server overheating) is submitted, the system automatically marks the venue as suspended, rejects future bookings, alerts affected users, and logs an audit record.
3. **Role-Based Access Control (RBAC):**
   - Distinct, authenticated personas for **Students**, **Maintenance Staff**, and **Campus Administrators**.
4. **Clean Desktop UI:**
   - Clean, minimal institutional theme inspired by modern academic portals, utilizing high-resolution campus photography from IIIT Pune.
5. **JMeter Telemetry & Concurrency Diagnostics:**
   - Interactive in-app inspection of real JMeter benchmark metrics (`jmeter_results.csv`) and live in-browser multi-worker stress tester.

---

## 📚 Software Engineering Documentation (`docs/`)

This repository contains full lifecycle Software Engineering artifacts compliant with IEEE standards:

- 📄 **[Product Requirements Document (PRD)](./docs/PRD.md):** Product vision, user stories, personas, scope, and KPIs.
- 📐 **[Software Requirements Specification (SRS)](./docs/SRS.md):** IEEE 830-compliant requirements breakdown, modules, and functional constraints.
- 🏗️ **[System Architecture & Design Document (SDD)](./docs/ARCHITECTURE.md):** Layered architecture diagrams, sequence diagrams for mutex concurrency, and ER schemas.
- 🧪 **[Testing & Validation Report](./docs/TESTING_REPORT.md):** Unit test cases, JMeter performance metrics table, and test execution procedures.
- 📑 **[JMeter Lab Word Report (.docx)](./UCRMS_JMeter_Performance_and_Concurrency_Testing_Report.docx):** Formal 19-page laboratory report complete with theory, high-resolution figures, and result analysis.

---

## ⚙️ Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide Icons
- **Backend:** Node.js 22+, Express.js, TypeScript (`tsx`)
- **Architecture:** Layered Monolith with In-Memory Mutex Store (No Docker or external database required)
- **Testing:** Native Node.js Test Runner, Apache JMeter 5.6.3

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20.19+ (Node.js 22+ recommended)
- npm

### 1. Installation
```powershell
git clone https://github.com/your-username/UCRMS.git
cd UCRMS
npm install
```

### 2. Run Locally
```powershell
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔑 Demo Personas & Credentials

Sign in directly by choosing any pre-seeded campus email (no password required in demo mode):

| Role | Email | Privileges |
| :--- | :--- | :--- |
| **Student** | `112415012@cse.iiitp.ac.in` | Browse facilities, book slots, view personal reservations, report faults. |
| **Student** | `neha.gupta@iiitp.ac.in` | Browse facilities, book slots, report faults. |
| **Maintenance Staff** | `ramesh.patel@iiitp.ac.in` | View assigned work orders, update ticket state to Assigned/Resolved. |
| **Maintenance Staff** | `suresh.kumar@iiitp.ac.in` | View and manage campus IT & network tickets. |
| **Admin** | `admin.facilities@iiitp.ac.in` | System oversight, user activation toggle, suspension override, audit logs, JMeter diagnostics. |

---

## 🧪 Verification & Automated Testing

### Run Unit & Concurrency Tests:
```powershell
npm test
```

### Run Type Checks:
```powershell
npm run lint
```

### Production Build:
```powershell
npm run build
```

---

## 📊 Performance & JMeter Benchmarks

Our performance benchmark evaluated **150 total requests** (100 availability readers + 50 concurrent writers) using Apache JMeter:

| Endpoint | Concurrency | Avg Response | Error % | Outcome |
| :--- | :---: | :---: | :---: | :--- |
| `GET /api/rooms/.../availability` | 100 Users | **1 ms** | **0.00%** | All 100 requests served in <3ms (SLA: <500ms). |
| `POST /api/bookings` | 50 Workers | **4 ms** | **98.00%** | Exactly 1 booking succeeded (`201`), 49 blocked (`409`). **Zero double-booking**. |
| **Total Aggregate** | **150 Requests** | **2 ms** | **32.67%** | **75.2 req/sec throughput**. |

---

## 👥 Authors & Academic Credits

- **Student Author:** Alok Jha (B.Tech CSE, IIIT Pune)
- **Course:** CS301 - Software Engineering Lab (2026)
- **Institution:** Indian Institute of Information Technology Pune
