// client/services/api.ts
import axios from "axios";
import { supabase } from "./supabaseClient";
import { 
  User, 
  Student, 
  ClassSession, 
  PaymentRecord, 
  DashboardStats, 
  InstructorStats 
} from "../types/types";

// הגדרת כתובת ה-API (משתנה סביבה או ברירת מחדל ללוקאל)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// יצירת מופע Axios
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor: הוספת טוקן Auth של Supabase לכל בקשה
apiClient.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// --- Services ---

export const UserService = {
  // שליפת המשתמש הנוכחי (פרופיל מורחב מה-DB)
  getMe: () => apiClient.get<User>('/users/me').then(res => res.data),
  
  // שליפת כל המדריכים (עבור Dropdown בשיבוץ שיעורים)
  getInstructors: () => apiClient.get<User[]>('/users/instructors').then(res => res.data),
};

export const StudentService = {
  // שליפת כל התלמידים (Admin) עם סינון ופייג'ינג
  getAll: (params?: { page?: number; limit?: number; search?: string; classId?: string }) => 
    apiClient.get<{ data: Student[]; count: number }>('/students', { params }).then(res => res.data),
  
  // שליפת תלמיד בודד
  getById: (id: string) => apiClient.get<Student>(`/students/${id}`).then(res => res.data),
  
  // יצירת תלמיד חדש (Admin)
  create: (data: Partial<Student>) => apiClient.post<Student>('/students', data).then(res => res.data),
  
  // עדכון פרטי תלמיד
  update: (id: string, data: Partial<Student>) => apiClient.put<Student>(`/students/${id}`, data).then(res => res.data),
  
  // מחיקת תלמיד (Soft Delete)
  delete: (id: string) => apiClient.delete(`/students/${id}`).then(res => res.data),

  // שליפת תלמידים המשויכים למדריך (Instructor View)
  getByInstructor: () => apiClient.get<Student[]>('/students/my-students').then(res => res.data),
};

export const CourseService = {
  // שליפת כל הקורסים (Admin/Catalog)
  getAll: (params?: { day?: number; instructorId?: string; status?: 'active' | 'inactive' }) => 
    apiClient.get<ClassSession[]>('/courses', { params }).then(res => res.data),
  
  // שליפת קורס בודד
  getById: (id: string) => apiClient.get<ClassSession>(`/courses/${id}`).then(res => res.data),
  
  // יצירת קורס חדש (Admin)
  create: (data: Partial<ClassSession>) => apiClient.post<ClassSession>('/courses', data).then(res => res.data),
  
  // עדכון קורס
  update: (id: string, data: Partial<ClassSession>) => apiClient.put<ClassSession>(`/courses/${id}`, data).then(res => res.data),
  
  // מחיקת קורס
  delete: (id: string) => apiClient.delete(`/courses/${id}`).then(res => res.data),

  // שליפת הקורסים של המדריך המחובר (Instructor View)
  getInstructorCourses: () => apiClient.get<ClassSession[]>('/courses/my-courses').then(res => res.data),

  // שליפת הקורסים שהתלמיד רשום אליהם (Student View)
  getEnrolledCourses: () => apiClient.get<ClassSession[]>('/courses/enrolled').then(res => res.data),

  // הרשמה לקורס (Student Action)
  enroll: (courseId: string) => apiClient.post('/courses/enroll', { courseId }).then(res => res.data),
};

export const PaymentService = {
  // שליפת היסטוריית תשלומים (Admin)
  getAll: () => apiClient.get<PaymentRecord[]>('/payments').then(res => res.data),
  
  // יצירת כוונת תשלום (Stripe Payment Intent)
  createIntent: (data: { amount: number; currency?: string; description?: string }) => 
    apiClient.post<{ clientSecret: string }>('/payments/create-intent', data).then(res => res.data),
};

export const DashboardService = {
  // סטטיסטיקות לאדמין
  getAdminStats: () => apiClient.get<DashboardStats>('/dashboard/admin').then(res => res.data),
  
  // סטטיסטיקות למדריך
  getInstructorStats: () => apiClient.get<InstructorStats>('/dashboard/instructor').then(res => res.data),
};