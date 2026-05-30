# SaaS College Management System (MONOREPO)

A robust, Multi-Tenant SaaS platform designed to streamline administrative and academic workflows for multiple educational institutions under a single ecosystem. Built with the MERN Stack, this project replaces fragmented systems with a unified, high-impact software solution featuring strict data isolation and predictive analytics.

Live URL -> [https://academia-erp.vercel.app](https://academia-erp.vercel.app)

## Features
- **Multi-Tenant Architecture:** Engineered with a custom "Tenant Interceptor" middleware to ensure 100% data isolation across independent institutions using a single database.
- **Granular RBAC:** Specialized access control for 5+ distinct roles including Admin, Manager, Principal, Teacher, and Student.
- **High-Velocity Onboarding:** "ticBased" creation engine using bulk operations (`insertMany`) to onboard entire semesters and student cohorts in seconds.
- **Student Productivity Engine:** An integrated K-Means clustering service that categorizes students into performance cohorts based on real-time academic metrics.
- **Optimized Data Structures:** Uses fixed-size nested arrays and MongoDB positional operators (`$set`) for high-frequency updates like attendance and bi-weekly reports without database bloat.

---

## Tech Stack

| Category | Technology |
| :--- | :--- |
| **Runtime** | Node.js |
| **Framework** | Express.js |
| **Frontend** | React, Redux Toolkit (RTK), Tailwind CSS |
| **Database** | MongoDB (Mongoose ODM) |
| **Auth** | JWT (Tenant-Aware) & BcryptJS |
| **Validation** | Joi |
| **Analytics** | Custom K-Means Implementation |

---

## Deep Dive into Features

### 1. Multi-Tenant Schema & Identity Management
The system functions via a "Gatekeeper" logic. Every request is processed through a Tenant Interceptor middleware that extracts the `collegeId` from the JWT.
* **Strict Isolation:** Automatically injects the `collegeId` into every Mongoose query, preventing any possibility of data leakage between different schools.
* **Identity Mapping:** Centralized Auth system manages different permission levels, ensuring a Principal from "College A" can never access data from "College B."

<div align="center">
  <img src="https://res.cloudinary.com/dvvnxb5ow/image/upload/v1775206305/Screenshot_2026-04-03_141443_e65s6n.png" width="48%" />
  <img src="https://res.cloudinary.com/dvvnxb5ow/image/upload/v1775205665/Screenshot_2026-04-03_140858_i7vj5z.png" width="48%" />
</div>

### 2. High-Frequency Operational Logic
To maintain high performance under heavy load, the system utilizes specialized data structures for daily operations.
* **Efficient Storage:** Instead of creating new documents daily, attendance is managed via a 91x4 nested array (13 weeks x 4 periods), significantly reducing document overhead.
* **Teacher Performance:** Every update to a student's record increments a `workCount` on the Teacher model, creating a built-in metric for staff engagement and accountability.

<div align="center">
  <img src="https://res.cloudinary.com/dvvnxb5ow/image/upload/v1775206305/Screenshot_2026-04-03_141443_e65s6n.png" width="48%" />
  <img src="https://res.cloudinary.com/dvvnxb5ow/image/upload/v1775205665/Screenshot_2026-04-03_140858_i7vj5z.png" width="48%" />
</div>

### 3. Student Productivity Engine (K-Means)
A bi-weekly analytical service that moves beyond simple grade-tracking to understand student behavior patterns.
* **Feature Vector Analysis:** The engine processes two primary metrics: **Attendance Rate** and **Work Score** (from bi-weekly reports).
* **Clustering Logic:** Runs a K-Means algorithm to group students into three performance cohorts: *High Achievers*, *Consistent*, and *At-Risk*. This allows administrators to track "Cluster Movement" and intervene before a student's performance drops significantly.

<div align="center">
  <img src="https://res.cloudinary.com/dvvnxb5ow/image/upload/v1775206305/Screenshot_2026-04-03_141443_e65s6n.png" width="48%" />
  <img src="https://res.cloudinary.com/dvvnxb5ow/image/upload/v1775205665/Screenshot_2026-04-03_140858_i7vj5z.png" width="48%" />
</div>

---

@fd
**Developed by Parmendra (Paras) Pawar** *Pre-final year B-Tech (AI & ML) | Ex-SDE Intern | NCC Cadet*
