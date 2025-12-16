import React, { useState, useEffect } from "react";
import { supabase } from "./services/supabaseClient";
import { Session } from "@supabase/supabase-js";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard"; // Admin Dashboard
import { StudentDashboard } from "./components/student/StudentDashboard"; // Student Dashboard
import { StudentManagement } from "./components/StudentManagement";
import { ClassSchedule } from "./components/ClassSchedule";
import { AuthPage } from "./components/AuthPage";
import { Loader2 } from "lucide-react";
import { Payments } from "./components/Payments";
import { BrowseCourses } from "./components/student/BrowseCourses";

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  // שמירת התפקיד בסטייט לגישה נוחה
  const [userRole, setUserRole] = useState<string>("STUDENT"); 

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.user_metadata?.role) {
        setUserRole(session.user.user_metadata.role);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user?.user_metadata?.role) {
        setUserRole(session.user.user_metadata.role);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserRole("STUDENT"); // Reset role on logout
  };

  const renderContent = () => {
    // לוגיקת ניתוב לפי טאב ותפקיד
    switch (activeTab) {
      case "dashboard":
        // הפרדה בין דאשבורד מנהל לדאשבורד סטודנט
        if (userRole === 'ADMIN') return <Dashboard />;
        if (userRole === 'INSTRUCTOR') return <Dashboard />; // או ליצור InstructorDashboard בעתיד
        return <StudentDashboard />;
        
      case "students":
        // הגנה: סטודנט לא אמור לראות את זה
        if (userRole === 'STUDENT') return <div>אין לך הרשאה לצפות בעמוד זה</div>;
        return <StudentManagement />;
        
      case "schedule":
        // הגנה: לפי ה-PRD סטודנט רואה את הלו"ז שלו בדאשבורד, אבל אם רוצים לאפשר לו לראות לו"ז כללי:
        // כרגע נחסום לפי האפיון ב-Sidebar, אבל נוסיף הגנה גם כאן
        if (userRole === 'STUDENT') return <div>אין לך הרשאה לצפות בעמוד זה</div>;
        return <ClassSchedule />;
        
      case "payments":
        if (userRole !== 'ADMIN') return <div>אין לך הרשאה לצפות בעמוד זה</div>;
        return <Payments />;
        
      case "browse":
        // דף לסטודנטים
        return <BrowseCourses />;
        
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
            <h2 className="text-2xl font-bold text-slate-300 mb-2">בקרוב...</h2>
            <p>המודול {activeTab} נמצא כרגע בפיתוח.</p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 text-indigo-600">
        <Loader2 className="animate-spin w-10 h-10" />
      </div>
    );
  }

  if (!session) {
    return <AuthPage />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans" dir="rtl">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        // @ts-ignore
        onLogout={handleLogout}
        userRole={userRole} // העברת התפקיד ל-Sidebar
      />

      <main className="flex-1 mr-64 p-8">
        <header className="flex justify-end mb-8">
          <div className="flex items-center gap-4">
            <div className="text-left">
              <p className="text-sm font-bold text-slate-700">
                {session.user.user_metadata.full_name || "משתמש"}
              </p>
              <p className="text-xs text-slate-500 uppercase">
                {userRole === 'ADMIN' ? 'מנהל מערכת' : 
                 userRole === 'INSTRUCTOR' ? 'מדריך' : 'סטודנט'}
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm border-2 border-white shadow-sm cursor-pointer">
              {session.user.email?.[0].toUpperCase()}
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto animate-fadeIn">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;