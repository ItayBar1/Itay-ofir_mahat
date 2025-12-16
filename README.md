# Classly - Studio Management Platform

Classly is a modern, comprehensive dashboard designed for managing dance studios, fitness centers, and educational programs. The platform streamlines administrative tasks ranging from student registration and class scheduling to payment tracking and attendance monitoring.

Built with performance and user experience in mind, utilizing the latest web technologies including **React 19** and **Supabase**.

![Classly Banner](https://via.placeholder.com/1200x400?text=Classly+Studio+Management)

## 🚀 Key Features

### 📊 Administrative Dashboard
A centralized hub for real-time analytics:
* **Key Metrics:** Instant view of total students, monthly revenue, active classes, and attendance rates.
* **Visual Analytics:** Interactive charts (powered by **Recharts**) for tracking revenue trends and weekly attendance.
* **Real-time Data:** Data is fetched dynamically from Supabase.

### 👥 Student Management
Robust system for managing student rosters:
* **Search & Filter:** Advanced filtering by student name, email, or specific enrolled classes.
* **Data Export:** Built-in functionality to **export student data to CSV** for external processing.
* **Status Tracking:** Visual indicators for enrollment status (Active, Pending, Suspended) with automated color coding.
* **Communication:** Quick access to student contact details (Phone/Email).

### 📅 Class Schedule
Dynamic weekly timetable view:
* **Interactive Calendar:** View classes by day of the week with intuitive navigation.
* **Capacity Management:** Visual progress bars indicating class occupancy vs. maximum capacity (turns red when full).
* **Instructor Integration:** Displays instructor names and avatars automatically.
* **Smart Filtering:** Filter view by specific days.

### 🔐 Authentication & Security
* **Secure Access:** Powered by **Supabase Auth** for robust login and signup flows.
* **Role-Based Access Control (RBAC):** Distinct flows and permissions for:
  * **Admins:** Full system management.
  * **Instructors:** Schedule and attendance view.
  * **Students:** Registration and personal schedule.

## 🛠️ Tech Stack

**Client:**
* **Framework:** React 19
* **Build Tool:** Vite
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **Icons:** Lucide React
* **Charts:** Recharts

**Backend & Infrastructure:**
* **Database:** Supabase PostgreSQL
* **Authentication:** Supabase Auth
* **API:** Supabase Client (@supabase/supabase-js)

## 📦 Installation & Setup

### Prerequisites
- **Node.js 20+** and **npm** installed locally.
- A Supabase project with URL and anonymous key available.

### 1) Clone the repository
```bash
git clone <repository-url>
cd Classly-Studio_Management
```

### 2) Install dependencies
Client and server are installed separately:
```bash
cd client
npm install

cd ../server
npm install
```

### 3) Environment configuration
Create environment files in each package:

**Client (`client/.env`):**
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Server (`server/.env`):**
```env
PORT=5000
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
STRIPE_SECRET_KEY=your_stripe_secret_key
```

### 4) Run the apps
- **Client:**
  ```bash
  cd client
  npm run dev
  ```
  The Vite dev server runs on `http://localhost:5173` by default.

- **Server:**
  ```bash
  cd server
  npm run dev
  ```
  The API server listens on the port set in `server/.env` (defaults to `5000`).

## 📂 Project Structure

```text
client/
├── components/           # UI Components
│   ├── AuthPage.tsx      # Login/Signup & Role selection
│   ├── Dashboard.tsx     # Analytics, Stats cards & Charts
│   ├── StudentManagement.tsx # Student list, CSV Export, Filters
│   ├── ClassSchedule.tsx # Weekly calendar & Capacity logic
│   └── Sidebar.tsx       # Navigation & Layout
├── services/
│   └── supabaseClient.ts # Supabase client configuration
├── types/
│   ├── types.ts          # General TypeScript interfaces
│   └── database.ts       # Database Schema types (Supabase generated)
├── App.tsx               # Main routing & Session management
└── main.tsx              # Entry point
server/
├── src/
│   ├── routes/           # Express route handlers
│   ├── logger.ts         # Pino logger configuration
│   └── index.ts          # Express app entry point
├── package.json          # Server scripts & dependencies
└── tsconfig.json         # Server TypeScript config
