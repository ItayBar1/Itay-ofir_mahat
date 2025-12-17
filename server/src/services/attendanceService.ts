import { supabase } from '../config/supabase';

interface AttendanceRecord {
    studentId: string;
    status: 'PRESENT' | 'ABSENT' | 'EXCUSED' | 'LATE';
    notes?: string;
}

export class AttendanceService {

    /**
     * Record attendance (Upsert).
     * Automatically fetches enrollment_id for each student to satisfy DB constraints.
     */
    static async recordAttendance(classId: string, date: string, instructorId: string, records: AttendanceRecord[]) {
        // 1. שליפת ה-enrollment_id עבור התלמידים בקורס זה
        const studentIds = records.map(r => r.studentId);
        
        const { data: enrollments, error: enrollError } = await supabase
            .from('enrollments')
            .select('id, student_id')
            .eq('class_id', classId)
            .in('student_id', studentIds);

        if (enrollError) throw new Error(`Error fetching enrollments: ${enrollError.message}`);

        // יצירת מפה (Map) לגישה מהירה: studentId -> enrollmentId
        const enrollmentMap = new Map(enrollments?.map(e => [e.student_id, e.id]));

        // 2. הכנת המידע להכנסה (Upsert Data)
        const upsertData = records.map(record => {
            const enrollmentId = enrollmentMap.get(record.studentId);
            
            // אם אין הרשמה, אי אפשר לרשום נוכחות (לפי ה-PRD)
            if (!enrollmentId) {
                console.warn(`Skipping attendance for student ${record.studentId}: No enrollment found in class ${classId}`);
                return null; 
            }

            return {
                studio_id: supabase.auth.getUser() ? undefined : undefined, // יטופל אוטומטית אם יש לנו קונטקסט, אבל כאן נצטרך לשלוף סטודיו מקורס או שה-RLS יטפל.
                // תיקון: ה-DB דורש studio_id. נשלוף אותו מהקורס או מהמשתמש. 
                // הדרך היעילה: לבצע שאילתה אחת לקבלת ה-studio_id של הקורס בתחילת הפונקציה.
                // נניח לבינתיים שה-Trigger ב-DB או ה-Default לא קיים, אז נצטרך לספק אותו.
                // נשאיר זאת פשוט: נשלוף את ה-studio_id מה-classId בשלב 0.
                class_id: classId,
                instructor_id: instructorId,
                enrollment_id: enrollmentId,
                student_id: record.studentId,
                session_date: date,
                status: record.status,
                notes: record.notes,
                recorded_by: instructorId,
                recorded_at: new Date().toISOString()
            };
        }).filter(item => item !== null); // מסנן את אלו ללא הרשמה

        // שלב 0 (השלמה): שליפת ה-studio_id כדי למלא את השדה חובה
        if (upsertData.length > 0) {
            const { data: classData } = await supabase.from('classes').select('studio_id').eq('id', classId).single();
            if (classData) {
                upsertData.forEach(item => item!.studio_id = classData.studio_id);
            }
        }

        // 3. ביצוע ה-Upsert
        const { data, error } = await supabase
            .from('attendance')
            .upsert(upsertData, { onConflict: 'enrollment_id, session_date' }) // לפי האינדקס ב-PRD
            .select();

        if (error) throw new Error(error.message);
        return data;
    }

    /**
     * Get attendance for a specific class
     */
    static async getClassAttendance(classId: string, date?: string) {
        let query = supabase
            .from('attendance')
            .select(`
                *,
                student:users!student_id(full_name, profile_image_url)
            `)
            .eq('class_id', classId)
            .order('session_date', { ascending: false });

        if (date) {
            query = query.eq('session_date', date);
        }

        const { data, error } = await query;
        if (error) throw new Error(error.message);
        return data;
    }

    /**
     * Get attendance history for a student
     */
    static async getStudentHistory(studentId: string) {
        const { data, error } = await supabase
            .from('attendance')
            .select(`
                session_date,
                status,
                notes,
                class:classes(name, start_time, end_time)
            `)
            .eq('student_id', studentId)
            .order('session_date', { ascending: false });

        if (error) throw new Error(error.message);
        return data;
    }
}