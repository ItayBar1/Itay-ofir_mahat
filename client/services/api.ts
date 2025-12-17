// client/services/api.ts
import axios from "axios";
import { supabase } from "./supabaseClient";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

export const StudentService = {
  getAll: (params?: any) => apiClient.get("/students", { params }).then(res => res.data),
  getById: (id: string) => apiClient.get(`/students/${id}`).then(res => res.data),
  create: (data: any) => apiClient.post("/students", data).then(res => res.data),
};

export const CourseService = {
  getAll: (params?: any) => apiClient.get("/courses", { params }).then(res => res.data),
  getById: (id: string) => apiClient.get(`/courses/${id}`).then(res => res.data),
  create: (data: any) => apiClient.post("/courses", data).then(res => res.data),
  getInstructors: () => apiClient.get("/courses/instructors").then(res => res.data),
};

export const PaymentService = {
  getAll: () => apiClient.get("/payments").then(res => res.data),
  createIntent: (data: { amount: number; currency?: string; description?: string }) => 
    apiClient.post("/payments/create-intent", data).then(res => res.data),
};

export const DashboardService = {
  getAdminStats: () => apiClient.get("/dashboard/admin").then(res => res.data),
  getInstructorStats: () => apiClient.get("/dashboard/instructor").then(res => res.data),
};