# Projects Module - NextGenERP

## Overview
The **Projects Module** is a comprehensive project management solution within the NextGenERP ecosystem. It is designed to handle the entire lifecycle of enterprise projects, from initial planning and template generation to task execution, time tracking, and risk management. 

This module allows organizations to collaborate effectively, monitor progress in real-time, manage resources, and ensure projects are delivered on time and within budget.

---

## Feature Categorization

### 🟢 Core Features (The Fundamentals)
These are the essential building blocks of the module. Without these, the module cannot function.
*   **Project Management (`Project`, `ProjectType`, `ProjectStatus`)**: Create, update, and track high-level projects. Define project scope, start/end dates, priorities, and monitor overall completion.
*   **Task Management (`Task`, `TaskStatus`, `KanbanState`)**: Break down projects into actionable tasks. Track task status (e.g., Todo, In Progress, Done) and manage work via Kanban boards.
*   **Resource Assignment (`ProjectUser`)**: Assign users (employees, contractors) to specific projects and control their roles/permissions within the context of that project.

### 🟡 Intermediate Features (Enhancing Workflow)
These features build upon the core entities to provide deeper control and tracking.
*   **Time Tracking (`Timesheet`, `TimesheetDetail`)**: Allow users to log hours worked on specific projects or tasks on a daily/weekly basis.
*   **Activity Categorization & Costing (`ActivityType`, `ActivityCost`)**: Define what type of work is being done (e.g., Development, Consulting, QA) and attach cost rates to these activities to calculate the financial burn of a project.
*   **Project Templates (`ProjectTemplate`, `ProjectTemplateTask`)**: Save successful project structures (including predefined tasks) as templates so new, similar projects can be spun up instantly without manual data entry.

### 🔴 Advanced Features (Complex Logic & Analytics)
These features provide enterprise-grade capabilities for complex project scenarios.
*   **Task Dependencies (`TaskDependency`, `DependencyType`)**: Define relationships between tasks (e.g., "Task B cannot start until Task A finishes"). Essential for Gantt charts and critical path calculations.
*   **Risk Management (`ProjectRisk`, `RiskSeverity`, `RiskStatus`)**: Identify, document, and track potential risks to the project. Assign severity levels and mitigation strategies to ensure nothing derails the project.
*   **Progress Tracking & Updates (`ProjectUpdate`, `PercentCompleteMethod`)**: Maintain a historical log of status updates and calculate project completion dynamically based on different methods (e.g., manual entry vs. task weightage).

---

## Key Components Explained

### 1. The Domain Model (Backend - Java/Spring Boot)
The heart of the module lies in its domain models. These Java classes represent the database tables and business logic.
*   **`Project`**: The root entity. Everything ties back to a Project.
*   **`Task`**: Represents a single unit of work. It links to a `Project` and can have multiple timesheet entries associated with it.
*   **`Timesheet`**: Represents a time-logging period (usually a week) for a specific user, containing multiple `TimesheetDetail` rows for granular day-by-day logging.

### 2. The API Layer (Controllers & Services)
*   **Controllers (`presentation/controller`)**: These are the entry points for the frontend. They expose RESTful endpoints (like `GET /api/projects` or `POST /api/tasks`).
*   **Services (`application/service`)**: Where the heavy lifting happens. If a task is marked "Complete", the Service layer might also check if the parent project should automatically be marked complete, or if dependent tasks should be unlocked.

### 3. The Frontend (Next.js / React)
The user interface is built using modern web technologies to be snappy and responsive.
*   **Dashboard (`app/projects/page.tsx`)**: Gives a bird's-eye view of all active projects, overdue tasks, and general metrics.
*   **Kanban Board**: A visual drag-and-drop interface mapping to `KanbanState`, allowing teams to easily move tasks through different stages of completion.

### 4. The Database (PostgreSQL)
All structured data is securely stored in a relational PostgreSQL database. Entities like Projects, Tasks, and Timesheets are heavily related using Foreign Keys to maintain data integrity.

---

## 📝 How to Update This Document
*This document is meant to be a living wiki for the Projects Module.*
Whenever you add a new feature (e.g., "Gantt Charts", "Client Invoicing", "Milestones"):
1. Open this `Projects.md` file.
2. Determine its complexity and add it to the appropriate section (**Core**, **Intermediate**, or **Advanced**).
3. If you introduced a massive new concept, add a brief paragraph explaining it under **Key Components Explained**.
4. Keep explanations simple, focusing on *what* the feature does and *why* it exists, avoiding overly dense code snippets here.
