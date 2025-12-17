import { Request, Response } from 'express';
import { StudentService } from '../services/studentService';

export const StudentController = {
  getAll: async (req: Request, res: Response) => {
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
      console.error('Error fetching students:', error);
      res.status(500).json({ error: 'Failed to fetch students' });
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const student = await StudentService.getById(req.params.id);
      res.json(student);
    } catch (error) {
      res.status(404).json({ error: 'Student not found' });
    }
  },

  getByInstructor: async (req: Request, res: Response) => {
    try {
      const students = await StudentService.getByInstructor(req.user.id);
      res.json(students);
    } catch (error) {
      console.error('Error fetching instructor students:', error);
      res.status(500).json({ error: 'Failed to fetch students' });
    }
  },

  create: async (req: Request, res: Response) => {
    try {
      const newStudent = await StudentService.create(req.studioId, req.body);
      res.status(201).json(newStudent);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to create student' });
    }
  }
};