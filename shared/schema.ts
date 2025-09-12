import { z } from "zod";

// User roles constants
export const USER_ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin'
} as const;

// Grade level utilities
export const GRADE_LEVELS = {
  K: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10, 11: 11, 12: 12
} as const;

// Type definitions for the application
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  role: string;
  gradeLevel?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Classroom {
  id: string;
  name: string;
  description?: string;
  gradeLevel: number;
  subject?: string;
  teacherId: string;
  inviteCode: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Document {
  id: string;
  name: string;
  filename: string;
  size: number;
  mimeType: string;
  classroomId: string;
  uploadedBy: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ChatSession {
  id: string;
  studentId: string;
  classroomId: string;
  title?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  content: string;
  role: string; // 'user' | 'assistant'
  citations?: string;
  createdAt?: Date;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

// API request/response validation schemas
export const createClassroomRequestSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  gradeLevel: z.number().min(1).max(12),
  subject: z.string().optional(),
});

export const joinClassroomRequestSchema = z.object({
  inviteCode: z.string().min(6).max(10),
});

export const uploadDocumentRequestSchema = z.object({
  classroomId: z.string().uuid(),
});

export const chatRequestSchema = z.object({
  sessionId: z.string().uuid().optional(),
  classroomId: z.string().uuid(),
  message: z.string().min(1),
});

export const createUserRequestSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum([USER_ROLES.STUDENT, USER_ROLES.TEACHER]),
  gradeLevel: z.number().min(0).max(12).optional(),
});

// Type exports for API requests
export type CreateClassroomRequest = z.infer<typeof createClassroomRequestSchema>;
export type JoinClassroomRequest = z.infer<typeof joinClassroomRequestSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type CreateUserRequest = z.infer<typeof createUserRequestSchema>;

// Insert/Update type definitions for backend operations
export type UpsertUser = Omit<User, 'createdAt' | 'updatedAt'> & {
  createdAt?: Date;
  updatedAt?: Date;
};

export type InsertClassroom = Omit<Classroom, 'id' | 'createdAt' | 'updatedAt'>;
export type InsertDocument = Omit<Document, 'id' | 'createdAt' | 'updatedAt'>;
export type InsertChatMessage = Omit<ChatMessage, 'id' | 'createdAt'>;