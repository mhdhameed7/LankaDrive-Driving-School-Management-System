# LankaDrive - Advanced Project Documentation

This document contains high-fidelity system diagrams for the LankaDrive Driving School Management System.

## 1. System Architecture Diagram
A detailed view of the Desktop Application architecture using Electron, React, and SQLite.

```mermaid
graph TB
    subgraph "Presentation Layer (React + Vite)"
        UI[User Interface Components]
        State[React State / Context]
        Router[React Router - Navigation]
    end

    subgraph "Bridge Layer (Electron Preload)"
        Bridge[window.api - Context Bridge]
    end

    subgraph "Business Logic Layer (Node.js Main Process)"
        IPC[IPC Main Handlers]
        Auth[Authentication Logic]
        BusLogic[Business Rules / Validations]
    end

    subgraph "Data Layer (SQLite)"
        SQL[sql.js Engine]
        DB[(database.sqlite)]
    end

    UI <--> State
    State <--> Router
    UI <--> Bridge
    Bridge <--> IPC
    IPC <--> Auth
    IPC <--> BusLogic
    BusLogic <--> SQL
    SQL <--> DB
```

## 2. Enhanced Entity Relationship Diagram (ERD)
The complete logical data model representing the driving school's data structure.

```mermaid
erDiagram
    USERS ||--o{ STUDENTS : "manages"
    STUDENTS ||--o{ PAYMENTS : "makes"
    STUDENTS ||--o{ ATTENDANCE : "attends"
    STUDENTS ||--o{ EXAMS : "attempts"
    INSTRUCTORS ||--o{ ATTENDANCE : "conducts"
    VEHICLES ||--o{ ATTENDANCE : "used_in"

    USERS {
        int id PK
        string username
        string password
        string role "Admin / Manager"
    }

    STUDENTS {
        string id PK "DS-YYYY-XXX"
        string name
        string nic UK
        date dob
        string phone
        string email
        string address
        string licenseClass "Class 3, 4, etc"
        int currentStage "1-8"
        string status "Enrolled, Certified, etc"
        date registeredDate
    }

    INSTRUCTORS {
        int id PK
        string name
        string phone
        string licenseNumber
        string specialization
    }

    VEHICLES {
        int id PK
        string plateNumber UK
        string model
        string transmission "Manual / Auto"
        string status "Active / Maintenance"
    }

    PAYMENTS {
        int id PK
        string studentId FK
        float amount
        string paymentType "Full / Installment"
        date paymentDate
        string status "Paid / Pending"
    }

    ATTENDANCE {
        int id PK
        string studentId FK
        int instructorId FK
        int vehicleId FK
        date sessionDate
        string duration "1 Hr / 2 Hr"
        string status "Present / Absent"
    }

    EXAMS {
        int id PK
        string studentId FK
        string type "Written / Practical"
        date examDate
        int score
        string result "Pass / Fail"
    }
```

## 3. Improved Use Case Diagram
Organized by functional modules for better readability.

```mermaid
useCaseDiagram
    actor "System Administrator" as Admin
    
    package "Identity & Access" {
        usecase "Login to System" as UC1
        usecase "Manage User Accounts" as UC2
    }

    package "Student Lifecycle" {
        usecase "Student Registration" as UC3
        usecase "Track Pipeline Progress" as UC4
        usecase "Generate Learner Permit" as UC5
    }

    package "Operations" {
        usecase "Manage Instructors" as UC6
        usecase "Schedule Lessons" as UC7
        usecase "Record Attendance" as UC8
        usecase "Vehicle Maintenance Log" as UC9
    }

    package "Finance & Reporting" {
        usecase "Process Payments" as UC10
        usecase "View Analytics Dashboard" as UC11
        usecase "Generate Revenue Reports" as UC12
    }

    Admin --> UC1
    Admin --> UC2
    Admin --> UC3
    Admin --> UC4
    Admin --> UC5
    Admin --> UC6
    Admin --> UC7
    Admin --> UC8
    Admin --> UC9
    Admin --> UC10
    Admin --> UC11
    Admin --> UC12
```

## 4. Professional Class Diagram
Detailed methods and internal system layers.

```mermaid
classDiagram
    class DatabaseManager {
        +initialize()
        +execQuery(query)
        +saveChanges()
    }
    
    class IPCBridge {
        +handleLogin()
        +getStudents()
        +updateStatus()
        +recordPayment()
    }

    class BaseEntity {
        +int id
        +date createdAt
        +save()
        +delete()
    }

    class Student {
        +string dsId
        +string nic
        +int stage
        +calculateBalance()
        +promoteNextStage()
    }

    class Instructor {
        +string licenseNo
        +checkAvailability()
    }

    class Transaction {
        +float amount
        +string type
        +verifyPayment()
    }

    BaseEntity <|-- Student
    BaseEntity <|-- Instructor
    BaseEntity <|-- Transaction
    IPCBridge ..> DatabaseManager : uses
    DatabaseManager ..> BaseEntity : persists
```

## 5. Detailed Gantt Chart
Development roadmap from inception to deployment.

```mermaid
gantt
    title LankaDrive Project Roadmap 2025
    dateFormat  YYYY-MM-DD
    section Requirement Analysis
    System Study & Proposals    :done, a1, 2025-05-01, 5d
    UI/UX Wireframing           :done, a2, 2025-05-06, 4d
    section Core Development
    Database & IPC Setup        :done, b1, 2025-05-10, 3d
    Authentication Module       :done, b2, 2025-05-13, 2d
    Student Management (UI/DB)  :active, b3, 2025-05-15, 6d
    Licensing Pipeline Tracker  :active, b4, 2025-05-18, 4d
    section Advanced Modules
    Payment & Billing System    :b5, 2025-05-22, 5d
    Lesson Scheduling           :b6, 2025-05-25, 5d
    Analytics & Reporting       :b7, 2025-05-28, 4d
    section Final Phase
    Integration Testing         :c1, 2025-06-01, 5d
    User Manual & Docs          :c2, 2025-06-05, 3d
    Final Deployment            :milestone, c3, 2025-06-08, 0d
```
