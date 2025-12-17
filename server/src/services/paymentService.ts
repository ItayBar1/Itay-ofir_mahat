import { supabase } from '../config/supabase';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-11-17.clover' as any, // או הגרסה העדכנית שלך
});

export class PaymentService {

    /**
     * מטפל באירוע הצלחת תשלום (נקרא מה-Webhook)
     */
    static async handlePaymentSuccess(paymentIntentId: string) {
        // 1. עדכון טבלת התשלומים ל-SUCCEEDED
        const { data: payment, error: paymentError } = await supabase
            .from('payments')
            .update({ 
                status: 'SUCCEEDED', 
                paid_date: new Date().toISOString() 
            })
            .eq('stripe_payment_intent_id', paymentIntentId)
            .select('enrollment_id') // נשלוף את ה-ID של ההרשמה כדי לעדכן גם אותה
            .single();

        if (paymentError) {
            console.error('Error updating payment status:', paymentError);
            throw new Error(paymentError.message);
        }

        if (!payment || !payment.enrollment_id) {
            console.warn(`Payment record not found or no enrollment linked for Intent ID: ${paymentIntentId}`);
            return;
        }

        // 2. עדכון טבלת ההרשמות ל-ACTIVE ו-PAID
        const { error: enrollmentError } = await supabase
            .from('enrollments')
            .update({ 
                status: 'ACTIVE', 
                payment_status: 'PAID' 
            })
            .eq('id', payment.enrollment_id);

        if (enrollmentError) {
            console.error('Error updating enrollment status:', enrollmentError);
            throw new Error(enrollmentError.message);
        }
        
        console.log(`Successfully processed payment for enrollment ${payment.enrollment_id}`);
    }

    /**
     * פונקציה לאימות החתימה של Stripe
     */
    static constructEvent(payload: Buffer, signature: string) {
        try {
            return stripe.webhooks.constructEvent(
                payload,
                signature,
                process.env.STRIPE_WEBHOOK_SECRET!
            );
        } catch (err: any) {
            throw new Error(`Webhook Error: ${err.message}`);
        }
    }
}