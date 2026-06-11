# Project Proposal: LankaDrive
## Professional Driving School Management System

**Academic Year:** 23/24  
**Year:** II, Semester II  
**Module:** HNDIT 4052 - Programming Individual Project  

**Student Name:** M.R.M Hameed  
**Student ID:** KUR/IT/2324/F/0056  
**Supervisor:** Mr. K.W.G.S.K. Konthasinghe  

---

## 01. Problem Statement
In the private driving education sector in Sri Lanka, many small and medium-scale driving schools still rely heavily on manual administrative processes. These include paper-based record keeping, phone-based lesson scheduling, and informal payment tracking. 

The current manual system leads to several critical issues:
*   **Inefficient Scheduling:** High risk of double-booking instructors or vehicles.
*   **Poor Record Management:** Student details are scattered across physical notebooks, making search and progress tracking difficult.
*   **Lack of Transparency:** Manual payment tracking leads to errors in identifying outstanding balances.
*   **Operational Management Gap:** A lack of centralized visibility into instructor availability and vehicle maintenance.

**LankaDrive** aims to eliminate these challenges by introducing a fully offline-first digital management system tailored for the local context.

## 02. Objectives and Goals
The primary goal is to develop **LankaDrive**, a comprehensive desktop application that automates daily driving school activities.

### Specific Objectives:
1.  **Centralized Data Management:** Store all student, instructor, and vehicle data in a structured SQLite database.
2.  **Licensing Pipeline Tracking:** Implement a visual 8-stage progress tracker (Registration to License Issue).
3.  **Financial Transparency:** Provide a reliable payment tracking system with balance calculations.
4.  **Resource Optimization:** Track vehicle availability and instructor assignments to prevent conflicts.
5.  **Offline Accessibility:** Ensure the system is 100% functional without internet connectivity, ensuring reliability during outages.

## 03. Proposed Solution & Architecture
LankaDrive is a desktop-native application built using the **ERVS stack** (Electron, React, Vite, SQLite).

### System Architecture:
The application utilizes a **Multi-Process Architecture**:
*   **Renderer Process (React):** Handles the modern, responsive user interface.
*   **Main Process (Node.js):** Manages system-level operations and direct database access.
*   **IPC Bridge:** A secure Inter-Process Communication layer that allows the UI to request data from the database safely.

### Core Modules:
*   **Authentication:** Secure admin login system.
*   **Student Registry:** Comprehensive profile management.
*   **Licensing Pipeline:** Visual tracker for student progress through the 8 mandatory stages.
*   **Finance Manager:** Payment recording and automated balance calculation.
*   **Resource Hub:** Management of instructors and fleet vehicles.

## 04. Methodology
The project follows the **Agile Software Development Methodology**, allowing for iterative improvements and rapid prototyping.

### Development Phases:
1.  **Phase 1 (Completed):** Requirement gathering and UI/UX Architecture design.
2.  **Phase 2 (Completed):** Authentication module and Core Database structure implementation.
3.  **Phase 3 (In Progress):** Student management and Licensing Pipeline logic.
4.  **Phase 4:** Financial modules and automated reporting.
5.  **Phase 5:** System testing, debugging, and final deployment.

## 05. Literature Review
Research into small business management indicates that digital systems improve operational efficiency by up to 40% by reducing manual data entry errors. 

For the Sri Lankan context, **Offline Desktop Applications** are superior to cloud-based solutions due to:
*   **Data Security:** Sensitive student data (NIC, Phone) stays on the local machine.
*   **Zero Latency:** Immediate UI response regardless of internet speed.
*   **Reliability:** Continuous operation during power fluctuations or network downtime.

## 06. Technical Specifications
*   **Frontend:** React.js (with Tailwind CSS for modern aesthetics).
*   **Framework:** Electron.js (Desktop wrapper).
*   **Database:** SQLite (Local-first persistent storage).
*   **Icons/UI:** Lucide-React & Framer Motion for interactive animations.

## 07. References
1. React Documentation (2024)
2. Electron Documentation (2024)
3. SQLite Documentation (2024)
4. Pressman, R. – Software Engineering: A Practitioner's Approach.
5. Sommerville, I. – Software Engineering (10th Edition).
