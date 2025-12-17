import { Request, Response, NextFunction } from "express";
import { StudentService } from "../services/studentService";

export const StudentController = {
  getAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, search } = req.query;
      const result = await StudentService.getAll(
        req.studioId,
        Number(page) || 1,
        Number(limit) || 50,
        search as string
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const student = await StudentService.getById(req.params.id);
      res.json(student);
    } catch (error) {
      next(error);
    }
  },

  getByInstructor: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const students = await StudentService.getByInstructor(req.user.id);
      res.json(students);
    } catch (error) {
      next(error);
    }
  },

  /**
   * מחיקת תלמיד (Soft Delete)
   */
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ error: "Student ID is required" });
        return;
      }

      const deletedStudent = await StudentService.deleteStudent(id);

      res.status(200).json({
        message: "Student deleted successfully (Soft Delete)",
        student: deletedStudent,
      });
    } catch (error: any) {
      // שימוש ב-logger אם קיים, או הדפסה לקונסול
      console.error("Error deleting student:", error);

      if (error.message === "Student not found") {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newStudent = await StudentService.create(req.studioId, req.body);
      res.status(201).json(newStudent);
    } catch (error: any) {
      next(error);
    }
  },
};
