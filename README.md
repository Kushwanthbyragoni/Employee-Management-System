# 🏢 Employee Management System (EMS)

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.18-000000?style=for-the-badge&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-c8502a?style=for-the-badge)

**A full-stack Employee Attendance Management System with role-based access control, real-time attendance tracking, and multi-level analytics dashboards.**

</div>

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Demo Credentials](#-demo-credentials)
- [Role-Based Features](#-role-based-features)
- [API Reference](#-api-reference)
- [Team](#-team)

---

## 📖 Overview

The **Employee Management System (EMS)** is a full-stack web application designed to streamline workforce management for organizations of all sizes. It provides role-based dashboards for Employees, HR Managers, and CEOs — each with tailored functionality including attendance tracking, employee directory management, analytics, and organizational reporting.

The system features a clean, editorial-style UI with real-time data updates, secure role-based authentication, and a RESTful Node.js/Express backend connected to a MySQL database.

---

## ✨ Features

- 🔐 **Role-Based Authentication** — Separate dashboards for Employee, HR, and CEO roles
- ⏱️ **Live Attendance Tracking** — One-click Check-In / Check-Out with live clock
- 📊 **Analytics Dashboards** — Charts for attendance trends, department breakdowns, and performance
- 👤 **Profile Management** — Editable profiles with photo upload for all roles
- 🗂️ **Employee Directory** — Searchable and filterable employee cards
- 📋 **Attendance Records** — Full history with multi-filter support
- 📁 **File Uploads** — Profile image management via Multer
- 🎨 **Shared UI System** — Consistent design via `shared.css` and `shared.js`

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Runtime** | Node.js 18+ |
| **Backend Framework** | Express.js 4.18 |
| **Database** | MySQL 8.0 |
| **Authentication** | bcryptjs, Session-based |
| **File Uploads** | Multer |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |
| **Charts** | Chart.js |
| **Fonts** | Playfair Display, IBM Plex Sans, IBM Plex Mono |

---

## 📁 Project Structure

```
Employee Management System/
│
├── login.html                   # Login page — entry point
├── employee-dashboard.html      # Employee role dashboard
├── hr-dashboard.html            # HR role dashboard
├── ceo-dashboard.html           # CEO role dashboard
├── shared.css                   # Shared styles across all dashboards
├── shared.js                    # Shared profile modal & utility logic
│
├── server.js                    # Main Node.js/Express backend
├── New_attandance_schema.sql    # Full MySQL schema + seed data
├── package.json                 # Node dependencies
│
├── uploads/                     # Profile images (auto-created, git-ignored)
├── node_modules/                # Dependencies (git-ignored)
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js 18+](https://nodejs.org/)
- [MySQL 8.0+](https://dev.mysql.com/downloads/)
- npm

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/Kushwanthbyragoni/employee-management-system.git
cd employee-management-system
```

### Step 2 — Install Dependencies

```bash
npm install
```

### Step 3 — Set Up the Database

Open MySQL Workbench or terminal and create the database:

```sql
CREATE DATABASE IF NOT EXISTS employee_db;
```

Then import the schema and seed data:

```bash
mysql -u root -p employee_db < New_attandance_schema.sql
```

Or paste the contents of `New_attandance_schema.sql` directly into MySQL Workbench and execute.

### Step 4 — Configure Database Password

Open `server.js` and update the MySQL password to match yours:

```js
password: "your_mysql_password",
```

### Step 5 — Create Uploads Folder

```bash
mkdir uploads
```

### Step 6 — Start the Server

```bash
node server.js
```

Server runs at:
```
http://localhost:5000
```

### Step 7 — Open the App

Open `login.html` in your browser using **Live Server** in VS Code, or simply double-click the file.

---

## 🔑 Demo Credentials

| Role | Username | Password |
|---|---|---|
| Employee | `emp001` | `emp123` |
| Employee | `emp002` | `emp123` |
| HR | `hr001` | `hr123` |
| CEO | `ceo001` | `ceo123` |

---

## 👥 Role-Based Features

### 👤 Employee Dashboard
- Live clock with one-click **Check-In / Check-Out**
- Today's attendance summary (check-in time, check-out time, hours worked)
- **Employee Directory** — search by name or department
- **My History** — bar chart of last 14 days + full attendance log

### 🗂️ HR Dashboard
- **Overview** — KPI cards (total, present, absent today), department donut chart
- **Employees** — card grid with filter by name/department, click to view full profile + attendance history
- **Attendance** — searchable and filterable table of all attendance records
- Profile editing for self

### 👔 CEO Dashboard
- **Overview** — 4 KPI cards + weekly trend line + department bar chart + today's absent list
- **All Employees** — full table with salary, phone, email, and live status
- **Attendance** — complete records with multi-filter (name, date, status)
- **Analytics** — monthly attendance rate chart, hours distribution donut, top performers table

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Body | Description |
|---|---|---|---|
| `POST` | `/login` | `{ username, password }` | Returns `{ success, user }` |

### Employees
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/getEmployees` | Get all employees |
| `POST` | `/addEmployee` | Add new employee (multipart) |
| `PUT` | `/updateEmployee/:id` | Update employee (multipart) |
| `DELETE` | `/deleteEmployee/:id` | Delete employee |
| `PUT` | `/updateUserProfile/:userId` | Update HR/CEO profile |

### Attendance
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/attendance/checkin` | `{ employee_id }` — Check in |
| `POST` | `/attendance/checkout` | `{ employee_id }` — Check out |
| `GET` | `/attendance/today/:employee_id` | Today's record |
| `GET` | `/attendance/employee/:employee_id` | Full history |
| `GET` | `/attendance/all` | All records (HR/CEO) |


---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">
  <p>Built with ❤️ · <strong>Employee Management System 2024</strong></p>
</div>