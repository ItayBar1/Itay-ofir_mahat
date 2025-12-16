// client/components/student/RegistrationModal.tsx
import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { X, Loader2, CheckCircle, AlertCircle, CreditCard } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';

// טעינת Stripe עם המפתח הציבורי שלך
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

// --- טופס הסליקה הפנימי ---
const CheckoutForm = ({ onSuccess, onError }: { onSuccess: () => void, onError: (msg: string) => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required'
    });

    if (error) {
      onError(error.message || 'שגיאה בתשלום');
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onSuccess();
    }
    setProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <PaymentElement options={{ layout: 'tabs' }} />
      <button
        disabled={!stripe || processing}
        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors flex justify-center items-center gap-2"
      >
        {processing ? <Loader2 className="animate-spin" /> : 'שלם וסיים הרשמה'}
      </button>
    </form>
  );
};

// --- המודל הראשי ---
interface RegistrationModalProps {
  course: any | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({ course, isOpen, onClose, onSuccess }) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && course) {
      // ברגע שהמודל נפתח - יוצרים כוונת תשלום מול השרת
      const createIntent = async () => {
        setLoading(true);
        setError(null);
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) throw new Error('משתמש לא מחובר');

          // שימוש בכתובת ה-API מה-.env
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
          
          const res = await fetch(`${apiUrl}/payment/create-intent`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}` // אופציונלי: השרת יכול לאמת את המשתמש
            },
            body: JSON.stringify({
              amount: course.price_ils,
              currency: 'ils',
              description: `הרשמה לקורס: ${course.name}`
            })
          });

          if (!res.ok) throw new Error('שגיאה ביצירת תשלום');
          
          const data = await res.json();
          setClientSecret(data.clientSecret);
        } catch (err: any) {
          console.error(err);
          setError('לא ניתן להתחבר לשרת התשלומים. נסה שוב מאוחר יותר.');
        } finally {
          setLoading(false);
        }
      };

      createIntent();
    } else {
      // איפוס ביציאה
      setClientSecret(null);
      setPaymentSuccess(false);
      setError(null);
    }
  }, [isOpen, course]);

const handlePaymentSuccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && course) {
        // 1. הוספת הרשמה (עכשיו הקליינט מזהה את הטבלה)
        const { error: enrollError } = await supabase.from('enrollments').insert({
          student_id: user.id,
          class_id: course.id,
          studio_id: course.studio_id,
          status: 'ACTIVE',
          payment_status: 'PAID',
          start_date: new Date().toISOString(),
          // המרה למספר ליתר ביטחון, למקרה שזה מגיע כמחרוזת
          total_amount_paid: Number(course.price_ils),
          total_amount_due: Number(course.price_ils)
        });
        
        if (enrollError) throw enrollError;

        // 2. עדכון מונה נרשמים (עכשיו הקליינט מזהה את הפונקציה)
        const { error: rpcError } = await supabase.rpc('increment_enrollment', { 
          class_id: course.id 
        });

        if (rpcError) throw rpcError;
      }
      
      setPaymentSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 3000);
    } catch (err) {
      console.error("Error finalizing enrollment:", err);
      // עדיין נציג הצלחה כי הכסף עבר
      setPaymentSuccess(true);
    }
  };

  if (!isOpen || !course) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
          <h3 className="font-bold">הרשמה ל{course.name}</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        <div className="p-6 overflow-y-auto">
          {paymentSuccess ? (
            <div className="text-center py-8 animate-fadeIn">
              <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-800">ההרשמה הושלמה!</h2>
              <p className="text-slate-500 mt-2">קבלה נשלחה למייל שלך.</p>
            </div>
          ) : (
            <>
              <div className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div className="flex justify-between mb-2">
                  <span className="text-slate-600">מחיר הקורס:</span>
                  <span className="font-bold text-lg">₪{course.price_ils}</span>
                </div>
                <div className="text-xs text-slate-400">החיוב יבוצע באופן חד פעמי</div>
              </div>

              {loading && (
                <div className="flex justify-center py-10">
                  <Loader2 className="animate-spin text-indigo-600" size={32} />
                </div>
              )}

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 text-sm mb-4">
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              {clientSecret && !loading && (
                <Elements stripe={stripePromise} options={{ clientSecret, locale: 'he' }}>
                  <CheckoutForm onSuccess={handlePaymentSuccess} onError={setError} />
                </Elements>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};