import { supabaseAdmin } from '../config/supabase';

export const StudentService = {
  async getAll(studioId: string, page: number = 1, limit: number = 50, search: string = '') {
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('users')
      .select('*', { count: 'exact' })
      .eq('role', 'STUDENT')
      .eq('studio_id', studioId)
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.ilike('full_name', `%${search}%`);
    }

    const { data, count, error } = await query;
    if (error) throw error;

    return { data, count };
  },

  async getById(id: string) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async getByInstructor(instructorId: string) {
    // שליפת כל ה-Enrollments של קורסים שהמדריך מלמד
    const { data, error } = await supabaseAdmin
      .from('enrollments')
      .select(`
        student:users!enrollments_student_id_fkey (
          id, full_name, email, phone_number, profile_image_url
        ),
        class:classes!inner (
          name
        )
      `)
      .eq('class.instructor_id', instructorId)
      .eq('status', 'ACTIVE');

    if (error) throw error;

    // עיבוד הנתונים למניעת כפילויות
    const studentMap = new Map();

    data.forEach((item: any) => {
      if (!item.student) return;
      
      const existing = studentMap.get(item.student.id);
      const className = item.class?.name;

      if (existing) {
          if (className && !existing.enrolledClass.includes(className)) {
              existing.enrolledClass += `, ${className}`;
          }
      } else {
          studentMap.set(item.student.id, {
              ...item.student,
              enrolledClass: className || '',
              role: 'STUDENT'
          });
      }
    });

    return Array.from(studentMap.values());
  },

  async create(studioId: string, studentData: any) {
    const { email, full_name, phone_number, password } = studentData;

    // 1. יצירת יוזר ב-Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: password || '123456',
      email_confirm: true
    });

    if (authError) throw authError;

    // 2. עדכון פרטים בטבלת users
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({
        full_name,
        phone_number,
        role: 'STUDENT',
        studio_id: studioId,
        status: 'ACTIVE'
      })
      .eq('id', authData.user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}; 