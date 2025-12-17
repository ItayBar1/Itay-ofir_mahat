declare namespace Express {
  export interface Request {
    user: {
      id: string;
      role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT' | 'PARENT';
      email: string;
    };
    studioId: string; // הגדרת השדה שחסר לך
  }
}