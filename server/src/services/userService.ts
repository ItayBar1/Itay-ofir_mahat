import { supabaseAdmin } from '../config/supabase';

export class UserService {
  /**
   * שליפת פרופיל משתמש מלא לפי ID
   */
  static async getUserProfile(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw new Error(`Error fetching user profile: ${error.message}`);
    }

    return data;
  }
}