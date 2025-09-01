import { sql } from 'drizzle-orm';
import { 
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  primaryKey,
  uuid
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for authentication)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for authentication)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("student"), // student, teacher, admin
  gradeLevel: integer("grade_level"), // For students (K-12)
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;

// Classroom schema
export const classrooms = pgTable("classrooms", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  gradeLevel: integer("grade_level").notNull(),
  subject: varchar("subject"),
  teacherId: varchar("teacher_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  inviteCode: varchar("invite_code").unique(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const classroomRelations = relations(classrooms, ({ one, many }) => ({
  teacher: one(users, {
    fields: [classrooms.teacherId],
    references: [users.id],
  }),
  enrollments: many(classroomEnrollments),
  documents: many(documents),
}));

// Student enrollment in classrooms
export const classroomEnrollments = pgTable("classroom_enrollments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  classroomId: uuid("classroom_id").notNull().references(() => classrooms.id, { onDelete: 'cascade' }),
  enrolledAt: timestamp("enrolled_at").defaultNow(),
  isActive: boolean("is_active").default(true),
}, (table) => [
  index("idx_student_classroom").on(table.studentId, table.classroomId),
]);

export const enrollmentRelations = relations(classroomEnrollments, ({ one }) => ({
  student: one(users, {
    fields: [classroomEnrollments.studentId],
    references: [users.id],
  }),
  classroom: one(classrooms, {
    fields: [classroomEnrollments.classroomId],
    references: [classrooms.id],
  }),
}));

// Documents (curriculum materials)
export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  filename: varchar("filename").notNull(),
  size: integer("size").notNull(),
  mimeType: varchar("mime_type").notNull(),
  classroomId: uuid("classroom_id").notNull().references(() => classrooms.id, { onDelete: 'cascade' }),
  uploadedBy: varchar("uploaded_by").notNull().references(() => users.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const documentRelations = relations(documents, ({ one, many }) => ({
  classroom: one(classrooms, {
    fields: [documents.classroomId],
    references: [classrooms.id],
  }),
  uploader: one(users, {
    fields: [documents.uploadedBy],
    references: [users.id],
  }),
  chunks: many(documentChunks),
}));

// Document chunks for RAG
export const documentChunks = pgTable("document_chunks", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: uuid("document_id").notNull().references(() => documents.id, { onDelete: 'cascade' }),
  content: text("content").notNull(),
  chunkIndex: integer("chunk_index").notNull(),
  embedding: jsonb("embedding"), // Store as JSONB array
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_document_chunks").on(table.documentId),
]);

export const chunkRelations = relations(documentChunks, ({ one }) => ({
  document: one(documents, {
    fields: [documentChunks.documentId],
    references: [documents.id],
  }),
}));

// Chat sessions
export const chatSessions = pgTable("chat_sessions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  classroomId: uuid("classroom_id").notNull().references(() => classrooms.id, { onDelete: 'cascade' }),
  title: varchar("title"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const chatSessionRelations = relations(chatSessions, ({ one, many }) => ({
  student: one(users, {
    fields: [chatSessions.studentId],
    references: [users.id],
  }),
  classroom: one(classrooms, {
    fields: [chatSessions.classroomId],
    references: [classrooms.id],
  }),
  messages: many(chatMessages),
}));

// Chat messages
export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: uuid("session_id").notNull().references(() => chatSessions.id, { onDelete: 'cascade' }),
  content: text("content").notNull(),
  role: varchar("role").notNull(), // user, assistant
  citations: jsonb("citations"), // Source references
  createdAt: timestamp("created_at").defaultNow(),
});

export const messageRelations = relations(chatMessages, ({ one }) => ({
  session: one(chatSessions, {
    fields: [chatMessages.sessionId],
    references: [chatSessions.id],
  }),
}));

// Create insert schemas
export const insertClassroomSchema = createInsertSchema(classrooms).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDocumentSchema = createInsertSchema(documents).omit({ id: true, createdAt: true, updatedAt: true });
export const insertChatSessionSchema = createInsertSchema(chatSessions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true, createdAt: true });

// Type exports
export type Classroom = typeof classrooms.$inferSelect;
export type InsertClassroom = z.infer<typeof insertClassroomSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type ChatSession = typeof chatSessions.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

// API request/response schemas
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
  role: z.enum(['student', 'teacher']),
  gradeLevel: z.number().min(0).max(12).optional(),
});

export type CreateClassroomRequest = z.infer<typeof createClassroomRequestSchema>;
export type JoinClassroomRequest = z.infer<typeof joinClassroomRequestSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type CreateUserRequest = z.infer<typeof createUserRequestSchema>;

// Grade level utilities
export const GRADE_LEVELS = {
  K: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10, 11: 11, 12: 12
} as const;

export const USER_ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin'
} as const;
