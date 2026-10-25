# Software Requirements Specification (SRS)
## Unified Campus Resource & Maintenance System (UCRMS)

**Compliant with IEEE Std 830-1998 Format**  
**Institution:** Indian Institute of Information Technology Pune (IIIT Pune)  
**Department:** Computer Science & Engineering  
**Academic Year:** 2026  

---

## 1. Introduction

### 1.1 Purpose
This document specifies the software requirements for the Unified Campus Resource & Maintenance System (UCRMS). It serves as the formal functional and technical contract for academic evaluation, implementation, and quality verification.

### 1.2 Scope of the Software
UCRMS is a full-stack, enterprise-grade simulation system designed for higher education campuses. It unifies room reservations, maintenance ticketing, automated safety event synchronization, role-based administrative controls, and ACID concurrency guarantees in a cohesive desktop web application.

### 1.3 Definitions, Acronyms, and Abbreviations
- **ACID:** Atomicity, Consistency, Isolation, Durability.
- **RBAC:** Role-Based Access Control.
- **SLA:** Service Level Agreement.
- **JMeter:** Apache open-source load and performance testing tool.
- **EventBridge:** Event-driven architecture pattern that automatically triggers downstream effects (e.g., room suspension upon hazard creation).

---

## 2. Overall Description

### 2.1 Product Perspective
UCRMS operates as an integrated single-process client-server system. The presentation tier (React 19 + Tailwind CSS) communicates over RESTful HTTP/JSON with the application tier (Express.js on Node.js), backed by an in-memory transactional data store equipped with key-level mutex locking.

```
+-------------------------------------------------------------+
|                      Client Layer                           |
|       React 19 Desktop Dashboard (TypeScript + Tailwind)    |
+-------------------------------------------------------------+
                              |
                     REST API | HTTP / JSON
                              v
+-------------------------------------------------------------+
|                     Application Layer                       |
|          Express.js Router & Role Middleware (RBAC)         |
+-------------------------------------------------------------+
                              |
             Synchronous Mutex| Lock Serialization
                              v
+-------------------------------------------------------------+
|                       Data Engine                           |
|      Key-Locked Transactional Engine & EventBridge Relay   |
+-------------------------------------------------------------+
```

### 2.2 User Characteristics
1. **Student:** Standard user with privileges to query schedules, book available rooms, cancel own bookings, and report facility defects.
2. **Maintenance Staff:** Operational user with privileges to inspect campus work orders, accept assignments, and update ticket resolution states.
3. **Administrator:** Privileged user with overarching governance to manage accounts, override safety lockouts, review audit trails, and execute concurrency diagnostics.

---

## 3. Specific Functional Requirements

### Module 1: Facility & Booking Management
- **REQ-1.1 (Catalog Query):** The system SHALL return all campus facilities including building name, floor, capacity, and equipment tags via `GET /api/rooms`.
- **REQ-1.2 (Availability Grid):** The system SHALL evaluate active bookings for a given room and date, returning slot-by-slot status (09:00–18:00) via `GET /api/rooms/:id/availability?date=YYYY-MM-DD`.
- **REQ-1.3 (ACID Reservation):** The system SHALL serialize booking requests using a key-based mutex (`lock:{roomId}:{date}`). If a slot overlap is detected ($start < existing.end \land end > existing.start$), the request MUST be rejected with `HTTP 409 Conflict`.
- **REQ-1.4 (Date Validation):** The system SHALL enforce that booking dates conform to `YYYY-MM-DD` format and are scheduled for today or a future date. Past dates MUST be rejected with `HTTP 400 Bad Request`.

### Module 2: Maintenance & Work Order Dispatch
- **REQ-2.1 (Ticket Creation):** Users SHALL submit maintenance tickets specifying facility, category (Electrical, IT, Furniture, HVAC, Plumbing, AV), priority (Low, Medium, High), and detailed description via `POST /api/tickets`.
- **REQ-2.2 (Lifecycle State Machine):** Work orders SHALL progress through strict states: `Open` &rarr; `Assigned` &rarr; `Resolved`.
- **REQ-2.3 (Automated Safety Suspension):** Upon creation of any `High` priority ticket, the EventBridge service SHALL immediately mark the associated room as `isSuspended = true`, reject all subsequent reservation attempts, and record an audit entry.

### Module 3: Role-Based Access Control (RBAC)
- **REQ-3.1 (Token Authentication):** All protected endpoints SHALL require a valid Bearer token (`Authorization: Bearer demo-token-{userId}`). Unauthenticated requests MUST return `HTTP 401 Unauthorized`.
- **REQ-3.2 (Administrative Authorization):** Endpoints modifying system configurations or user accounts SHALL enforce `requireRole('Admin')`. Unauthorized attempts MUST return `HTTP 403 Forbidden`.

### Module 4: Administrative Governance & Audit
- **REQ-4.1 (Account Status Toggle):** Administrators SHALL have the authority to activate or deactivate user accounts. Deactivated accounts MUST be barred from making reservations.
- **REQ-4.2 (Suspension Override):** Administrators SHALL possess the authority to manually lift emergency room suspensions by providing an override justification.
- **REQ-4.3 (Audit Ledger):** All role changes, status modifications, and emergency overrides MUST be recorded with timestamp, actor ID, target entity, and justification in an append-only log.

---

## 4. Non-Functional Requirements

### 4.1 Performance & Concurrency
- Under 50 simultaneous booking threads competing for the identical resource, exactly 1 booking MUST be confirmed and 49 MUST be blocked with HTTP 409 without data corruption.
- Read queries (`GET /api/rooms/availability`) MUST sustain a throughput $\ge 50\text{ req/sec}$ with an average latency $\le 5\text{ ms}$.

### 4.2 Security & Data Integrity
- Passwords are simulated via demo tokens for sandbox evaluation; all tokens are validated on every API call.
- Input fields are strictly sanitized: string lengths bounded (purpose $\le 500$ chars, description $\le 2000$ chars), and query parameters checked against regular expressions.

### 4.3 Portability & Self-Containment
- The entire system MUST run locally across Windows, macOS, and Linux without requiring Docker containers, external cloud providers, or native database installations.
