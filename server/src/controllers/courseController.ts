import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';

export const CourseController = {
  // קבלת כל הקורסים (מסונן לפי הרשאה)
  getAll: async (req: Request, res: Response) => {
    try {
      const user = req.user;
      const studioId = req.studioId;
      
      // שליפה בסיסית של קורסים מהסטודיו
      let query = supabaseAdmin
        .from('classes')
        .select('*, instructor:users!classes_instructor_id_fkey(full_name, profile_image_url)') // Join להבאת פרטי המדריך
        .eq('studio_id', studioId);

      // לוגיקה עסקית לפי תפקיד
      if (user.role === 'STUDENT') {
        // סטודנט רואה רק קורסים פעילים
        query = query.eq('is_active', true);
      } else if (user.role === 'INSTRUCTOR') {
        // מדריך רואה רק את הקורסים שלו דרך ה-API הזה או דרך getInstructorCourses הייעודי
        // כאן נשאיר לו לראות הכל או נסנן, תלוי באפיון. לרוב בקטלוג הוא יראה הכל.
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      res.json(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      res.status(500).json({ error: 'Failed to fetch courses' });
    }
  },

  // קורסים של המדריך המחובר
  getInstructorCourses: async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabaseAdmin
        .from('classes')
        .select('*')
        .eq('instructor_id', req.user.id)
        .eq('studio_id', req.studioId);

      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch instructor courses' });
    }
  },

  // הקורסים שהתלמיד רשום אליהם
  getEnrolledCourses: async (req: Request, res: Response) => {
    try {
      // שליפת ההרשמות + פרטי הקורס המלאים
      const { data, error } = await supabaseAdmin
        .from('enrollments')
        .select(`
          class:classes (
            *,
            instructor:users!classes_instructor_id_fkey(full_name)
          )
        `)
        .eq('student_id', req.user.id)
        .eq('status', 'ACTIVE'); // רק הרשמות פעילות

      if (error) throw error;

      // המרה למבנה שטוח של מערך קורסים
      const courses = data.map((enrollment: any) => enrollment.class);
      res.json(courses);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch enrolled courses' });
    }
  },

  // הרשמה לקורס
  enroll: async (req: Request, res: Response) => {
    try {
      const { courseId } = req.body;
      const studentId = req.user.id;
      const studioId = req.studioId;

      if (!courseId) {
        return res.status(400).json({ error: 'Course ID is required' });
      }

      // 1. בדיקה אם הקורס קיים ויש מקום
      const { data: course, error: courseError } = await supabaseAdmin
        .from('classes')
        .select('max_capacity, current_enrollment, price_ils')
        .eq('id', courseId)
        .single();

      if (courseError || !course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      if (course.current_enrollment >= course.max_capacity) {
        return res.status(400).json({ error: 'Course is full' });
      }

      // 2. בדיקה אם כבר רשום
      const { data: existing, error: existError } = await supabaseAdmin
        .from('enrollments')
        .select('id')
        .eq('student_id', studentId)
        .eq('class_id', courseId)
        .eq('status', 'ACTIVE') // או לבדוק כל סטטוס כדי למנוע כפילות
        .single();

      if (existing) {
        return res.status(400).json({ error: 'Already enrolled in this course' });
      }

      // 3. ביצוע ההרשמה (Insert)
      const { error: enrollError } = await supabaseAdmin
        .from('enrollments')
        .insert([{
          studio_id: studioId,
          student_id: studentId,
          class_id: courseId,
          status: 'ACTIVE',
          enrollment_date: new Date().toISOString(),
          start_date: new Date().toISOString(), // תאריך התחלה היום
          total_amount_due: course.price_ils,
          // תשלום בפועל מטופל בנפרד או מעודכן לאחר מכן
        }]);

      if (enrollError) throw enrollError;

      // 4. עדכון מונה הנרשמים בקורס (אפשר גם לעשות בטריגר ב-DB)
      await supabaseAdmin.rpc('increment_enrollment', { class_id: courseId }); // נניח שיש פונקציה כזו, או update רגיל:
      /* await supabaseAdmin
        .from('classes')
        .update({ current_enrollment: course.current_enrollment + 1 })
        .eq('id', courseId);
      */

      res.status(201).json({ message: 'Enrolled successfully' });
    } catch (error: any) {
      console.error('Enrollment error:', error);
      res.status(500).json({ error: error.message || 'Failed to enroll' });
    }
  },

  // יצירת קורס (רק לאדמין)
  create: async (req: Request, res: Response) => {
    try {
      const { name, description, instructor_id, start_time, end_time, price_ils, day_of_week, max_capacity, level, location_room } = req.body;
      
      const { data, error } = await supabaseAdmin
        .from('classes')
        .insert([{
          studio_id: req.studioId,
          name,
          description,
          instructor_id,
          day_of_week,
          start_time,
          end_time,
          max_capacity,
          level,
          location_room,
          price_ils,
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;
      res.status(201).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create course' });
    }
  }
};