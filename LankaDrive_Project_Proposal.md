# LankaDrive: Professional Driving School Management System
**Project Proposal | HNDIT 4052: Programming Individual Project**

---

## 01. General Information
*   **Student Name:** M.R.M Hameed
*   **Student ID:** KUR/IT/2324/F/0056
*   **Academic Year:** 23/24 (Year II, Semester II)
*   **Supervisor:** Mr. K.W.G.S.K. Konthasinghe

---

## 02. Executive Summary
**LankaDrive** is a modern, offline-first desktop application designed to bridge the operational management gap in private driving schools. By automating student registration, progress tracking, and financial management, the system replaces inefficient manual processes with a secure, centralized digital workflow.

---

## 03. Problem Statement
Many driving schools in the private sector still rely on manual administrative processes, leading to:
*   **Scheduling Conflicts:** High risk of double-booking instructors or vehicles.
*   **Data Fragmentation:** Student records scattered across notebooks and physical files.
*   **Financial Opacity:** Difficulty in tracking payments and identifying outstanding balances.
*   **Progress Gaps:** No structured way to monitor student readiness for licensing exams.

---

## 04. Core Functional Modules

### 🛡️ Authentication & Security
*   **Secure Access:** Admin-only login system to protect sensitive data.
*   **IPC Bridge:** Secure Inter-Process Communication between the UI and Database.

### 📋 Student Registry Management
*   **Digital Enrollment:** Full registration of students with NIC, contact, and license class details.
*   **Quick Search:** Advanced filtering by Name, ID, or NIC for instant data retrieval.

### 🛣️ Licensing Pipeline (8-Stage Tracker)
*   **Visual Progress:** Real-time tracking through 8 mandatory stages:
    1. Registration → 2. Medical → 3. Written Exam → 4. Learners Permit → 5. Training → 6. Practical Exam → 7. Pass/Fail → 8. License Issued.

### 💳 Financial & Payment Module
*   **Transaction Logging:** Records all student payments (Installments/Full).
*   **Balance Calculation:** Automated calculation of outstanding dues.
*   **History Logs:** Complete financial history for each student.

### 🚗 Resource & Fleet Management
*   **Instructor Hub:** Managing trainer profiles and schedules.
*   **Fleet Tracking:** Monitoring vehicle availability and transmission types (Manual/Auto).

---

## 05. Technical Architecture
The system is built using the **ERVS Stack** for maximum reliability in an offline environment:

*   **Framework:** Electron.js (Native Desktop Application)
*   **Frontend:** React.js (Interactive & Responsive UI)
*   **Database:** SQLite (Local persistent storage)
*   **Styling:** Tailwind CSS (Modern, professional aesthetics)

---

## 06. Why a Desktop Application? (Literature Review)
For the Sri Lankan context, a **Desktop Native** approach is superior to web-based solutions because:
1.  **Offline Reliability:** Continuous operation during power outages or internet downtime.
2.  **Data Sovereignty:** Sensitive student data stays securely on the local machine.
3.  **Performance:** Zero-latency UI response, essential for high-volume data entry.

---

## 07. Methodology & Timeline
The project follows an **Agile Software Development** approach, ensuring rapid iterations and quality testing.

*   **Phase 1 & 2 (COMPLETED):** Requirements analysis, UI/UX Design, and Core Authentication.
*   **Phase 3 (IN PROGRESS):** Student management and Licensing Pipeline implementation.
*   **Phase 4:** Financial and Reporting modules.
*   **Phase 5:** Final Integration Testing and Deployment.

---

## 08. References
1.  **React Documentation** (2024) - component-based UI development.
2.  **Electron Documentation** (2024) - desktop native framework.
3.  **SQLite Documentation** (2024) - relational database management.
4.  **Pressman, R.** - *Software Engineering: A Practitioner's Approach*.
