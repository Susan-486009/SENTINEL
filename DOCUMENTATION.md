# LASUSTECH COMPLAINT PORTAL — PROJECT DOCUMENTATION

---

## TABLE OF CONTENTS

1. Project Overview
2. Technologies Used
3. Project Structure
4. How to Start the Servers
5. Database Setup & Switching (MongoDB / MySQL)
6. Backend API Endpoints
7. Frontend Pages & Routes
8. All Seeded Users & Credentials
9. Project Summary

---

## 1. PROJECT OVERVIEW

The **LASUSTECH Complaint Portal** is a full-stack web application built for Lagos State University of Science and Technology (LASUSTECH). It allows students and staff to submit, track, and manage complaints related to academic, facility, financial, security, and IT issues.

The system supports:

- Student/Staff registration and login (via email OR matric number)
- Anonymous complaint submission with file attachments (images, PDFs, documents)
- AI-powered complaint analysis (using Groq / Llama 3.1)
- Admin dashboard for reviewing and updating complaint statuses
- Public complaint tracking by reference ID (no login required)
- Image compression using Sharp before storing uploads
- JWT-based authentication with access and refresh tokens

---

## 2. TECHNOLOGIES USED

### Frontend

| Technology             | Purpose                                  |
| ---------------------- | ---------------------------------------- |
| **React.js**     | UI framework — all pages and components |
| **Vite**         | Fast frontend build tool and dev server  |
| **Vanilla CSS**  | Styling (no Tailwind/Bootstrap)          |
| **React Router** | Client-side page routing                 |
| **Context API**  | Global auth state management             |

### Backend

| Technology                   | Purpose                                            |
| ---------------------------- | -------------------------------------------------- |
| **Node.js**            | JavaScript runtime for the server                  |
| **Express.js**         | HTTP server and routing framework                  |
| **Mongoose**           | MongoDB ODM (Object Document Mapper)               |
| **MySQL2**             | MySQL driver (kept as backup, not active)          |
| **JWT (jsonwebtoken)** | Authentication tokens (access + refresh)           |
| **Bcrypt**             | Password hashing                                   |
| **Multer**             | Handling multipart file uploads                    |
| **Sharp**              | Image compression and resizing (max 800px wide)    |
| **Groq API**           | AI complaint analysis using Llama 3.1-8b-instant   |
| **XSS**                | Input sanitization to prevent cross-site scripting |
| **CORS**               | Cross-origin request handling                      |
| **Dotenv**             | Environment variable loading                       |

### Database

| Database                | Status    | Purpose                                         |
| ----------------------- | --------- | ----------------------------------------------- |
| **MongoDB Atlas** | ✅ ACTIVE | Primary cloud database (NoSQL)                  |
| **MySQL**         | 💤 BACKUP | Legacy relational DB (kept in `src/mysqldb/`) |

---

## 3. PROJECT STRUCTURE

```
susan-project/
├── .env                          # Frontend environment variables
├── index.html                    # HTML entry point
├── vite.config.js                # Vite configuration
├── package.json                  # Frontend dependencies
├── src/
│   ├── main.jsx                  # React app entry point
│   ├── App.jsx                   # Route definitions
│   ├── index.css                 # Global styles
│   ├── pages/                    # All page components
│   │   ├── Home.jsx              # Landing page
│   │   ├── Login.jsx             # Login page
│   │   ├── Register.jsx          # Registration page
│   │   ├── Dashboard.jsx         # Student dashboard
│   │   ├── AdminDashboard.jsx    # Admin dashboard
│   │   ├── SubmitComplaint.jsx   # Complaint submission form
│   │   ├── TrackComplaint.jsx    # Public complaint tracker
│   │   └── Settings.jsx          # User settings page
│   ├── components/               # Reusable UI components
│   ├── context/                  # Global state (AuthContext)
│   ├── hooks/                    # Custom React hooks
│   ├── services/                 # API call functions (axios/fetch)
│   └── layouts/                  # Layout wrappers
│
└── backend/
    ├── .env                      # Backend environment variables
    ├── .env.example              # Template for new developers
    ├── seed.js                   # Database seeding script
    ├── package.json              # Backend dependencies
    └── src/
        ├── server.js             # Express app entry point
        ├── config/
        │   ├── config.js         # Centralized config object
        │   └── db.js             # MongoDB (Mongoose) connection
        ├── models/               # MongoDB Mongoose schemas
        │   ├── User.js           # User schema
        │   ├── Complaint.js      # Complaint schema (with embedded files)
        │   └── SuspiciousActivity.js
        ├── controllers/          # Route handler functions
        │   ├── auth.controller.js
        │   ├── complaint.controller.js
        │   └── ai.controller.js
        ├── services/             # Business logic layer
        │   ├── auth.service.js
        │   ├── complaint.service.js
        │   ├── file.service.js
        │   └── ai.service.js
        ├── routes/               # Express route definitions
        │   ├── index.js
        │   ├── auth.routes.js
        │   ├── complaint.routes.js
        │   └── ai.routes.js
        ├── middleware/           # Express middleware
        │   ├── auth.middleware.js
        │   ├── validate.middleware.js
        │   ├── complaint.validate.js
        │   ├── upload.middleware.js
        │   ├── rateLimit.middleware.js
        │   ├── security.middleware.js
        │   └── error.middleware.js
        ├── utils/                # Utility/helper functions
        │   ├── auth.js
        │   ├── response.js
        │   ├── asyncHandler.js
        │   └── complaint.utils.js
        ├── mysqldb/              # *** BACKUP — MySQL legacy code ***
        │   ├── db.js
        │   ├── auth.service.js
        │   ├── complaint.service.js
        │   └── file.service.js
        └── uploads/
            ├── raw/              # Temporary uploads before compression
            └── compressed/       # Final stored files (Sharp-compressed)
```

---

## 4. HOW TO START THE SERVERS

### Prerequisites

- Node.js v18 or higher installed
- A terminal / command prompt

### Step 1 — Install Dependencies

Open two terminals:

**Terminal 1 — Backend:**

```bash
cd susan-project/backend
npm install
```

**Terminal 2 — Frontend:**

```bash
cd susan-project
npm install
```

### Step 2 — Environment Variables

The `.env` files are already configured. The key variables are:

**`backend/.env`:**

```
NODE_ENV=development
PORT=5000

# MongoDB (ACTIVE)
DATABASE_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/DATABASE_NAME

# MySQL (BACKUP — uncomment to switch)
# DATABASE_URI=mysql://root:@localhost:3306/lasustech_complaints

JWT_SECRET=super_secret_sentinel_key_2024
JWT_EXPIRES_IN=7d
MAX_FILE_SIZE_MB=5
UPLOADS_PATH=src/uploads
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.1-8b-instant
```

**`susan-project/.env` (frontend):**

```
VITE_API_URL=http://localhost:5000/api/v1
GROQ_API_key=your_groq_api_key_here
```

### Step 3 — Start the Servers

**Backend (runs on port 5000):**

```bash
cd susan-project/backend
npm run dev
```

**Frontend (runs on port 5173):**

```bash
cd susan-project
npm run dev
```

### Step 4 — Access the App

| Service      | URL                                 |
| ------------ | ----------------------------------- |
| Frontend     | http://localhost:5173               |
| Backend Root | http://localhost:5000               |
| API Base     | http://localhost:5000/api/v1        |
| Health Check | http://localhost:5000/api/v1/health |

### (Optional) Seed the Database

```bash
cd susan-project/backend
node seed.js
```

This creates 3 admins + 50 students in the database.

---

## 5. DATABASE SETUP & SWITCHING

### Currently Active: MongoDB Atlas

The project currently uses **MongoDB Atlas** (cloud NoSQL database). Data is stored in the `LASUSTECH-MONITOR` database on the `susan-project` Atlas cluster.

MongoDB models are defined using **Mongoose** in `backend/src/models/`:

- `User` — stores user accounts
- `Complaint` — stores complaints with embedded file metadata
- `SuspiciousActivity` — logs suspicious behaviour for admin review

### Switching to MySQL

The original MySQL code is **fully preserved** in `backend/src/mysqldb/`. To switch back to MySQL:

**Step 1** — Open `backend/.env` and swap the `DATABASE_URI`:

```env
# Comment out MongoDB:
# DATABASE_URI=mongodb+srv://...

# Uncomment MySQL:
DATABASE_URI=mysql://root:YOUR_PASSWORD@localhost:3306/lasustech_complaints
```

**Step 2** — Replace the active service files with the MySQL versions from `src/mysqldb/`:

- Copy `src/mysqldb/db.js` → `src/config/db.js`
- Copy `src/mysqldb/auth.service.js` → `src/services/auth.service.js`
- Copy `src/mysqldb/complaint.service.js` → `src/services/complaint.service.js`
- Copy `src/mysqldb/file.service.js` → `src/services/file.service.js`

**Step 3** — Set up your local MySQL database and run the schema SQL to create the required tables (`users`, `complaints`, `complaint_files`, `suspicious_activities`).

---

## 6. BACKEND API ENDPOINTS

**Base URL:** `http://localhost:5000/api/v1`

All responses follow this structure:

```json
{
  "success": true,
  "message": "Description",
  "data": { ... }
}
```

---

### 🔓 PUBLIC ENDPOINTS (No login required)

#### GET /

**URL:** `http://localhost:5000`
**Description:** Root info — shows API name, version, status, and available endpoints.

---

#### GET /api/v1/health

**Description:** Health check. Returns server status and database connection state.
**Response:**

```json
{ "status": "ok", "timestamp": "...", "db": "connected" }
```

---

#### POST /api/v1/auth/register

**Description:** Register a new student or staff account.
**Body:**

```json
{
  "name": "John Doe",
  "matric": "240303010001",
  "email": "john@example.com",   // OPTIONAL for students
  "password": "Password123!",
  "role": "student"              // "student" | "staff" (default: student)
}
```

**Rules:**

- Matric must be 10–15 digits starting with admission year (e.g., 24...)
- Password must be 8+ characters, with at least 1 uppercase and 1 number
- Email is optional for students; if provided, must be a valid format
- Admins cannot be created via API (admin role is seeded only)

---

#### POST /api/v1/auth/login

**Description:** Log in using email OR matric number plus password.
**Body:**

```json
{
  "identifier": "240303010001",    // Email OR Matric number
  "password": "Password123!"
}
```

**Response:**

```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "tokenType": "Bearer",
  "expiresIn": "7d",
  "user": { "id": "...", "name": "...", "role": "student" }
}
```

---

#### POST /api/v1/auth/refresh

**Description:** Get a new access token using a valid refresh token.
**Body:**

```json
{ "refreshToken": "eyJ..." }
```

---

#### GET /api/v1/complaints/track/:refId

**Description:** Publicly track a complaint status using its reference ID (no login needed).
**Example:** `GET /api/v1/complaints/track/CMP-LZF8K4-A3BX`
**Response:**

```json
{
  "referenceId": "CMP-LZF8K4-A3BX",
  "category": "academic-result",
  "title": "Missing exam score",
  "status": "in_review",
  "anonymous": false,
  "submittedAt": "2026-05-01T...",
  "lastUpdated": "2026-05-01T..."
}
```

---

### 🔐 PROTECTED ENDPOINTS (Requires Bearer Token)

Add this header to all protected requests:

```
Authorization: Bearer <accessToken>
```

---

#### GET /api/v1/auth/me

**Description:** Get the currently logged-in user's profile.
**Response:** User object (no password).

---

#### PATCH /api/v1/auth/me

**Description:** Update your own profile (name and/or email).
**Body:**

```json
{ "name": "New Name", "email": "newemail@example.com" }
```

---

#### POST /api/v1/auth/change-password

**Description:** Change your password.
**Body:**

```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass456!"
}
```

---

#### POST /api/v1/complaints

**Description:** Submit a new complaint. Supports file attachments.
**Content-Type:** `multipart/form-data`
**Fields:**

| Field       | Type    | Required | Description                                                                                                                      |
| ----------- | ------- | -------- | -------------------------------------------------------------------------------------------------------------------------------- |
| category    | string  | ✅       | One of: academic-result, academic-lecturer, facility-maint, facility-hostel, admin-staff, security, financial, it-service, other |
| title       | string  | ✅       | Complaint title (5–200 characters)                                                                                              |
| description | string  | ✅       | Full complaint details (20–5000 characters)                                                                                     |
| anonymous   | boolean | ❌       | Set to true to hide your identity                                                                                                |
| files       | file[]  | ❌       | Up to 5 files (images, PDFs, DOCX — max 5MB each)                                                                               |

**Rate Limit:** Max 3 complaints per hour per user.

---

#### GET /api/v1/complaints/mine

**Description:** Get all complaints submitted by the logged-in user.
**Response:** Array of complaint summaries with file count.

---

#### GET /api/v1/complaints/:id

**Description:** Get full details of a single complaint.

- `:id` can be numeric ID or reference ID (CMP-...)
- Students can only view their own complaints

---

#### DELETE /api/v1/complaints/files/:fileId

**Description:** Delete an attached evidence file. Owner or admin only.

---

#### POST /api/v1/ai/analyze

**Description:** Use AI (Groq Llama 3.1) to analyze complaint text and suggest category, priority, and recommendation.
**Body:**

```json
{ "text": "My exam result is missing from the portal..." }
```

**Response:**

```json
{
  "category": "academic-result",
  "priority": "high",
  "recommendation": "Please visit the examination office with your student ID..."
}
```

---

### 👑 ADMIN-ONLY ENDPOINTS

These require a JWT from an admin account.

---

#### GET /api/v1/complaints

**Description:** Get all complaints (paginated) with optional filters.
**Query Params:**

```
?status=pending
?category=academic-result
?page=1&limit=20
```

---

#### PATCH /api/v1/complaints/:id/status

**Description:** Update the status of any complaint.
**Body:**

```json
{ "status": "in_review" }
```

**Valid Statuses:** `pending` | `in_review` | `resolved` | `rejected`

---

## 7. FRONTEND PAGES & ROUTES

**Base URL:** `http://localhost:5173`

| Page                        | Route          | Access     | Description                                    |
| --------------------------- | -------------- | ---------- | ---------------------------------------------- |
| **Home**              | `/`          | Public     | Landing page with project intro and links      |
| **Login**             | `/login`     | Public     | Login form (email or matric + password)        |
| **Register**          | `/register`  | Public     | Student/staff registration form                |
| **Track Complaint**   | `/track`     | Public     | Enter a reference ID to check complaint status |
| **Student Dashboard** | `/dashboard` | 🔐 Student | View submitted complaints, see statuses        |
| **Submit Complaint**  | `/submit`    | 🔐 Student | Multi-step form to file a new complaint        |
| **Admin Dashboard**   | `/admin`     | 👑 Admin   | Manage all complaints, update statuses         |
| **Settings**          | `/settings`  | 🔐 Any     | Update profile name/email, change password     |

---

## 8. ALL SEEDED USERS & CREDENTIALS

> **All accounts share the same password:** `Password123!`

### Admin Accounts

| Name              | Email                       | Matric   | Role  |
| ----------------- | --------------------------- | -------- | ----- |
| Super Admin       | superadmin@lasustech.edu.ng | ADMIN001 | admin |
| Feedback Reviewer | feedback@lasustech.edu.ng   | ADMIN002 | admin |
| Support Head      | support@lasustech.edu.ng    | ADMIN003 | admin |

### Student Accounts (50 students)

| Email                      | Matric       | Role    |
| -------------------------- | ------------ | ------- |
| student1@lasustech.edu.ng  | 230303010001 | student |
| student2@lasustech.edu.ng  |              | student |
| student3@lasustech.edu.ng  | 250303010003 | student |
| student4@lasustech.edu.ng  | 240303010004 | student |
| student5@lasustech.edu.ng  | 220303010005 | student |
| student6@lasustech.edu.ng  | 240303010006 | student |
| student7@lasustech.edu.ng  | 250303010007 | student |
| student8@lasustech.edu.ng  | 230303010008 | student |
| student9@lasustech.edu.ng  | 220303010009 | student |
| student10@lasustech.edu.ng | 240303010010 | student |
| student11@lasustech.edu.ng | 250303010011 | student |
| student12@lasustech.edu.ng | 230303010012 | student |
| student13@lasustech.edu.ng | 220303010013 | student |
| student14@lasustech.edu.ng | 240303010014 | student |
| student15@lasustech.edu.ng | 250303010015 | student |
| student16@lasustech.edu.ng | 230303010016 | student |
| student17@lasustech.edu.ng | 220303010017 | student |
| student18@lasustech.edu.ng | 240303010018 | student |
| student19@lasustech.edu.ng | 250303010019 | student |
| student20@lasustech.edu.ng | 230303010020 | student |
| student21@lasustech.edu.ng | 220303010021 | student |
| student22@lasustech.edu.ng | 240303010022 | student |
| student23@lasustech.edu.ng | 250303010023 | student |
| student24@lasustech.edu.ng | 230303010024 | student |
| student25@lasustech.edu.ng | 220303010025 | student |
| student26@lasustech.edu.ng | 240303010026 | student |
| student27@lasustech.edu.ng | 250303010027 | student |
| student28@lasustech.edu.ng | 230303010028 | student |
| student29@lasustech.edu.ng | 220303010029 | student |
| student30@lasustech.edu.ng | 240303010030 | student |
| student31@lasustech.edu.ng | 250303010031 | student |
| student32@lasustech.edu.ng | 230303010032 | student |
| student33@lasustech.edu.ng | 220303010033 | student |
| student34@lasustech.edu.ng | 240303010034 | student |
| student35@lasustech.edu.ng | 250303010035 | student |
| student36@lasustech.edu.ng | 230303010036 | student |
| student37@lasustech.edu.ng | 220303010037 | student |
| student38@lasustech.edu.ng | 240303010038 | student |
| student39@lasustech.edu.ng | 250303010039 | student |
| student40@lasustech.edu.ng | 230303010040 | student |
| student41@lasustech.edu.ng | 220303010041 | student |
| student42@lasustech.edu.ng | 240303010042 | student |
| student43@lasustech.edu.ng | 250303010043 | student |
| student44@lasustech.edu.ng | 230303010044 | student |
| student45@lasustech.edu.ng | 220303010045 | student |
| student46@lasustech.edu.ng | 240303010046 | student |
| student47@lasustech.edu.ng | 250303010047 | student |
| student48@lasustech.edu.ng | 230303010048 | student |
| student49@lasustech.edu.ng | 220303010049 | student |
| student50@lasustech.edu.ng | 230303010050 | student |

**Matric format breakdown:** `[YY][030301][XXXX]`

- `YY` = Last 2 digits of admission year (22=2022, 23=2023, 24=2024, 25=2025)
- `030301` = Department code for Computer Science
- `XXXX` = 4-digit student counter

**Login with email OR matric number — both work.**

---

## 9. PROJECT SUMMARY

The LASUSTECH Complaint Portal is a full-stack web application that digitizes and streamlines the complaint management process for LASUSTECH students, staff, and administrators.

### Key Features

| Feature                        | Details                                                                 |
| ------------------------------ | ----------------------------------------------------------------------- |
| **Multi-role Auth**      | Students, Staff, and Admin roles with JWT tokens                        |
| **Flexible Login**       | Students log in with email OR matric number                             |
| **Complaint Submission** | Multi-category, multi-file complaint form with drag-and-drop            |
| **Anonymous Mode**       | Students can submit complaints without revealing identity               |
| **AI Analysis**          | Groq-powered AI suggests complaint category, priority & recommendations |
| **File Compression**     | All uploaded images are auto-compressed with Sharp (max 800px)          |
| **Public Tracking**      | Anyone can track a complaint status with its reference ID               |
| **Admin Controls**       | Admins review, filter, paginate, and update complaint statuses          |
| **Rate Limiting**        | Max 3 complaints per hour per user (anti-spam)                          |
| **Security**             | XSS sanitization, CORS, bcrypt password hashing, JWT auth               |
| **Dual DB Support**      | MongoDB Atlas (active) + MySQL (backup, switchable)                     |

### Architecture

```
Browser (React + Vite)
       │
       │ HTTP requests to /api/v1
       ▼
Express.js Server (Node.js)
       │
       ├── Auth Middleware (JWT verification)
       ├── Validation Middleware (input checks)
       ├── Rate Limit Middleware
       │
       ├── Controllers (route logic)
       ├── Services (business logic)
       │       ├── Auth Service
       │       ├── Complaint Service
       │       ├── File Service (Sharp)
       │       └── AI Service (Groq)
       │
       └── MongoDB Atlas (Mongoose)
               ├── users collection
               ├── complaints collection (with embedded files)
               └── suspiciousactivities collection
```

### Reference ID Format

Every complaint gets a unique reference ID:
`CMP-[BASE36_TIMESTAMP]-[RANDOM]`
Example: `CMP-LZF8K4TQ-A3BX`

---

*Documentation generated: May 2026*
*Project: LASUSTECH Complaint Portal v1.0.0*
*Stack: React + Node.js + Express + MongoDB Atlas + Mongoose + Groq AI*
