import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { Loader2, Search, Mail, Phone } from 'lucide-react';

interface StudentWithCourses {
    id: string;
    full_name: string;
    email: string;
    phone_number: string;
    courses: string;
}

export const InstructorStudents: React.FC = () => {
  const [students, setStudents] = useState<StudentWithCourses[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchMyStudents = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 1. קבלת ה-IDs של הקורסים שלי
        const { data: myClassesData } = await supabase
          .from('classes')
          .select('id, name')
          .eq('instructor_id', user.id);
            
        const myClasses = myClassesData as any[] || [];

        if (!myClasses.length) {
            setStudents([]);
            setLoading(false);
            return;
        }

        const classIds = myClasses.map((c: any) => c.id);

        // 2. קבלת ה-Enrollments לקורסים אלו
        // שימוש ב-any כדי למנוע שגיאות על ה-Join
        const { data: enrollmentsData } = await supabase
          .from('enrollments')
          .select('student_id, classes(name)')
          .in('class_id', classIds)
          .eq('status', 'ACTIVE'); 

        const enrollments = enrollmentsData as any[] || [];

        if (!enrollments.length) {
             setStudents([]);
             setLoading(false);
             return;
        }

        const studentIds = enrollments.map((e: any) => e.student_id);

        // 3. קבלת פרטי התלמידים
        const { data: studentsData } = await supabase
          .from('users')
          .select('*')
          .in('id', studentIds);
        
        const rawStudents = studentsData as any[] || [];

        // מיזוג המידע
        const combinedData: StudentWithCourses[] = rawStudents.map((student: any) => {
            // מציאת כל ההרשמות של התלמיד הספציפי מתוך רשימת ההרשמות ששלפנו קודם
            const studentEnrollments = enrollments.filter((e: any) => e.student_id === student.id);
            
            // חילוץ שמות הקורסים
            const courseNames = studentEnrollments
                .map((e: any) => e.classes?.name)
                .filter(Boolean) // סינון ערכים ריקים
                .join(', ');

            return { 
                id: student.id,
                full_name: student.full_name,
                email: student.email,
                phone_number: student.phone_number,
                courses: courseNames 
            };
        });

        setStudents(combinedData);

      } catch (error) {
        console.error('Error loading students:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyStudents();
  }, []);

  const filteredStudents = students.filter(student => 
    student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">התלמידים שלי</h2>
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="חיפוש תלמיד..." 
            className="pr-10 pl-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-slate-50 text-slate-500 text-sm">
            <tr>
              <th className="px-6 py-4 font-medium">שם התלמיד</th>
              <th className="px-6 py-4 font-medium">קורסים רשומים</th>
              <th className="px-6 py-4 font-medium">פרטי קשר</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStudents.length > 0 ? filteredStudents.map((student) => (
              <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                      {student.full_name?.[0] || '?'}
                    </div>
                    <span className="font-medium text-slate-800">{student.full_name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600">
                    {student.courses}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <Mail size={14} /> {student.email}
                    </div>
                    {student.phone_number && (
                      <div className="flex items-center gap-2">
                        <Phone size={14} /> {student.phone_number}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                  לא נמצאו תלמידים התואמים לחיפוש
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};