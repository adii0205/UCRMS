# System Architecture & Software Design Document (SDD)
## Unified Campus Resource & Maintenance System (UCRMS)

**Course:** B.Tech Software Engineering (CS301)  
**Academic Institution:** Indian Institute of Information Technology Pune  
**Author:** Alok Jha  
**Date:** October 2026  

---

## 1. Architectural Style & Design Principles

UCRMS employs a **Layered Monolithic Architecture** optimized for high-performance localized execution, rapid iteration, and transaction serialization.

### Core Architectural Principles:
1. **Single Source of Truth:** Centralized in-memory data store with atomic operations.
2. **Pessimistic Key-Level Mutex Locking:** Eliminates race conditions by locking resources at `lock:{roomId}:{date}` granularity.
3. **Event-Driven Interlocking (EventBridge Pattern):** Decouples maintenance hazard reporting from facility scheduling while ensuring synchronous safety enforcement.
4. **Clean Separation of Concerns:** Clear demarcation between Presentation (React), Routing/Controller (Express), Security/Middleware (Auth & RBAC), and Domain/Persistence (Memory Store).

---

## 2. Component Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                              PRESENTATION LAYER                                   |
|                                                                                   |
|  +-------------------+  +-----------------------+  +----------------------------+ |
|  |    PortalHome     |  |   DesktopDashboard    |  |        AdminConsole        | |
|  |  (Campus Hero,    |  |   (Room Catalog,      |  |   (Users, Audit Ledger,    | |
|  |   Quick Links,    |  |    Slot Grid,         |  |    Suspensions, JMeter &   | |
|  |   Key Facilities) |  |    Ticket Dispatch)   |  |    Concurrency Engines)    | |
|  +-------------------+  +-----------------------+  +----------------------------+ |
|                                      |                                            |
|                                      v                                            |
|                        [ Axios/Fetch API Client ]                                 |
+-----------------------------------------------------------------------------------+
                                       |
                               HTTP REST Calls (JSON)
                                       |
+-----------------------------------------------------------------------------------+
|                              APPLICATION LAYER                                    |
|                                                                                   |
|  +------------------------------------------------------------------------------+ |
|  |                        Express.js Router (/api)                              | |
|  +------------------------------------------------------------------------------+ |
|          |                                              |                         |
|          v                                              v                         |
|  +-----------------------+                    +-----------------------+           |
|  |   authenticate.ts     |                    |       role.ts         |           |
|  | (Token & Auth Guard)  |                    | (RBAC Permission Gate)|           |
|  +-----------------------+                    +-----------------------+           |
+-----------------------------------------------------------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------------+
|                           DOMAIN & PERSISTENCE LAYER                              |
|                                                                                   |
|  +------------------------------------------------------------------------------+ |
|  |                        Database Controller (db/index.ts)                     | |
|  +------------------------------------------------------------------------------+ |
|          |                                              |                         |
|          v                                              v                         |
|  +-------------------------------+            +-------------------------------+   |
|  |        runInLock()            |            |      EventBridge Relay        |   |
|  |  Pessimistic Key Mutex Chain  |            |  Automated Hazard Suspension  |   |
|  +-------------------------------+            +-------------------------------+   |
|          |                                              |                         |
|          +-----------------------+----------------------+                         |
|                                  v                                                |
|                      [ In-Memory Seeded Store ]                                   |
|                      - Users, Rooms, Bookings,                                    |
|                      - Tickets, AuditLogs, Notifications                          |
+-----------------------------------------------------------------------------------+
```

---

## 3. High-Concurrency Mutex Serialization (Sequence Diagram)

When multiple users simultaneously submit a reservation for the identical room and date slot, UCRMS serializes requests through its `runInLock` engine:

```
Thread 1 (Worker A)       Thread 2 (Worker B)          db.runInLock()             Data Store
        |                         |                          |                         |
        |--- POST /bookings ----->|                          |                         |
        |    (Slot 14:00-15:00)   |                          |                         |
        |                         |--- POST /bookings ------>|                         |
        |                         |    (Slot 14:00-15:00)    |                         |
        |                         |                          |                         |
        |                         |                          |-- Acquire Lock -------->|
        |                         |                          |   lock:room_sh101:2026  |
        |                         |                          |<-- Lock Granted --------|
        |                         |                          |                         |
        |                         |                          |-- Check Overlaps: None -|
        |                         |                          |-- Insert Booking ------>|
        |                         |                          |<-- Confirm Insert ------|
        |<-- 201 Created ---------|                          |                         |
        |    (Booking Confirmed)  |                          |-- Release Lock -------->|
        |                         |                          |                         |
        |                         |                          |-- Next Queue Item ----->|
        |                         |                          |-- Check Overlaps -------|
        |                         |                          |   Found: Booking A!     |
        |                         |<-- 409 Conflict ---------|                         |
        |                         |    (Exclusion Rejection) |                         |
```

---

## 4. Maintenance Ticket State Machine

```
   +--------------------+
   |   User Reports     |
   |      Ticket        |
   +--------------------+
             |
             v
      [ State: OPEN ] <------------------------------------+
             |                                             |
             | If Priority == 'High':                      |
             | EventBridge suspends room                   |
             |                                             |
             v                                             |
      [ Staff Assigned ]                                   | Reopened
             |                                             | (If fault recurs)
             v                                             |
    [ State: ASSIGNED ]                                    |
             |                                             |
             | Technician completes repair                 |
             v                                             |
    [ State: RESOLVED ] -----------------------------------+
             |
             +---> Room suspension eligible to be lifted
```

---

## 5. Data Models & Entity Relationships

### 5.1 Entity-Relationship (ER) Schema

```
+--------------------+        1:N        +--------------------+
|       Users        |------------------<|      Bookings      |
|--------------------|                   |--------------------|
| id (PK)            |                   | id (PK)            |
| name               |                   | roomId (FK)        |
| email              |                   | userId (FK)        |
| role               |                   | date               |
| department         |                   | startTime, endTime |
| isActive           |                   | status             |
+--------------------+                   +--------------------+
          |                                        |
          | 1:N                                    | M:1
          v                                        v
+--------------------+        M:1        +--------------------+
|      Tickets       |>------------------|       Rooms        |
|--------------------|                   |--------------------|
| id (PK)            |                   | id (PK)            |
| roomId (FK)        |                   | name, building     |
| reportedBy (FK)    |                   | capacity           |
| category           |                   | equipment          |
| priority           |                   | isSuspended        |
| state              |                   | activeTicketId     |
+--------------------+                   +--------------------+
```

---

## 6. Software Engineering Development Lifecycle (SDLC)

- **Model:** Agile Scrum Framework.
- **Sprint Cadence:** 2-week iterative sprints.
- **Verification Strategy:**
  - **Unit & Integration:** Automated Node.js test runner (`npm test`) covering authentication, conflict rejection, and role-protection.
  - **Performance & Load:** Apache JMeter 5.6.3 headless & GUI test plans verifying SLA response times ($<500\text{ ms}$) and ACID exclusion constraints.
