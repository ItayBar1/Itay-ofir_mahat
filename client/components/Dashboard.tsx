import React, { useEffect, useState } from 'react';
import { 
  Users, 
  DollarSign, 
  CalendarCheck, 
  TrendingUp,
  Loader2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { supabase } from '../services/supabaseClient';
import { Database } from '../types/database'; // ייבוא הטיפוסים

// טיפוס לנתוני הגרף
interface ChartData {
  name: string;
  revenue: number;
  attendance: number;
}

// הגדרת טיפוסים ספציפיים לשליפות כדי למנוע שגיאות TypeScript
type PaymentData = Pick<Database['public']['Tables']['payments']['Row'], 'amount_ils' | 'created_at'>;
type AttendanceData = Pick<Database['public']['Tables']['attendance']['Row'], 'session_date' | 'status'>;

const StatCard = ({ title, value, subtext, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between hover:shadow-md transition-shadow">
    <div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
      <p className={`text-xs mt-2 font-medium ${subtext.includes('+') ? 'text-green-600' : 'text-slate-400'}`}>
        {subtext}
      </p>
    </div>
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon className="text-white" size={24} />
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    monthlyRevenue: 0,
    activeClasses: 0,
    avgAttendance: 0
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        const sevenDaysAgoStr = sevenDaysAgo.toISOString();

        // 1. שליפת סה"כ תלמידים
        const { count: studentsCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'STUDENT');

        // 2. שליפת שיעורים פעילים
        const { count: classesCount } = await supabase
          .from('classes')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);

        // 3. שליפת תשלומים לחודש הנוכחי (עבור הכנסות)
        // הוספנו .returns<PaymentData[]>() לטיפול בשגיאות הטיפוסים
        const { data: payments } = await supabase
          .from('payments')
          .select('amount_ils, created_at')
          .gte('created_at', firstDayOfMonth)
          .returns<PaymentData[]>(); 

        const monthlyRevenue = payments?.reduce((sum, p) => sum + Number(p.amount_ils), 0) || 0;

        // 4. חישוב נתונים לגרפים (7 ימים אחרונים)
        
        // שליפת תשלומים לגרף
        const { data: weekPayments } = await supabase
          .from('payments')
          .select('amount_ils, created_at')
          .gte('created_at', sevenDaysAgoStr)
          .returns<PaymentData[]>();

        // שליפת נוכחות לגרף
        const { data: weekAttendance } = await supabase
          .from('attendance')
          .select('session_date, status')
          .gte('session_date', sevenDaysAgoStr)
          .eq('status', 'PRESENT')
          .returns<AttendanceData[]>();

        // עיבוד הנתונים לגרף לפי ימים
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const chartMap = new Map<string, ChartData>();

        // אתחול 7 הימים האחרונים
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(now.getDate() - i);
          const dayName = days[d.getDay()];
          const dateKey = d.toISOString().split('T')[0]; // YYYY-MM-DD
          
          chartMap.set(dateKey, { name: dayName, revenue: 0, attendance: 0 });
        }

        // מילוי הכנסות
        weekPayments?.forEach((p) => {
          const dateKey = new Date(p.created_at).toISOString().split('T')[0];
          if (chartMap.has(dateKey)) {
            const current = chartMap.get(dateKey)!;
            current.revenue += Number(p.amount_ils);
          }
        });

        // מילוי נוכחות
        weekAttendance?.forEach((a) => {
           const dateKey = a.session_date; 
           if (chartMap.has(dateKey)) {
             const current = chartMap.get(dateKey)!;
             current.attendance += 1;
           } else {
             // חיפוש במקרה של אי-התאמה בפורמט
             for (let [key, val] of chartMap.entries()) {
               if (key === dateKey) val.attendance += 1;
             }
           }
        });

        const formattedChartData = Array.from(chartMap.values());

        // חישוב ממוצע נוכחות שבועי
        const totalAttendance = weekAttendance?.length || 0;
        const avgAtt = totalAttendance > 0 ? Math.round((totalAttendance / 7) * 10) / 10 : 0; 

        setStats({
          totalStudents: studentsCount || 0,
          activeClasses: classesCount || 0,
          monthlyRevenue,
          avgAttendance: avgAtt 
        });
        
        setChartData(formattedChartData);

      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <Loader2 className="animate-spin mr-2" /> Loading data...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Overview</h2>
          <p className="text-slate-500">Welcome back, Administrator.</p>
        </div>
        <div className="text-sm text-slate-500 bg-slate-100 px-4 py-2 rounded-full">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Students" 
          value={stats.totalStudents.toLocaleString()} 
          subtext="Active records" 
          icon={Users} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Monthly Revenue" 
          value={`₪${stats.monthlyRevenue.toLocaleString()}`} 
          subtext="Current month" 
          icon={DollarSign} 
          color="bg-green-500" 
        />
        <StatCard 
          title="Active Classes" 
          value={stats.activeClasses} 
          subtext="Currently running" 
          icon={CalendarCheck} 
          color="bg-indigo-500" 
        />
        <StatCard 
          title="Weekly Attendance" 
          value={stats.avgAttendance} 
          subtext="Avg per day (7 days)" 
          icon={TrendingUp} 
          color="bg-orange-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Revenue Trend (Last 7 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`₪${value}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Weekly Attendance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                   contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="attendance" stroke="#f97316" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};