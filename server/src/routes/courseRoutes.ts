import { Router } from 'express';
import { CourseController } from '../controllers/courseController';
import { authenticateUser, requireRole } from '../middleware/authMiddleware';

const router = Router();

// כל הנתיבים דורשים אימות
router.use(authenticateUser);

// נתיבים כלליים
router.get('/', CourseController.getAll);

// נתיבים למדריך
router.get('/my-courses', requireRole(['INSTRUCTOR', 'ADMIN']), CourseController.getInstructorCourses);

// נתיבים לתלמיד
router.get('/enrolled', requireRole(['STUDENT', 'ADMIN']), CourseController.getEnrolledCourses);
router.post('/enroll', requireRole(['STUDENT']), CourseController.enroll);

// נתיבי אדמין
router.post('/', requireRole(['ADMIN']), CourseController.create);

export default router;