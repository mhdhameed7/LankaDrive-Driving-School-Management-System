                                        Sri Lanka Institute of Advanced Technological Education (SLIATE)
                                          Advanced Technological Institute – Kurunegala
                                        Higher National Diploma in Information Technology
                                                      Batch-2324(FT)

                                LankaDrive: Professional Driving School Management System

                                      SOFTWARE REQUIREMENTS SPECIFICATION
                                                      (SRS)

                                              IT4052 | ICT Project

                                                  Supervisor
                                          Mr. K.W.G.S.K. Konthasinghe

                                        M.R.M Hameed - KUR/IT/2324/F/0056

---

## Table of Contents
1. Introduction
   1.1 Purpose
   1.2 Intended Audience
   1.3 Product Scope
2. General Description
   2.1 Product Perspective
   2.2 Product Functions (High-Level)
   2.3 User Characteristics
   2.4 User Community
   2.5 Features and Benefits
   2.6 Operational Environment
   2.7 Assumptions and Dependencies
3. Functional Requirements
   3.1 Authentication & Security
   3.2 Student Registry Management
   3.3 Licensing Pipeline (8-Stage Tracker)
   3.4 Financial & Payment Module
   3.5 Resource & Fleet Management
   3.6 Instructor Management Module
   3.7 Dashboard & Reporting
   3.8 Use Case Summary
4. Interface Requirements
   4.1 Hardware Interfaces
   4.2 Software Interfaces
   4.3 Communication Interfaces
5. Design Constraints
   5.1 Technical Constraints
   5.2 Business Constraints
   5.3 Security Constraints
   5.4 Deployment Constraints
6. Non-Functional Attributes
   6.1 Performance
   6.2 Security
   6.3 Reliability & Availability
   6.4 Usability
   6.5 Maintainability
   6.6 Portability
7. Out of Scope – Future Phases
   7.1 Limitations (Phase 1)
8. Appendices
   8.1 Acronyms and Abbreviations

---

## 1. Introduction

### 1.1 Purpose
The purpose of this Software Requirements Specification (SRS) document is to provide a complete, unambiguous, and verifiable description of the requirements for **LankaDrive: Professional Driving School Management System**. This document serves as the foundation for the development, design, and testing phases of the project. 

### 1.2 Intended Audience
*   **Developer:** M.R.M Hameed (to implement the system as per specified requirements).
*   **Supervisor:** Mr. K.W.G.S.K. Konthasinghe (to evaluate and guide the project development).
*   **Clients/End-Users:** Driving School Owners and Administrators.

### 1.3 Product Scope
LankaDrive is a modern, offline-first desktop application designed exclusively for private driving schools. It aims to replace inefficient, manual paper-based processes with a secure, centralized digital workflow. The core modules include student registration, an 8-stage licensing pipeline tracker, financial management (payments and balances), and resource/fleet management (instructors and vehicles).

Out of scope for Phase 1: Online student portals, automated SMS notifications, and cloud data synchronization.

---

## 2. General Description

### 2.1 Product Perspective
LankaDrive is a self-contained desktop application that operates completely offline, ensuring maximum reliability and data privacy. It is developed using the ERVS stack (Electron.js, React.js, Vite, SQLite). The application runs locally on the driving school's computer and uses Inter-Process Communication (IPC) to securely bridge the React frontend with the SQLite database backend.

### 2.2 Product Functions (High-Level)
*   **User Authentication:** Secure Admin login to protect sensitive data.
*   **Student Management:** Digital enrollment, profiling, and advanced search functionality.
*   **Licensing Tracker:** Visual real-time tracking of students through 8 mandatory stages of acquiring a driving license.
*   **Financial Tracking:** Recording payments, calculating outstanding dues, and generating receipt logs.
*   **Resource Management:** Tracking instructor schedules, vehicle availability, maintenance, and fuel logs.

### 2.3 User Characteristics
*   **Administrators / Owners:** High computer literacy; require daily access to manage enrollments, track finances, and assign resources.
*   **Front Desk Staff:** Basic computer literacy; responsible for data entry, recording payments, and updating student progress stages.

### 2.4 User Community
The primary users are internal staff members of the driving school (Owners, Managers, and Clerks). The system is designed to be highly responsive and intuitive, requiring minimal training to operate.

### 2.5 Features and Benefits
*   **Centralized Data:** Eliminates data fragmentation scattered across notebooks.
*   **Automated Tracking:** The 8-stage pipeline prevents students from missing mandatory licensing steps.
*   **Financial Clarity:** Automated calculation of balances reduces accounting errors.
*   **Offline Reliability:** Continuous operation regardless of internet connectivity.

### 2.6 Operational Environment
*   **Operating System:** Windows 10/11, macOS, or Linux.
*   **Architecture:** Desktop application (Electron-based).
*   **Database:** Local SQLite database file (`database.sqlite`).

### 2.7 Assumptions and Dependencies
*   The driving school has a dedicated computer system for administrative tasks.
*   The system will be operated by authorized personnel only.
*   Local storage is sufficient and regularly backed up by the user (or via an export feature).

---

## 3. Functional Requirements

### 3.1 Authentication & Security
*   **FR-01:** The system shall require users to authenticate using a valid username and password.
*   **FR-02:** The system shall support security questions for password recovery.
*   **FR-03:** The UI frontend shall communicate securely with the SQLite backend using Electron IPC handlers.

### 3.2 Student Registry Management
*   **FR-04:** The system shall allow admins to register new students with details including Name, NIC, DOB, address, contact info, and preferred license class.
*   **FR-05:** The system shall generate a unique Candidate ID (e.g., CND-2025-001) for every registered student.
*   **FR-06:** The system shall provide advanced search and filtering by Name, NIC, or Candidate ID.
*   **FR-07:** The system shall allow admins to upload and manage student documents.

### 3.3 Licensing Pipeline (8-Stage Tracker)
*   **FR-08:** The system shall track the student's progress through 8 distinct stages: 
    1. Registration, 2. Medical, 3. Written Exam, 4. Learners Permit, 5. Training, 6. Practical Exam, 7. Pass/Fail, 8. License Issued.
*   **FR-09:** The system shall allow updating a candidate's status and stage based on exam results and medical approvals.
*   **FR-10:** The system shall record details of Written and Practical Exams (exam date, attempt number, result).

### 3.4 Financial & Payment Module
*   **FR-11:** The system shall record all student payments, specifying the amount and payment date.
*   **FR-12:** The system shall automatically calculate and display outstanding balances based on the selected training package.
*   **FR-13:** The system shall auto-generate receipt numbers for each transaction.

### 3.5 Resource & Fleet Management
*   **FR-14:** The system shall allow the addition and management of vehicles (Make, model, plate number, transmission type).
*   **FR-15:** The system shall maintain maintenance logs and fuel logs for each vehicle.
*   **FR-16:** The system shall allow the scheduling of training sessions (Batch Sessions) assigning instructors and vehicles without double-booking.

### 3.6 Instructor Management Module
The system shall provide a streamlined module for managing instructors:
*   **FR-17 (Registration):** Capture Instructor ID, Full Name, NIC, Phone Number, Email, Address, Gender, and Date Joined.
*   **FR-18 (License Info):** Record License Number, Categories (A, B1, B, C1, C, etc.), and License Expiry Date.
*   **FR-19 (Status & Availability):** Track status (Active, On Leave, Suspended, Retired) and define Working Days, Working Hours, and Availability.
*   **FR-20 (Batch Assignment):** View assigned batches, Assign Instructor to Batch, and Reassign Instructor.
*   **FR-21 (Vehicle Authorization):** Track Vehicles Instructor Can Train With and Vehicle Categories Allowed.
*   **FR-22 (Performance Tracking):** Calculate Total Students Trained, Students Passed Trial, Students Passed Written Exam, and Pass Rate %.
*   **FR-23 (Leave Management):** Manage Leave Start Date, Leave End Date, Leave Reason, and Leave Status.
*   **FR-24 (Documents):** Store copies of Driving License, Instructor Permit, and other certifications.
*   **FR-25 (Profile Actions):** Add Instructor, Edit Instructor, View Details, Activate / Deactivate, and Delete Instructor.
*   **FR-26 (Instructor List):** Display a simple grid showing Instructor ID, Name, Phone, License Category, Assigned Batch Count, Status, and Actions (View / Edit / Delete).

### 3.7 Dashboard & Reporting
*   **FR-27:** The system shall display a real-time dashboard summarizing total registered candidates, candidates in training, and certified candidates.

### 3.8 Use Case Summary
*   **Register Student:** Admin enters student details and initial payment.
*   **Update Progress:** Admin logs medical pass, updating student to the Written Exam stage.
*   **Schedule Session:** Admin assigns an instructor and vehicle to a student for practical training.
*   **Record Payment:** Admin enters an installment payment, updating the remaining balance.

---

## 4. Interface Requirements

### 4.1 Hardware Interfaces
*   Standard PC peripherals (Keyboard, Mouse, Monitor).
*   No specialized hardware required.

### 4.2 Software Interfaces
*   **SQLite:** Local persistent database.
*   **Electron API:** For native file system access (e.g., exporting database backups).

### 4.3 Communication Interfaces
*   All communication between the React frontend and SQLite database occurs over Electron's IPC bridge. No external internet communication is required for core functionality.

---

## 5. Design Constraints

### 5.1 Technical Constraints
*   The application must be developed using Electron, React, and SQLite.
*   The system must operate 100% offline.

### 5.2 Business Constraints
*   Designed primarily for the administrative workflow of Sri Lankan driving schools.

### 5.3 Security Constraints
*   Passwords must be securely stored.
*   SQL queries must be parameterized to prevent SQL Injection vulnerabilities within the SQLite database.

### 5.4 Deployment Constraints
*   The application will be packaged as a standard desktop executable (.exe for Windows).

---

## 6. Non-Functional Attributes

### 6.1 Performance
*   The application must load in under 3 seconds.
*   Database queries (e.g., searching for a student by NIC) must return results in under 1 second.

### 6.2 Security
*   Data sovereignty is maintained by keeping all data locally on the host machine.
*   The system restricts unauthorized access through a mandatory login screen.

### 6.3 Reliability & Availability
*   As an offline-first desktop application, the system guarantees 100% availability independent of internet connectivity.

### 6.4 Usability
*   The UI must be modern and intuitive, utilizing Tailwind CSS for a clean, professional aesthetic.
*   Navigation must be straightforward, requiring no more than 3 clicks to reach any core module.

### 6.5 Maintainability
*   The codebase must follow a modular component-based architecture in React.

### 6.6 Portability
*   The Electron framework allows the application to be easily ported to macOS or Linux if required in the future.

---

## 7. Out of Scope – Future Phases

### 7.1 Limitations (Phase 1)
*   No cloud backup or synchronization (data is stored locally).
*   No online web portal for students to check their own progress.
*   No automated SMS/Email reminders for upcoming exams or overdue payments.
*   No mobile application companion.

---

## 8. Appendices

### 8.1 Acronyms and Abbreviations
*   **ERVS:** Electron, React, Vite, SQLite.
*   **NIC:** National Identity Card.
*   **IPC:** Inter-Process Communication.
*   **SRS:** Software Requirements Specification.
*   **UI/UX:** User Interface / User Experience.
