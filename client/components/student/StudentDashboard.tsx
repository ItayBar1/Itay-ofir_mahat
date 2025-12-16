import React from 'react';
import { BookOpen, CheckCircle } from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">הקורסים שלי</h2>
      
      {/* כאן תבוא טבלת הקורסים של הסטודנט - MyCoursesTable */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 text-center">
        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <BookOpen className="text-indigo-600" size={32} />
        </div>
        <h3 className="text-lg font-medium text-slate-900">עדיין לא נרשמת לקורסים</h3>
        <p className="text-slate-500 mt-2 mb-6">הירשם לקורסים חדשים כדי לראות אותם כאן</p>
        {/* כפתור זה יכול להעביר לטאב ה-Browse */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <CheckCircle size={20} className="text-green-500"/>
                שיעורים קרובים
            </h3>
            <p className="text-slate-500">אין שיעורים קרובים השבוע.</p>
         </div>
      </div>
    </div>
  );
};