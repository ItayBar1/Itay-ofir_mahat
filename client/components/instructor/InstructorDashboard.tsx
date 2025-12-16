import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Calendar, 
  CheckCircle, 
  Clock,
  Loader2
} from 'lucide-react';
import { supabase } from '../../services/supabaseClient';

// הגדרת טיפוס עבור הקורס כפי שהוא נשלף מהדאטהבייס
interface InstructorClass {
  id: string;
  name: string;
  day_of_week: number;
  start_time: string;
  current_enrollment: number;
}

export const InstructorDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    myCoursesCount: 0,
    myStudentsCount: 0,
    nextClass: null as InstructorClass | null,
    todayClassesCount: 0
  });
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const fetchInstructorData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setUserName(user.user_metadata.full_name || 'מדריך');

        // 1. שליפת הקורסים של המדריך
        const { data, error: classesError } = await supabase
          .from('classes')
          .select('id, name, day_of_week, start_time, current_enrollment')
          .eq('instructor_id', user.id)
          .eq('is_active', true);

        if (classesError) throw classesError;

        // המרה יזומה לטיפוס שהגדרנו כדי למנוע שגיאות TypeScript
        const myClasses = (data || []) as unknown as InstructorClass[];

        // 2. חישוב סה"כ תלמידים (סכום הרשומים בכל הקורסים)
        const totalStudents = myClasses.reduce((acc, curr) => acc + (curr.current_enrollment || 0), 0);

        // 3. מציאת השיעור הבא והשיעורים של היום
        const today = new Date();
        const currentDayOfWeek = today.getDay(); // 0 = Sunday
        
        const todayClasses = myClasses.filter(c => c.day_of_week === currentDayOfWeek);
        
        // לוגיקה פשוטה למציאת השיעור הבא
        const sortedClasses = [...myClasses].sort((a, b) => a.day_of_week - b.day_of_week);
        
        // נסיון למצוא שיעור מאוחר יותר היום או בהמשך השבוע
        let nextClass = sortedClasses.find(c => c.day_of_week >= currentDayOfWeek);
        // אם לא נמצא (אנחנו בסוף השבוע), ניקח את השיעור הראשון בשבוע הבא
        if (!nextClass && sortedClasses.length > 0) {
            nextClass = sortedClasses[0];
        }

        setStats({
          myCoursesCount: myClasses.length,
          myStudentsCount: totalStudents,
          nextClass: nextClass || null,
          todayClassesCount: todayClasses.length
        });

      } catch (error) {
        console.error('Error fetching instructor data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructorData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">שלום, {userName}</h2>
          <p className="text-slate-500">סיכום פעילות הקורסים שלך</p>
        </div>
      </div>

      {/* כרטיסי סטטיסטיקה */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">הקורסים שלי</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.myCoursesCount}</h3>
          </div>
          <div className="p-3 rounded-lg bg-indigo-500 text-white">
            <Calendar size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">סה"כ תלמידים</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.myStudentsCount}</h3>
          </div>
          <div className="p-3 rounded-lg bg-blue-500 text-white">
            <Users size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">שיעורים היום</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.todayClassesCount}</h3>
          </div>
          <div className="p-3 rounded-lg bg-green-500 text-white">
            <Clock size={24} />
          </div>
        </div>
      </div>

      {/* אזור השיעור הבא */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <CheckCircle className="text-indigo-600" size={20} />
          השיעור הבא במערכת
        </h3>
        {stats.nextClass ? (
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-bold text-lg text-slate-800">{stats.nextClass.name}</h4>
                <p className="text-slate-500">
                  {['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'][stats.nextClass.day_of_week]} • {stats.nextClass.start_time.slice(0,5)}
                </p>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                  {stats.nextClass.current_enrollment} רשומים
                </span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-slate-500">אין שיעורים קרובים במערכת.</p>
        )}
      </div>
    </div>
  );
};