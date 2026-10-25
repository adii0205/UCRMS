# Verification, Validation & Test Plan (V&V)
## Unified Campus Resource & Maintenance System (UCRMS)

**Course:** B.Tech Software Engineering (CS301)  
**Academic Year:** 2026  
**Institution:** Indian Institute of Information Technology Pune  

---

## 1. Testing Strategy Overview

UCRMS adheres to the **Testing Pyramid**:
1. **Unit & Integration Tests:** Fast, deterministic API endpoint assertions.
2. **Concurrency & Race Condition Tests:** Automated in-process parallel worker threads.
3. **Non-Functional Load & Performance Tests:** External black-box simulation using Apache JMeter.

---

## 2. Automated Test Suite (`npm test`)

The automated test suite runs via Node.js native test runner (`server/__tests__/concurrency.test.ts`):

```powershell
npm test
```

### Verified Test Cases:
| Test ID | Description | Expected Result | Status |
| :--- | :--- | :--- | :---: |
| **TC-01** | Serves seeded data and rejects unknown campus accounts | Unknown emails return `HTTP 401 Unauthorized`. | **PASS** |
| **TC-02** | Serializes overlapping booking requests and reports a conflict | Exactly 1 booking confirms (`201`), second returns `409 Conflict`. | **PASS** |
| **TC-03** | Protects admin endpoints and validates malformed bookings | Students receive `403 Forbidden` on Admin routes. | **PASS** |
| **TC-04** | High-priority tickets suspend the room and notify affected bookings | Room sets `isSuspended = true`, conflicting bookings alerted. | **PASS** |
| **TC-05** | Test push notifications are persisted for signed-in user | Notifications appear in user inbox with unread status. | **PASS** |
| **TC-06** | Availability reports partial-hour overlaps as booked | Multi-hour reservations accurately block overlapping hourly slots. | **PASS** |

---

## 3. Apache JMeter Performance & Load Testing

- **Test Plan Location:** `public/jmeter/UCRMS_Load_and_Concurrency_TestPlan.jmx`
- **Results Output:** `public/jmeter/jmeter_results.csv`
- **Formal Laboratory Report:** `UCRMS_JMeter_Performance_and_Concurrency_Testing_Report.docx`

### Quantitative JMeter Benchmark Results:
```
+---------------------------------------------------+---------+-----------+-----------+---------+------------+
| Sampler Label                                     | Samples | Avg (ms)  | Min / Max | Error % | Throughput |
+---------------------------------------------------+---------+-----------+-----------+---------+------------+
| GET /api/rooms/room_sh101/availability (Readers)  |   100   |    1 ms   | 1 / 3 ms  |  0.00%  | 50.5 req/s |
| POST /api/bookings (Concurrent Writers)           |    50   |    4 ms   | 1 / 52 ms | 98.00%* | 51.1 req/s |
| Total Aggregate                                   |   150   |    2 ms   | 1 / 52 ms | 32.67%  | 75.2 req/s |
+---------------------------------------------------+---------+-----------+-----------+---------+------------+
*Note: 98% error on concurrent booking writers represents 49 rejected requests out of 50 simultaneous workers. 
This is the mathematically expected behavior proving mutual exclusion and zero double-booking under ACID constraints.
```

---

## 4. How to Execute Tests Locally

### Run Automated Unit Tests:
```powershell
npm test
```

### Run Type & Linting Verification:
```powershell
npm run lint
```

### Run Full Production Build:
```powershell
npm run build
```

### Run Headless JMeter Test:
```powershell
& "C:\apps\apache-jmeter-5.6.3\apache-jmeter-5.6.3\bin\jmeter.bat" -n -t public\jmeter\UCRMS_Load_and_Concurrency_TestPlan.jmx -l jmeter_results.jtl -e -o jmeter_report
```
