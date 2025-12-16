# Classly - Product Requirements Document (PRD)
## Stripe + Express.js + Supabase Stack Edition

**Project Name:** Classly  
**Project Date:** December 7, 2025  
**Version:** 3.0 (Stripe + Express.js Edition)  
**Status:** Final  

---

## Executive Summary

Classly is a comprehensive digital platform for managing classes and studios, designed to streamline administrative processes including student registration, online payments, class scheduling, attendance tracking, and financial reporting. The system serves three primary user roles: Studio Administrators, Instructors, and Students/Parents. Built on Supabase PostgreSQL for robust data management, Express.js backend for business logic, and Stripe for global payment processing.

---

## 1. Product Overview

### 1.1 Vision
Create a unified, intuitive digital ecosystem that simplifies class and studio management while strengthening the arts and sports community in Israel through automation, transparency, and real-time coordination.

### 1.2 Mission
Eliminate manual processes, reduce administrative burden, and provide an integrated platform where administrators efficiently manage operations, instructors focus on teaching, and students enjoy a seamless registration and learning experience.

### 1.3 Problem Statement
- **Manual Processes:** Registration and payments conducted through private messages and manual systems
- **Fragmented Scheduling:** No centralized, changeable schedule system
- **Lack of Transparency:** Payment tracking opaque for both studio and instructors
- **No Digital Attendance:** Missing digital attendance management tools
- **Inefficiency:** Administrators spend excessive time on administrative tasks instead of program development

**Result:** Administrative chaos, human errors, low efficiency, and poor user experience.

---

## 2. Objectives & Goals

### 2.1 Primary Objectives
1. **Process Automation** - Automate registration, payments, scheduling, and attendance
2. **Centralization** - Unite all operations on a single platform
3. **Transparency** - Provide real-time visibility into payments and registrations for all stakeholders
4. **User Experience** - Deliver intuitive, role-specific interfaces
5. **Scalability** - Support high concurrent users during peak registration/payment periods

### 2.2 Key Performance Indicators (KPIs)
- System uptime: 99.9%
- Average page load time: < 2 seconds
- Support for 1000+ concurrent users during peak periods
- Registration completion rate: > 95%
- Payment success rate: > 98%
- User adoption rate: > 80% within first 3 months

---

## 3. Technology Stack

### 3.1 Frontend
- **Framework:** React 18+ with Next.js 14+ (TypeScript)
- **Rendering:** Server-Side Rendering (SSR) with Next.js for SEO & performance
- **Styling:** Tailwind CSS
- **UI Component Library:** Material-UI (@mui/material)
- **State Management:** Redux Toolkit (@reduxjs/toolkit)
- **Data Fetching:** TanStack React Query (@tanstack/react-query) + Supabase Client
- **Form Handling:** Formik + Yup validation
- **Animations:** Framer Motion
- **Notifications:** React Toastify
- **File Upload:** React Dropzone
- **HTTP Client:** Axios / Fetch API
- **Payment UI:** @stripe/react-stripe-js + @stripe/stripe-js

### 3.2 Backend
- **Runtime:** Node.js 18+ with TypeScript
- **Backend Framework:** Express.js 4.18+ (REST API server)
- **Database:** Supabase PostgreSQL (managed, free tier available)
- **Authentication:** Supabase Auth (JWT tokens + Session management)
- **Real-time Sync:** Supabase Realtime (WebSocket-based)
- **Payment Processing:** Stripe Payment Intents API (Global + ILS support)
- **Storage:** Supabase Storage (file uploads, documents)
- **Deployment Frontend:** Vercel (Next.js native support)
- **Deployment Backend:** Railway / Render (Express.js server)

### 3.3 Database
- **Primary DB:** Supabase PostgreSQL (Managed, cloud-hosted)
- **Type:** Relational SQL with full ACID compliance
- **Features:**
  - Real-time subscriptions via WebSocket
  - Row-Level Security (RLS) policies
  - Full-text search support
  - Built-in authentication integration
  - Automatic backups and point-in-time recovery
  - PostGIS for geospatial queries (future)

### 3.4 Infrastructure & DevOps
- **Frontend Hosting:** Vercel (Next.js serverless)
- **Backend Hosting:** Railway / Render (Express.js dedicated server)
- **Database:** Supabase Cloud (PostgreSQL managed)
- **CDN:** Vercel Edge Network (frontend)
- **Monitoring:** Vercel Analytics + Sentry + Railway Logs
- **CI/CD:** GitHub Actions → Vercel (frontend) & Railway/Render (backend)
- **Database Migrations:** Supabase CLI + Knex.js
- **Environment Management:** .env.local, .env.production
- **Version Control:** Git + GitHub

### 3.5 External Integrations
| Service | Purpose | Integration Type |
|---------|---------|------------------|
| **Supabase Auth** | User authentication, JWT tokens, RBAC | OAuth, Email/Password, Session management |
| **Supabase PostgreSQL** | Relational data storage, real-time | SQL, REST API, WebSocket |
| **Supabase Storage** | File uploads, documents, certificates | REST API, Signed URLs |
| **Stripe** | Payment processing (ILS + global currencies) | Payment Intents API, Webhooks, REST |
| **SendGrid/Resend** | Email notifications, receipts, invoices | REST API, Email service |

---

## 4. System Architecture

### 4.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                  Client Layer (Browser/Mobile)                   │
│              React + Next.js 14+ (TypeScript)                    │
│    (Components, Pages, Services, Redux State Management)        │
└───────────────────────┬──────────────────────────────────────────┘
                        │ HTTPS / REST API
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌────────────────┐ ┌──────────────┐
│ Supabase     │ │ Express.js     │ │ Stripe API   │
│ Auth         │ │ Backend Server │ │ (Payments)   │
└──────────────┘ │ (Port 5000)    │ └──────────────┘
        │        │ • Controllers  │
        │        │ • Middleware   │
        │        │ • Services     │
        │        │ • Webhooks     │
        │        └────────┬───────┘
        │                 │
        └─────────┬───────┘
                  │ WebSocket + SQL Queries
        ┌─────────▼────────────────────┐
        │ Supabase PostgreSQL Database │
        │ • Tables (RLS enabled)       │
        │ • Real-time Subscriptions    │
        │ • Storage (files/docs)       │
        └──────────────────────────────┘
```

### 4.2 Architectural Principles
1. **Serverless Frontend:** Vercel + Next.js for fast deployments
2. **Dedicated Backend:** Express.js for complex business logic and webhooks
3. **Real-time Data Sync:** Supabase Realtime subscriptions for live updates
4. **Row-Level Security:** PostgreSQL RLS policies for data isolation
5. **API-First Design:** REST API via Express + custom endpoints
6. **Webhook-Driven:** Stripe webhooks for payment confirmations
7. **Security-By-Default:** HTTPS, JWT auth, RLS, webhook verification

### 4.3 Deployment Pipeline
```
Code Push → GitHub → GitHub Actions
                    ├─ Frontend → Vercel Build → Edge CDN
                    └─ Backend → Railway/Render → Express Server
                                ↓
                    Database Migrations → Supabase PostgreSQL
```

### 4.4 Express.js Backend Flow
```
Request (Frontend) → Express Router → Middleware (Auth, RLS check)
    ↓
    ├─ Payment Controller → Stripe API → Stripe Payment Intent
    ├─ User Controller → Supabase → RLS Policies
    ├─ Class Controller → Supabase PostgreSQL Queries
    └─ Webhook Handler → Verify Signature → Update Database
    ↓
Response + Real-time WebSocket Updates via Supabase Realtime
```

---

## 5. Database Schema (PostgreSQL/SQL)

### 5.1 SQL Table Definitions

#### 5.1.1 Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  phone_number VARCHAR(20),
  profile_image_url TEXT,
  role VARCHAR(20) CHECK (role IN ('ADMIN', 'INSTRUCTOR', 'STUDENT', 'PARENT')),
  studio_id UUID REFERENCES studios(id) ON DELETE CASCADE,
  status VARCHAR(20) CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')) DEFAULT 'ACTIVE',
  last_login_at TIMESTAMP,
  login_count INTEGER DEFAULT 0,
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT valid_email CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_studio_id ON users(studio_id);
CREATE INDEX idx_users_role ON users(role);
```

#### 5.1.2 Studios Table
```sql
CREATE TABLE studios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  admin_id UUID NOT NULL REFERENCES users(id),
  address VARCHAR(255),
  city VARCHAR(100),
  coordinates POINT,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  website_url TEXT,
  bank_account_holder VARCHAR(255),
  bank_account_number VARCHAR(50),
  bank_code VARCHAR(10),
  cancellation_deadline_hours INTEGER DEFAULT 24,
  refund_percentage DECIMAL(5, 2) DEFAULT 0,
  stripe_connect_id VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_studios_admin_id ON studios(admin_id);
CREATE INDEX idx_studios_city ON studios(city);
```

#### 5.1.3 Categories Table
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7),
  icon VARCHAR(50),
  type VARCHAR(20) CHECK (type IN ('ARTS', 'SPORTS', 'WELLNESS', 'ACADEMIC')),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_categories_studio_id ON categories(studio_id);
CREATE INDEX idx_categories_type ON categories(type);
```

#### 5.1.4 Classes Table
```sql
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  instructor_id UUID NOT NULL REFERENCES users(id),
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  timezone VARCHAR(50) DEFAULT 'Asia/Jerusalem',
  location_room VARCHAR(100),
  location_building VARCHAR(100),
  max_capacity INTEGER NOT NULL CHECK (max_capacity > 0),
  current_enrollment INTEGER DEFAULT 0,
  age_range_min INTEGER,
  age_range_max INTEGER,
  level VARCHAR(20) CHECK (level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL_LEVELS')),
  price_ils DECIMAL(10, 2) NOT NULL CHECK (price_ils >= 0),
  billing_cycle VARCHAR(20) CHECK (billing_cycle IN ('MONTHLY', 'SEMESTER', 'YEARLY')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_classes_studio_id ON classes(studio_id);
CREATE INDEX idx_classes_category_id ON classes(category_id);
CREATE INDEX idx_classes_instructor_id ON classes(instructor_id);
CREATE INDEX idx_classes_day_time ON classes(day_of_week, start_time);
```

#### 5.1.5 Enrollments Table
```sql
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES users(id) ON DELETE SET NULL,
  enrollment_date TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) CHECK (status IN ('ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED')) DEFAULT 'ACTIVE',
  payment_status VARCHAR(20) CHECK (payment_status IN ('PENDING', 'PAID', 'PARTIAL', 'OVERDUE')) DEFAULT 'PENDING',
  total_amount_due DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_amount_paid DECIMAL(10, 2) NOT NULL DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE,
  cancellation_reason TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_enrollments_student_id ON enrollments(student_id);
CREATE INDEX idx_enrollments_class_id ON enrollments(class_id);
CREATE INDEX idx_enrollments_status ON enrollments(status);
CREATE INDEX idx_enrollments_payment_status ON enrollments(payment_status);
CREATE UNIQUE INDEX idx_enrollments_unique ON enrollments(student_id, class_id, start_date);
```

#### 5.1.6 Attendance Table
```sql
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  instructor_id UUID NOT NULL REFERENCES users(id),
  enrollment_id UUID REFERENCES enrollments(id) ON DELETE SET NULL,
  student_id UUID NOT NULL REFERENCES users(id),
  session_date DATE NOT NULL,
  status VARCHAR(20) CHECK (status IN ('PRESENT', 'ABSENT', 'EXCUSED', 'LATE')) DEFAULT 'ABSENT',
  notes TEXT,
  recorded_at TIMESTAMP DEFAULT NOW(),
  recorded_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_attendance_student_id ON attendance(student_id);
CREATE INDEX idx_attendance_class_id ON attendance(class_id);
CREATE INDEX idx_attendance_session_date ON attendance(session_date);
CREATE UNIQUE INDEX idx_attendance_unique ON attendance(enrollment_id, session_date);
```

#### 5.1.7 Payments Table (STRIPE INTEGRATION)
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  enrollment_id UUID REFERENCES enrollments(id) ON DELETE SET NULL,
  student_id UUID NOT NULL REFERENCES users(id),
  instructor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  amount_ils DECIMAL(10, 2) NOT NULL CHECK (amount_ils > 0),
  amount_cents INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'ILS',
  payment_method VARCHAR(50) CHECK (payment_method IN ('STRIPE', 'BANK_TRANSFER', 'CHECK', 'CASH')),
  stripe_payment_intent_id VARCHAR(100),
  stripe_charge_id VARCHAR(100),
  status VARCHAR(20) CHECK (status IN ('PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED')) DEFAULT 'PENDING',
  invoice_number VARCHAR(50),
  invoice_url TEXT,
  due_date DATE NOT NULL,
  paid_date TIMESTAMP,
  refund_date TIMESTAMP,
  refund_amount DECIMAL(10, 2),
  refund_reason TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payments_student_id ON payments(student_id);
CREATE INDEX idx_payments_enrollment_id ON payments(enrollment_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_stripe_id ON payments(stripe_payment_intent_id);
CREATE INDEX idx_payments_paid_date ON payments(paid_date);
```

#### 5.1.8 InstructorCommissions Table
```sql
CREATE TABLE instructor_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  instructor_id UUID NOT NULL REFERENCES users(id),
  class_id UUID NOT NULL REFERENCES classes(id),
  commission_percentage DECIMAL(5, 2),
  commission_fixed DECIMAL(10, 2),
  billing_cycle VARCHAR(20) CHECK (billing_cycle IN ('PER_SESSION', 'MONTHLY', 'QUARTERLY')),
  payment_status VARCHAR(20) CHECK (payment_status IN ('PENDING', 'PAID', 'OVERDUE')) DEFAULT 'PENDING',
  total_earned DECIMAL(10, 2) DEFAULT 0,
  total_paid DECIMAL(10, 2) DEFAULT 0,
  last_payment_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_instructor_commissions_instructor_id ON instructor_commissions(instructor_id);
CREATE INDEX idx_instructor_commissions_class_id ON instructor_commissions(class_id);
```

#### 5.1.9 Schedule (TimeSlots) Table
```sql
CREATE TABLE schedule_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location_room VARCHAR(100),
  capacity INTEGER,
  enrollment_count INTEGER DEFAULT 0,
  status VARCHAR(20) CHECK (status IN ('SCHEDULED', 'CANCELLED', 'COMPLETED', 'RESCHEDULED')) DEFAULT 'SCHEDULED',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_schedule_class_id ON schedule_sessions(class_id);
CREATE INDEX idx_schedule_session_date ON schedule_sessions(session_date);
CREATE UNIQUE INDEX idx_schedule_unique ON schedule_sessions(class_id, session_date);
```

#### 5.1.10 Notifications Table
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  type VARCHAR(50) CHECK (type IN ('SCHEDULE_CHANGE', 'PAYMENT_DUE', 'ENROLLMENT_CONFIRMED', 'PAYMENT_RECEIVED', 'SYSTEM')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  related_entity_id UUID,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
```

#### 5.1.11 Audit Logs Table
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(100),
  record_id UUID,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_studio_id ON audit_logs(studio_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

### 5.2 Row-Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE studios ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid() = id);

-- Admins can view all users in their studio
CREATE POLICY "Admins can view studio users"
ON users FOR SELECT
USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'ADMIN'
  AND studio_id = (SELECT studio_id FROM users WHERE id = auth.uid())
);

-- Students can only view classes in their studio
CREATE POLICY "Students can view active classes"
ON classes FOR SELECT
USING (
  is_active = true
  AND studio_id = (SELECT studio_id FROM users WHERE id = auth.uid())
);

-- Instructors can view their own classes
CREATE POLICY "Instructors can view own classes"
ON classes FOR SELECT
USING (
  instructor_id = auth.uid()
  OR (SELECT role FROM users WHERE id = auth.uid()) = 'ADMIN'
);

-- Students can view their own enrollments
CREATE POLICY "Students can view own enrollments"
ON enrollments FOR SELECT
USING (
  student_id = auth.uid()
  OR (SELECT role FROM users WHERE id = auth.uid()) = 'ADMIN'
  OR instructor_id = (SELECT id FROM users WHERE id = auth.uid())
);

-- Instructors can view attendance for their classes
CREATE POLICY "Instructors can view class attendance"
ON attendance FOR SELECT
USING (
  class_id IN (SELECT id FROM classes WHERE instructor_id = auth.uid())
  OR (SELECT role FROM users WHERE id = auth.uid()) = 'ADMIN'
);

-- Users can view their own payments
CREATE POLICY "Users can view own payments"
ON payments FOR SELECT
USING (
  student_id = auth.uid()
  OR (SELECT role FROM users WHERE id = auth.uid()) = 'ADMIN'
);
```

### 5.3 Indexes & Query Optimization

```sql
-- Compound indexes for common queries
CREATE INDEX idx_classes_studio_category ON classes(studio_id, category_id, is_active);
CREATE INDEX idx_enrollments_student_status ON enrollments(student_id, status);
CREATE INDEX idx_enrollments_class_status ON enrollments(class_id, status);
CREATE INDEX idx_payments_student_status ON payments(student_id, status);
CREATE INDEX idx_attendance_student_date ON attendance(student_id, session_date DESC);

-- Full-text search index
CREATE INDEX idx_classes_fts ON classes USING GIN (to_tsvector('english', name || ' ' || description));

-- Geospatial index (if using PostGIS)
CREATE INDEX idx_studios_location ON studios USING GIST (coordinates);
```

---

## 6. Folder Architecture & Project Structure

### 6.1 Root Directory Structure (Monorepo)
```
classly/
├── .github/
│   └── workflows/
│       ├── deploy-frontend.yml
│       ├── deploy-backend.yml
│       ├── test.yml
│       └── db-migrations.yml
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── globals.css
│   │   │   ├── auth/
│   │   │   │   ├── signin/page.tsx
│   │   │   │   ├── signup/page.tsx
│   │   │   │   └── callback/page.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   ├── (admin)/
│   │   │   │   │   ├── classes/
│   │   │   │   │   ├── instructors/
│   │   │   │   │   ├── students/
│   │   │   │   │   ├── payments/
│   │   │   │   │   ├── reports/
│   │   │   │   │   └── settings/
│   │   │   │   ├── (instructor)/
│   │   │   │   │   ├── schedule/
│   │   │   │   │   ├── attendance/
│   │   │   │   │   ├── earnings/
│   │   │   │   │   └── students/
│   │   │   │   └── (student)/
│   │   │   │       ├── my-classes/
│   │   │   │       ├── enroll/
│   │   │   │       ├── schedule/
│   │   │   │       └── payments/
│   │   │   └── payment/
│   │   │       ├── checkout/page.tsx
│   │   │       └── success/page.tsx
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── auth/
│   │   │   ├── admin/
│   │   │   ├── instructor/
│   │   │   ├── student/
│   │   │   ├── payment/
│   │   │   │   ├── StripeCheckoutForm.tsx
│   │   │   │   ├── PaymentElement.tsx
│   │   │   │   └── PaymentStatus.tsx
│   │   │   └── forms/
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useClasses.ts
│   │   │   ├── usePayments.ts
│   │   │   └── useStripe.ts
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   ├── supabase/
│   │   │   ├── auth/
│   │   │   ├── payment/
│   │   │   │   └── stripeClient.ts
│   │   │   └── notifications/
│   │   ├── store/
│   │   ├── types/
│   │   └── utils/
│   ├── public/
│   ├── .env.local
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── README.md
├── backend/
│   ├── src/
│   │   ├── index.ts
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   ├── stripe.ts
│   │   │   └── environment.ts
│   │   ├── controllers/
│   │   │   ├── PaymentController.ts
│   │   │   ├── UserController.ts
│   │   │   ├── ClassController.ts
│   │   │   ├── EnrollmentController.ts
│   │   │   └── AttendanceController.ts
│   │   ├── routes/
│   │   │   ├── paymentRoutes.ts
│   │   │   ├── userRoutes.ts
│   │   │   ├── classRoutes.ts
│   │   │   ├── enrollmentRoutes.ts
│   │   │   ├── webhookRoutes.ts
│   │   │   └── index.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   ├── errorHandler.ts
│   │   │   ├── rateLimit.ts
│   │   │   ├── cors.ts
│   │   │   └── requestLogging.ts
│   │   ├── services/
│   │   │   ├── StripeService.ts
│   │   │   ├── SupabaseService.ts
│   │   │   ├── EmailService.ts
│   │   │   ├── AuthService.ts
│   │   │   └── PaymentService.ts
│   │   ├── utils/
│   │   │   ├── logger.ts
│   │   │   ├── validators.ts
│   │   │   ├── errorHandling.ts
│   │   │   └── helpers.ts
│   │   ├── types/
│   │   │   ├── index.ts
│   │   │   ├── payment.ts
│   │   │   ├── stripe.ts
│   │   │   └── database.ts
│   │   └── webhooks/
│   │       └── StripeWebhooks.ts
│   ├── .env.local
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   ├── .gitignore
│   └── README.md
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_rls_policies.sql
│   │   ├── 003_stripe_tables.sql
│   │   └── 004_indexes.sql
│   ├── seed.sql
│   └── config.toml
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── PAYMENT_FLOW.md
│   ├── DEPLOYMENT.md
│   └── EXPRESS_API.md
├── .gitignore
├── package.json
└── README.md
```

### 6.2 Express.js Backend Structure (Detailed)

```
backend/
├── src/
│   ├── index.ts                    # Main application entry
│   ├── config/
│   │   ├── database.ts            # Supabase client setup
│   │   ├── stripe.ts              # Stripe initialization
│   │   ├── environment.ts         # ENV validation
│   │   └── cors.ts                # CORS configuration
│   ├── controllers/
│   │   ├── PaymentController.ts
│   │   │   ├── createPaymentIntent()
│   │   │   ├── confirmPayment()
│   │   │   ├── getPaymentHistory()
│   │   │   └── refundPayment()
│   │   ├── UserController.ts
│   │   ├── ClassController.ts
│   │   └── EnrollmentController.ts
│   ├── routes/
│   │   ├── paymentRoutes.ts
│   │   │   ├── POST /api/payment/create-intent
│   │   │   ├── POST /api/payment/confirm
│   │   │   ├── GET /api/payment/history
│   │   │   └── POST /api/payment/refund
│   │   ├── webhookRoutes.ts
│   │   │   └── POST /api/webhook/stripe
│   │   └── index.ts               # Route aggregator
│   ├── middleware/
│   │   ├── auth.ts                # JWT verification
│   │   ├── errorHandler.ts        # Global error handling
│   │   ├── rateLimit.ts           # Rate limiting
│   │   └── requestLogging.ts
│   ├── services/
│   │   ├── StripeService.ts
│   │   │   ├── createPaymentIntent()
│   │   │   ├── retrievePaymentIntent()
│   │   │   ├── confirmPayment()
│   │   │   ├── refundPayment()
│   │   │   └── verifyWebhookSignature()
│   │   ├── SupabaseService.ts
│   │   │   ├── getUser()
│   │   │   ├── getEnrollment()
│   │   │   ├── updatePaymentStatus()
│   │   │   └── createAuditLog()
│   │   ├── PaymentService.ts
│   │   │   ├── initiatePayment()
│   │   │   ├── handlePaymentSuccess()
│   │   │   ├── handlePaymentFailure()
│   │   │   └── generateInvoice()
│   │   └── EmailService.ts
│   │       ├── sendPaymentConfirmation()
│   │       └── sendInvoice()
│   ├── webhooks/
│   │   └── StripeWebhooks.ts
│   │       ├── handlePaymentIntentSucceeded()
│   │       ├── handlePaymentIntentPaymentFailed()
│   │       └── handleChargeRefunded()
│   ├── types/
│   │   ├── payment.ts
│   │   ├── stripe.ts
│   │   └── express.d.ts
│   └── utils/
│       ├── logger.ts
│       └── errorHandling.ts
├── package.json
└── tsconfig.json
```

---

## 7. Payment Flow with Stripe

### 7.1 Complete Payment Process (Client & Server)

#### Step 1: Frontend Request Payment Intent
```typescript
// Frontend: src/components/payment/StripeCheckoutForm.tsx

async function handlePaymentSubmit(amount: number, enrollmentId: string) {
  // Call backend Express endpoint
  const response = await fetch('https://api.classly.com/api/payment/create-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ amount, enrollmentId, currency: 'ils' })
  });

  const { clientSecret } = await response.json();
  
  // Use Stripe Elements to confirm payment
  const { error, paymentIntent } = await stripe.confirmPayment({
    elements,
    confirmParams: { return_url: 'https://classly.com/payment/success' },
    redirect: 'if_required'
  });

  if (paymentIntent?.status === 'succeeded') {
    // Payment successful, wait for webhook confirmation
  }
}
```

#### Step 2: Backend Create Payment Intent
```typescript
// Backend: src/controllers/PaymentController.ts

export async function createPaymentIntent(req: Request, res: Response) {
  const { amount, enrollmentId, currency = 'ils' } = req.body;
  const userId = req.user.id; // From JWT middleware

  try {
    // Verify enrollment exists and belongs to student
    const enrollment = await supabaseService.getEnrollment(enrollmentId);
    if (enrollment.student_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Convert ILS to cents for Stripe
    const amountCents = Math.round(amount * 100);

    // Create Stripe Payment Intent
    const paymentIntent = await stripeService.createPaymentIntent({
      amount: amountCents,
      currency,
      metadata: {
        enrollmentId,
        studentId: userId,
        studioId: enrollment.studio_id
      }
    });

    // Create payment record in Supabase (PENDING status)
    await supabaseService.createPayment({
      enrollment_id: enrollmentId,
      student_id: userId,
      amount_ils: amount,
      stripe_payment_intent_id: paymentIntent.id,
      status: 'PENDING'
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
}
```

#### Step 3: Stripe Webhook Confirmation
```typescript
// Backend: src/webhooks/StripeWebhooks.ts

export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers['stripe-signature'] as string;
  
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const { enrollmentId, studentId } = paymentIntent.metadata;

    try {
      // Update payment status to SUCCEEDED
      await supabaseService.updatePayment(paymentIntent.id, {
        status: 'SUCCEEDED',
        stripe_charge_id: paymentIntent.charges.data[0]?.id,
        paid_date: new Date()
      });

      // Update enrollment status to PAID
      await supabaseService.updateEnrollment(enrollmentId, {
        payment_status: 'PAID',
        total_amount_paid: paymentIntent.amount / 100
      });

      // Send confirmation email
      await emailService.sendPaymentConfirmation(studentId);

      // Create audit log
      await supabaseService.createAuditLog({
        action: 'PAYMENT_CONFIRMED',
        table_name: 'payments',
        record_id: paymentIntent.id,
        changes: { status: 'SUCCEEDED' }
      });
    } catch (error) {
      console.error('Error updating payment:', error);
      return res.status(500).json({ error: 'Failed to update payment' });
    }
  }

  res.json({ received: true });
}
```

### 7.2 Payment Status Flow

```
[PENDING] → Stripe processing → [SUCCEEDED] ↔ Webhook confirmation
              ↓
        [FAILED] → User retry or admin manual entry
```

---

## 8. Express.js Configuration Examples

### 8.1 Main Server Setup (index.ts)
```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { initializeStripe } from './config/stripe';
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';
import { rateLimitMiddleware } from './middleware/rateLimit';
import paymentRoutes from './routes/paymentRoutes';
import webhookRoutes from './routes/webhookRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// Important: Raw body for webhook signature verification
app.use('/api/webhook/stripe', express.raw({type: 'application/json'}));

// JSON parser for regular routes
app.use(express.json());

// Initialize services
initializeStripe();

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/payment', authMiddleware, rateLimitMiddleware, paymentRoutes);
app.use('/api/webhook', webhookRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`);
});
```

### 8.2 Stripe Service Implementation
```typescript
// backend/src/services/StripeService.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export class StripeService {
  async createPaymentIntent(params: {
    amount: number;
    currency: string;
    metadata: object;
  }) {
    return await stripe.paymentIntents.create({
      amount: params.amount,
      currency: params.currency,
      automatic_payment_methods: {
        enabled: true
      },
      metadata: params.metadata
    });
  }

  async retrievePaymentIntent(paymentIntentId: string) {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  }

  async refundPayment(chargeId: string, amount?: number) {
    return await stripe.refunds.create({
      charge: chargeId,
      amount
    });
  }

  verifyWebhookSignature(body: Buffer, signature: string): Stripe.Event {
    return stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  }
}
```

### 8.3 Payment Routes
```typescript
// backend/src/routes/paymentRoutes.ts
import { Router } from 'express';
import { PaymentController } from '../controllers/PaymentController';

const router = Router();

router.post('/create-intent', PaymentController.createPaymentIntent);
router.post('/confirm', PaymentController.confirmPayment);
router.get('/history', PaymentController.getPaymentHistory);
router.post('/refund', PaymentController.refundPayment);

export default router;
```

---

## 9. Frontend Stripe Integration

### 9.1 Stripe Checkout Component
```typescript
// frontend/src/components/payment/StripeCheckoutForm.tsx
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useState } from 'react';

export function StripeCheckoutForm({ clientSecret }: { clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment/success`
      }
    });

    if (error) {
      console.error(error);
      setIsProcessing(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button disabled={isProcessing || !stripe || !elements}>
        {isProcessing ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
}
```

### 9.2 Payment Checkout Page
```typescript
// frontend/src/app/payment/checkout/page.tsx
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripeCheckoutForm from '@/components/payment/StripeCheckoutForm';
import { useEffect, useState } from 'react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    // Get enrollment ID from URL params
    const enrollmentId = new URLSearchParams(window.location.search).get('enrollment');
    const amount = new URLSearchParams(window.location.search).get('amount');

    // Call backend to create payment intent
    fetch('https://api.classly.com/api/payment/create-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({ enrollmentId, amount })
    })
      .then(r => r.json())
      .then(data => setClientSecret(data.clientSecret));
  }, []);

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <StripeCheckoutForm clientSecret={clientSecret} />
    </Elements>
  );
}
```

---

## 10. Environment Variables

### 10.1 Frontend (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
NEXT_PUBLIC_API_URL=https://api.classly.com
NEXT_PUBLIC_APP_URL=https://app.classly.com
```

### 10.2 Backend (.env)
```env
# Server
PORT=5000
NODE_ENV=production

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Email
SENDGRID_API_KEY=xxxxx

# Security
JWT_SECRET=xxxxx
CORS_ORIGIN=https://app.classly.com
```

---

## 11. Deployment

### 11.1 Frontend Deployment (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod

# Environment variables set in Vercel dashboard
```

### 11.2 Backend Deployment (Railway)
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up

# View logs
railway logs
```

### 11.3 Database Migrations
```bash
# Push migrations to Supabase
supabase db push

# Verify migrations applied
supabase migration list
```

---

## 12. Security Checklist

- [ ] Stripe API keys stored in environment variables (never in code)
- [ ] Webhook signature verification enabled
- [ ] CORS configured to allow only frontend domain
- [ ] Rate limiting enabled on payment endpoints
- [ ] JWT token validation on all protected routes
- [ ] RLS policies enabled on Supabase tables
- [ ] HTTPS enforced on all endpoints
- [ ] Input validation on all API routes
- [ ] Audit logs created for all payment transactions
- [ ] PCI compliance through Stripe (no card data stored)
- [ ] Error messages don't expose sensitive data

---

## 13. Testing Strategy

### 13.1 Stripe Test Cards
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0025 0000 3155
```

### 13.2 Backend Testing
```bash
# Unit tests
npm run test

# Integration tests with mock Stripe
npm run test:integration

# Webhook signature verification
npm run test:webhooks
```

---

## 14. Success Metrics

- ✅ Payment success rate > 98%
- ✅ Average payment processing time < 2 seconds
- ✅ Webhook delivery rate > 99.9%
- ✅ Zero payment data breaches
- ✅ User adoption rate > 80%

---

## Glossary

| Term | Definition |
|------|-----------|
| **Payment Intent** | Stripe object representing a payment transaction |
| **Client Secret** | Secure token sent to frontend for payment confirmation |
| **Webhook** | HTTP callback triggered by Stripe on payment events |
| **RLS** | Row-Level Security - database-level access control |
| **JWT** | JSON Web Token - stateless authentication |
| **ILS** | Israeli Shekel - currency code |

---

**Document Status:** ✅ FINAL  
**Last Updated:** December 16, 2025  
**Version:** 3.0 (Stripe + Express.js + Supabase)
