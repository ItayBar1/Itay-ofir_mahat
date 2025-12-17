import { supabaseAdmin } from "../config/supabase";

export class EnrollmentService {
  /**
   * Enroll a student to a class.
   * Returns the enrollment object AND the course price for payment processing.
   */
  static async enrollStudent(
    studioId: string,
    studentId: string,
    classId: string,
    status: "ACTIVE" | "PENDING" = "ACTIVE",
    paymentStatus: "PAID" | "PENDING" | "OVERDUE" = "PAID",
    notes?: string
  ) {
    // 1. קבלת פרטי הקורס (קיבולת נוכחית ומקסימלית) ומחיר
    const { data: course, error: courseError } = await supabaseAdmin
      .from("classes")
      .select("max_capacity, current_enrollment, price_ils, start_time, name")
      .eq("id", classId)
      .single();

    if (courseError || !course) throw new Error("Course not found");

    // 2. בדיקת קיבולת
    if (course.current_enrollment >= course.max_capacity) {
      throw new Error("Course is full");
    }

    // 3. בדיקת רישום כפול
    const { data: existing } = await supabaseAdmin
      .from("enrollments")
      .select("id")
      .eq("student_id", studentId)
      .eq("class_id", classId)
      .neq("status", "CANCELLED")
      .single();

    if (existing) {
      throw new Error("Student is already enrolled in this course");
    }

    // 4. יצירת ההרשמה
    const { data: enrollment, error: enrollError } = await supabaseAdmin
      .from("enrollments")
      .insert([
        {
          studio_id: studioId,
          student_id: studentId,
          class_id: classId,
          status: status,
          payment_status: paymentStatus,
          start_date: new Date(),
          total_amount_due: course.price_ils,
          notes: notes,
        },
      ])
      .select()
      .single();

    if (enrollError) throw new Error(enrollError.message);

    // 5. עדכון מונה הנרשמים
    if (status === "ACTIVE" || status === "PENDING") {
      const { error: rpcError } = await supabaseAdmin.rpc(
        "increment_enrollment_count",
        { row_id: classId }
      );

      // Fallback אם ה-RPC לא קיים או נכשל
      if (rpcError) {
        await supabaseAdmin
          .from("classes")
          .update({ current_enrollment: course.current_enrollment + 1 })
          .eq("id", classId);
      }
    }

    // החזרת ההרשמה + פרטי הקורס הרלוונטיים לתשלום
    return {
      enrollment,
      courseDetails: {
        price: course.price_ils,
        name: course.name,
      },
    };
  }

  /**
   * Get enrollments for a specific student
   */
  static async getStudentEnrollments(studentId: string) {
    const { data, error } = await supabaseAdmin
      .from("enrollments")
      .select(
        `
                *,
                class:classes(name, description, day_of_week, start_time, instructor:users(full_name))
            `
      )
      .eq("student_id", studentId)
      .neq("status", "CANCELLED")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Get enrollments for a specific class (Student roster)
   */
  static async getClassEnrollments(classId: string) {
    const { data, error } = await supabaseAdmin
      .from("enrollments")
      .select(
        `
                id,
                status,
                payment_status,
                student:users(id, full_name, email, phone_number, profile_image_url)
            `
      )
      .eq("class_id", classId)
      .neq("status", "CANCELLED")
      .order("created_at", { ascending: true });

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Cancel enrollment
   */
  static async cancelEnrollment(enrollmentId: string) {
    // 1. קבלת ה-class_id לפני המחיקה כדי לעדכן מונה
    const { data: enrollment } = await supabaseAdmin
      .from("enrollments")
      .select("class_id, status")
      .eq("id", enrollmentId)
      .single();

    if (!enrollment) throw new Error("Enrollment not found");

    // 2. עדכון הסטטוס ל-CANCELLED
    const { error } = await supabaseAdmin
      .from("enrollments")
      .update({ status: "CANCELLED" })
      .eq("id", enrollmentId);

    if (error) throw new Error(error.message);

    // 3. עדכון מונה הנרשמים (הפחתה)
    if (enrollment.status === "ACTIVE" || enrollment.status === "PENDING") {
      await supabaseAdmin.rpc("decrement_enrollment_count", {
        row_id: enrollment.class_id,
      });
      // Fallback if RPC doesn't exist: fetch class -> update current - 1
    }
  }

  /**
   * Helper to verify if instructor owns the class
   */
  static async verifyInstructorClass(
    instructorId: string,
    classId: string
  ): Promise<boolean> {
    const { data } = await supabaseAdmin
      .from("classes")
      .select("instructor_id")
      .eq("id", classId)
      .single();

    return data?.instructor_id === instructorId;
  }
}
