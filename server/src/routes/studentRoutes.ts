import { Router } from 'express';
import { StudentController } from '../controllers/studentController';
import { authenticateUser, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateUser);

// נתיבי אדמין
router.get('/', requireRole(['ADMIN']), StudentController.getAll);
router.post('/', requireRole(['ADMIN']), StudentController.create);

// נתיב למדריך (חייב להיות לפני :id כדי שלא יתפוס אותו כ-ID)
router.get('/my-students', requireRole(['INSTRUCTOR', 'ADMIN']), StudentController.getByInstructor);

// פרטי תלמיד ספציפי
router.get('/:id', requireRole(['ADMIN', 'INSTRUCTOR']), StudentController.getById);

export default router;