import { supabaseAdmin } from '../config/supabase';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

// אתחול Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-01-27.acacia' as any, // וודא שהגרסה תואמת
});

export class PaymentService {
  
  /**
   * יצירת כוונת תשלום (Payment Intent) ב-Stripe
   */
  static async createIntent(amount: number, currency: string = 'ils', description?: string, metadata?: any) {
    if (!amount || amount <= 0) {
      throw new Error('Invalid amount');
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe דורש אגורות/סנטים
      currency: currency,
      description: description,
      metadata: metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return { clientSecret: paymentIntent.client_secret, id: paymentIntent.id };
  }

  /**
   * יצירת רשומת תשלום ב-DB בסטטוס PENDING
   * זהו הקישור בין ה-Stripe Payment Intent לבין ההרשמה והמשתמש במערכת
   */
  static async createPaymentRecord(params: {
    studioId: string;
    studentId: string;
    enrollmentId: string;
    amount: number;
    currency?: string;
    stripePaymentIntentId: string;
  }) {
    const { 
        studioId, studentId, enrollmentId, amount, 
        currency = 'ILS', stripePaymentIntentId 
    } = params;

    const { data, error } = await supabaseAdmin
      .from('payments')
      .insert([{
        studio_id: studioId,
        student_id: studentId,
        enrollment_id: enrollmentId,
        amount_ils: amount,
        amount_cents: Math.round(amount * 100),
        currency: currency,
        payment_method: 'STRIPE',
        stripe_payment_intent_id: stripePaymentIntentId,
        status: 'PENDING', // ממתין לאישור ב-Webhook או ב-Client
        created_at: new Date()
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create payment record: ${error.message}`);
    }

    return data;
  }

  /**
   * אימות תשלום ועדכון מסד הנתונים (הפונקציה שיצרנו קודם)
   */
  static async confirmPayment(paymentIntentId: string) {
    // 1. אימות מול Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      throw new Error(`Payment not succeeded. Status: ${paymentIntent.status}`);
    }

    // 2. עדכון טבלת התשלומים
    const { data: paymentRecord, error: paymentError } = await supabaseAdmin
      .from('payments')
      .update({
        status: 'SUCCEEDED',
        paid_date: new Date().toISOString(),
        stripe_charge_id: paymentIntent.latest_charge as string,
        updated_at: new Date().toISOString()
      })
      .eq('stripe_payment_intent_id', paymentIntentId)
      .select()
      .single();

    if (paymentError) {
      throw new Error(`Failed to update payment record: ${paymentError.message}`);
    }

    // 3. עדכון סטטוס הרשמה אם קיים
    if (paymentRecord.enrollment_id) {
      await supabaseAdmin
        .from('enrollments')
        .update({
          payment_status: 'PAID',
          status: 'ACTIVE',
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentRecord.enrollment_id);
    }

    return { success: true, payment: paymentRecord };
  }

  /**
   * שליפת כל היסטוריית התשלומים (עבור אדמין)
   */
  static async getAllPayments(studioId: string) {
    // הנחה: הטבלה payments מקושרת ל-users ול-enrollments
    // נבצע שליפה שכוללת את שם הסטודנט
    const { data, error } = await supabaseAdmin
      .from('payments')
      .select(`
        *,
        student:users ( full_name, email ),
        enrollment:enrollments ( 
          class:courses ( title ) 
        )
      `)
      .eq('studio_id', studioId) // סינון לפי סטודיו
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch payments: ${error.message}`);
    }

    return data;
  }
}