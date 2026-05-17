# Sentinel Portal System Documentation
## Project: LASUSTECH Complaint Management System (v2.0)

### 1. Executive Summary
**Sentinel** is an enterprise-grade complaint management portal designed specifically for the **Lagos State University of Science and Technology (LASUSTECH)**. It serves as a bridge between the student body and university administration, ensuring that grievances are recorded, tracked, and resolved with transparency and efficiency.

### 2. The Problem We Are Solving
Before Sentinel, the university faced several operational hurdles:
- **Opaque Processes**: Students had no visibility into the status of their complaints.
- **Manual Overhead**: Administrative staff were overwhelmed by paper-based or unorganized digital feedback.
- **Data Gaps**: Lack of real-time analytics made it difficult to identify recurring issues within specific departments.
- **Security Risks**: Unauthorized access to sensitive student data and complaint records.

**Sentinel** solves this by providing a unified, secure, and data-driven platform for end-to-end complaint lifecycle management.

---

### 3. Architecture: The TanStack Revolution
One of the core design decisions for Sentinel was the transition to **TanStack Start** (Node.js/Nitro).

- **Server-Side Security**: By using TanStack Router's `beforeLoad` guards, we enforce authentication at the routing level. This prevents the "Auth Flicker" seen in traditional client-side React apps where unauthorized content flashes before a redirect occurs.
- **Nitro Engine**: Using the Nitro server (Node.js) instead of a traditional PHP backend allows for high-performance server-side rendering (SSR) and seamless API integration within a single codebase.
- **Unified Logic**: The entire application, from database interactions to UI state, is managed using a single language (TypeScript), reducing context switching and improving type safety.

---

### 4. Technical Stack
- **Framework**: TanStack Start (React + TanStack Router).
- **Backend**: Node.js with Nitro (Custom server entry).
- **Styling**: Vanilla CSS with a focus on "Sentinel-Premium" aesthetics (Dark mode, glassmorphism, vibrant accents).
- **State Management**: TanStack Query for resilient data fetching and caching.
- **Icons**: Lucide-React for a clean, modern UI.

---

### 5. System Features & Endpoints
The system is divided into two primary zones: **Student Dashboard** and **Admin Portal**.

#### Core Endpoints (Nitro API)
| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/api/auth/login` | POST | Secure session initialization with token storage. |
| `/api/complaints` | GET/POST | Fetching student history and submitting new grievances. |
| `/api/admin/stats` | GET | Aggregated data for the analytics dashboard (Status counts, category trends). |
| `/api/admin/users` | GET/PUT | User management and role assignment. |

#### Administrative Analytics
The Admin Portal includes a specialized **Analytics Dashboard** that uses MongoDB-style aggregations (via the `complaintService`) to provide:
- **Resolution Rates**: Real-time tracking of resolved vs. pending cases.
- **Departmental Load**: Identifying which departments (e.g., Bursary, Registry) have the highest complaint volume.

---

### 6. Design Philosophy
Sentinel is built to feel "Premium" and "State of the Art."
- **Visual Excellence**: We avoided generic browser colors in favor of a curated palette of HSL-based colors (`--primary`, `--accent`).
- **Smooth Interaction**: Micro-animations and layout transitions ensure the portal feels alive and responsive.
- **Accessibility**: High-contrast ratios and semantic HTML ensure the portal is usable for all students and staff.

---

### 7. Implementation Progress
We recently completed a major stabilization phase:
- **Refactored Layouts**: Converted `/admin` and `/dashboard` into protected layout routes.
- **Optimized Performance**: Removed redundant client-side `useEffect` hooks to improve initial load times and eliminate visual shifts.

---

### 8. Conclusion
Sentinel represents a major leap forward in university administration technology. By combining the speed of Node.js with the robust routing of TanStack, we have built a system that is not only secure and stable but also provides a world-class user experience for the LASUSTECH community.
