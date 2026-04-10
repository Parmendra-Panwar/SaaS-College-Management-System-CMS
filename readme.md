# SaaS College Management System (MONOREPO)

SaaS College Management System

Live URL -> https://saascms.vercel.app

## Features
- **Dual-Account System:** Specialized logic for **Business accounts** (Property/Activity owners) and **Standard Travelers** (Social "Trips" posts). [Sign Up](https://SaaS College Management Systems.vercel.app/signup)
- **Stateless Authentication:** Secure JWT-based auth with custom middleware for role-based access control (RBAC).
- **Data Integrity:** Global error handling with `wrapAsync` wrappers and automated Cloudinary/Review cleanup upon data deletion.
- **Robust Review System:** Integrated feedback loops for listings, activities, and trips.
- **Optimized CRUD Engine:** High-performance MongoDB schemas designed for efficient image handling and data cleanup.

---

## Tech Stack

| Category | Technology |
| :--- | :--- |
| **Runtime** | Node.js |
| **Framework** | Express.js |
| **Database** | MongoDB (Mongoose ODM) |
| **Storage** | Cloudinary (via Multer) |
| **Auth** | JWT & BcryptJS |
| **Validation** | Joi |

---

## Deep Dive into Features

### 1. AI-Driven Itinerary Generator 
When the API is triggered, the system converts Source and Destination strings into Latitude/Longitude coordinates. 
* **Fetch & Memory Load:** Uses a Bounding Box /


<div align="center">
  <img src="https://res.cloudinary.com/dvvnxb5ow/image/upload/v1775206305/Screenshot_2026-04-03_141443_e65s6n.png" width="48%" />
  <img src="https://res.cloudinary.com/dvvnxb5ow/image/upload/v1775205665/Screenshot_2026-04-03_140858_i7vj5z.png" width="48%" />
</div>

---

**Developed by Parmendra (Paras) Pawar** *Pre-final year B-Tech (AI & ML) | Ex-SDE Intern at Medorn Venture | NCC Cadet*

```