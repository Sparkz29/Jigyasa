import { z } from "zod";

// Document schema
export const documentSchema = z.object({
  id: z.string(),
  name: z.string(),
  size: z.number(),
  uploadedAt: z.date(),
  chunks: z.array(z.object({
    id: z.string(),
    content: z.string(),
    embedding: z.array(z.number()),
    metadata: z.object({
      page: z.number().optional(),
      chunkIndex: z.number(),
    }),
  })),
});

export const insertDocumentSchema = documentSchema.omit({ id: true, uploadedAt: true });

export type Document = z.infer<typeof documentSchema>;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

// Chat schemas
export const chatMessageSchema = z.object({
  id: z.string(),
  content: z.string(),
  role: z.enum(['user', 'assistant']),
  timestamp: z.date(),
  documentId: z.string(),
});

export const insertChatMessageSchema = chatMessageSchema.omit({ id: true, timestamp: true });

export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

// Quiz schemas
export const quizQuestionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()),
  correctAnswer: z.number(),
  explanation: z.string(),
});

export const quizSchema = z.object({
  id: z.string(),
  documentId: z.string(),
  topic: z.string(),
  questions: z.array(quizQuestionSchema),
  createdAt: z.date(),
});

export const insertQuizSchema = quizSchema.omit({ id: true, createdAt: true });

export type Quiz = z.infer<typeof quizSchema>;
export type QuizQuestion = z.infer<typeof quizQuestionSchema>;
export type InsertQuiz = z.infer<typeof insertQuizSchema>;

// API request/response schemas
export const uploadDocumentRequestSchema = z.object({
  file: z.any(), // File object
});

export const chatRequestSchema = z.object({
  query: z.string(),
  documentId: z.string(),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional(),
});

export const quizRequestSchema = z.object({
  documentId: z.string(),
  topic: z.string().optional(),
});

export const hintRequestSchema = z.object({
  question: z.string(),
  documentId: z.string(),
});

export const answerRequestSchema = z.object({
  question: z.string(),
  documentId: z.string(),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type QuizRequest = z.infer<typeof quizRequestSchema>;
export type HintRequest = z.infer<typeof hintRequestSchema>;
export type AnswerRequest = z.infer<typeof answerRequestSchema>;
