// client/types/types.ts

export type UserRole = 'ADMIN' | 'INSTRUCTOR' | 'STUDENT' | 'PARENT';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  status: UserStatus;
  studio_id: string | null;
  phone_number?: string;
  profile_image_url?: string;
  created_at?: string;
}

export type EnrollmentStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';

export interface Student extends User {
  enrolledClass?: string;
  joinDate: string;
}

export interface ClassSession {
  id: string;
  name: string;
  instructor_id: string;
  instructor_name?: string;
  instructor_avatar?: string;
  start_time: string;
  end_time: string;
  day_of_week: number;
  current_enrollment: number;
  max_capacity: number;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ALL_LEVELS';
  location_room: string;
  price_ils: number;
  is_active: boolean;
}

export interface PaymentRecord {
  id: string;
  amount_ils: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  payment_method: string;
  created_at: string;
  invoice_number: string | null;
  description?: string;
}

export interface DashboardStats {
  totalStudents: number;
  monthlyRevenue: number;
  activeClasses: number;
  avgAttendance: number;
  chartData: Array<{
    name: string;
    revenue: number;
    attendance: number;
  }>;
}