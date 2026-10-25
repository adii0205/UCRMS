# Product Requirements Document (PRD)
## Unified Campus Resource & Maintenance System (UCRMS)

**Project:** Unified Campus Resource & Maintenance System (UCRMS)  
**Academic Institution:** Indian Institute of Information Technology Pune (IIIT Pune)  
**Course:** B.Tech Computer Science & Engineering — Software Engineering Laboratory (CS301)  
**Version:** 1.0.0  
**Status:** Approved & Verified  

---

## 1. Executive Summary & Problem Statement

Higher education institutions operate hundreds of physical and technological resources—such as lecture halls, high-performance computing laboratories, conference venues, sports arenas, and audio-visual equipment. In typical universities, these resources are managed through disjointed mechanisms:
- Paper reservation registers or informal messaging threads leading to double-booking and schedule collisions.
- Slow, untracked facility maintenance reporting where critical faults (e.g. electrical hazards, network downtime) are not tied to facility reservation schedules, creating safety risks for campus occupants.
- Lack of mutual-exclusion locking on backend databases, causing race conditions when multiple users attempt concurrent bookings.

**UCRMS** solves this by delivering an integrated, API-first campus resource scheduling, maintenance ticketing, and automated event synchronization platform with guaranteed ACID concurrency control.

---

## 2. Product Vision & Goals

### 2.1 Vision
To deliver a single, zero-friction desktop portal for students, faculty, maintenance staff, and campus administrators that ensures transparent resource scheduling, rapid hazard remediation, and ironclad transactional reliability.

### 2.2 Core Product Objectives
1. **Zero Double-Booking Guarantee:** Enforce pessimistic row/slot-level mutual exclusion locking to eliminate race conditions under high concurrent demand.
2. **Automated Safety Interlocking:** Automatically lock down and suspend bookings for campus venues when high-priority hazards are reported, notifying affected stakeholders.
3. **Role-Based Access Control (RBAC):** Provide tailored, authenticated views for Students, Maintenance Staff, and Facilities Administrators.
4. **Performance SLA Compliance:** Maintain an average API response time under 50ms (SLA bound: <500ms) under concurrent loads of up to 100 simultaneous transactions.

---

## 3. Target User Personas

| Persona | Primary Needs & Responsibilities | Key User Stories |
| :--- | :--- | :--- |
| **Student** | Reserve study halls, lab spaces, and sports venues; track personal booking statuses; report physical faults. | *As a student, I want to view live room availability slots so that I can reserve a seminar hall for our robotics club without conflicts.* |
| **Maintenance Staff** | View assigned work orders; update ticket lifecycle states (Open &rarr; Assigned &rarr; Resolved); inspect fault descriptions. | *As a maintenance technician, I want to see tickets prioritized by severity so that I can repair electrical sparks before rooms are occupied.* |
| **Facilities Administrator** | Oversee all campus infrastructure; manage user account activations; override room safety suspensions; review audit logs. | *As an estate director, I want complete oversight of room schedules and an automated audit ledger of all role changes and emergency overrides.* |

---

## 4. Scope & Feature Specifications

### 4.1 In Scope (Phase 1 Deliverables)
- **Room & Resource Catalog:** Dynamic display of campus rooms across Academic Blocks, CSE Wings, and Sports Complexes with capacity, location, and equipment tags.
- **Hourly Slot Availability Engine:** Visual 09:00–18:00 grid displaying real-time reserved, available, and suspended slots.
- **ACID-Compliant Booking Engine:** Mutex-locked reservation creation with date validation and conflict rejection (HTTP 409).
- **Maintenance Ticketing Engine:** Multi-category (Electrical, IT/Network, HVAC, Furniture, Audio/Visual) reporting with priority levels (Low, Medium, High).
- **Automated EventBridge Interlocking:** High-priority tickets trigger automated room suspension, cancelling overlapping pending bookings and notifying affected users.
- **Administrative Console:** Real-time metrics overview, user status toggling, emergency suspension overrides, and append-only audit logging.
- **Performance & JMeter Diagnostics:** Live benchmark inspector displaying telemetry from authentic Apache JMeter execution runs.

### 4.2 Out of Scope (Deferred to Future Iterations)
- Payment gateway integration for external room rentals.
- Physical IoT smart-lock hardware integration (simulated via software mutex locks).
- Mobile native application (optimized as an accessible responsive desktop web application).

---

## 5. Non-Functional Requirements (NFRs)

1. **Concurrency & Correctness:** When $N$ concurrent requests compete for the same slot at $t_0$, exactly 1 request MUST succeed (HTTP 201) and $N-1$ requests MUST receive HTTP 409 Conflict.
2. **Latency SLA:** 95th percentile response time must not exceed 500ms under 100 concurrent requests.
3. **Availability & Resilience:** Standalone self-contained Node.js full-stack process requiring no external cloud or Docker dependencies for local demonstration.
4. **Auditability:** Every administrative override, role alteration, and account deactivation must be logged with an immutable timestamp.

---

## 6. Success Metrics & KPIs

- **Double Booking Rate:** 0.00% under 50 simultaneous threads (verified via JMeter).
- **API Availability Check Latency:** $\le 5\text{ ms}$ average across 100 queries.
- **Automated Suspension Trigger Time:** Instantaneous synchronous dispatch upon high-priority ticket submission.
