import { 
  type User,
  type UpsertUser,
  type Classroom,
  type InsertClassroom,
  type Document,
  type InsertDocument,
  type ChatSession,
  type ChatMessage,
  type InsertChatMessage,
  users,
  classrooms,
  classroomEnrollments,
  documents,
  documentChunks,
  chatSessions,
  chatMessages,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Classroom operations
  createClassroom(classroom: InsertClassroom): Promise<Classroom>;
  getClassroom(id: string): Promise<Classroom | undefined>;
  getClassroomsByTeacher(teacherId: string): Promise<Classroom[]>;
  getClassroomsByStudent(studentId: string): Promise<Classroom[]>;
  generateInviteCode(classroomId: string): Promise<string>;
  joinClassroomByCode(studentId: string, inviteCode: string): Promise<boolean>;
  
  // Document operations
  createDocument(document: InsertDocument): Promise<Document>;
  getDocumentsByClassroom(classroomId: string): Promise<Document[]>;
  deleteDocument(id: string): Promise<boolean>;
  
  // Chat operations
  createChatSession(studentId: string, classroomId: string, title?: string): Promise<ChatSession>;
  getChatSession(id: string): Promise<ChatSession | undefined>;
  getChatSessionsByStudent(studentId: string, classroomId: string): Promise<ChatSession[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(sessionId: string): Promise<ChatMessage[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Classroom operations
  async createClassroom(classroomData: InsertClassroom): Promise<Classroom> {
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const [classroom] = await db
      .insert(classrooms)
      .values({ ...classroomData, inviteCode })
      .returning();
    return classroom;
  }

  async getClassroom(id: string): Promise<Classroom | undefined> {
    const [classroom] = await db.select().from(classrooms).where(eq(classrooms.id, id));
    return classroom;
  }

  async getClassroomsByTeacher(teacherId: string): Promise<Classroom[]> {
    return await db
      .select()
      .from(classrooms)
      .where(and(eq(classrooms.teacherId, teacherId), eq(classrooms.isActive, true)))
      .orderBy(desc(classrooms.createdAt));
  }

  async getClassroomsByStudent(studentId: string): Promise<Classroom[]> {
    return await db
      .select({ 
        id: classrooms.id,
        name: classrooms.name,
        description: classrooms.description,
        gradeLevel: classrooms.gradeLevel,
        subject: classrooms.subject,
        teacherId: classrooms.teacherId,
        inviteCode: classrooms.inviteCode,
        isActive: classrooms.isActive,
        createdAt: classrooms.createdAt,
        updatedAt: classrooms.updatedAt,
      })
      .from(classrooms)
      .innerJoin(classroomEnrollments, eq(classrooms.id, classroomEnrollments.classroomId))
      .where(
        and(
          eq(classroomEnrollments.studentId, studentId),
          eq(classroomEnrollments.isActive, true),
          eq(classrooms.isActive, true)
        )
      )
      .orderBy(desc(classrooms.createdAt));
  }

  async generateInviteCode(classroomId: string): Promise<string> {
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    await db
      .update(classrooms)
      .set({ inviteCode: newCode })
      .where(eq(classrooms.id, classroomId));
    return newCode;
  }

  async joinClassroomByCode(studentId: string, inviteCode: string): Promise<boolean> {
    const [classroom] = await db
      .select()
      .from(classrooms)
      .where(and(eq(classrooms.inviteCode, inviteCode), eq(classrooms.isActive, true)));
    
    if (!classroom) return false;

    // Check if already enrolled
    const [existing] = await db
      .select()
      .from(classroomEnrollments)
      .where(
        and(
          eq(classroomEnrollments.studentId, studentId),
          eq(classroomEnrollments.classroomId, classroom.id)
        )
      );

    if (existing) {
      // Reactivate if inactive
      if (!existing.isActive) {
        await db
          .update(classroomEnrollments)
          .set({ isActive: true })
          .where(eq(classroomEnrollments.id, existing.id));
      }
      return true;
    }

    // Create new enrollment
    await db
      .insert(classroomEnrollments)
      .values({
        studentId,
        classroomId: classroom.id,
      });

    return true;
  }

  // Document operations
  async createDocument(documentData: InsertDocument): Promise<Document> {
    const [document] = await db
      .insert(documents)
      .values(documentData)
      .returning();
    return document;
  }

  async getDocumentsByClassroom(classroomId: string): Promise<Document[]> {
    return await db
      .select()
      .from(documents)
      .where(and(eq(documents.classroomId, classroomId), eq(documents.isActive, true)))
      .orderBy(desc(documents.createdAt));
  }

  async deleteDocument(id: string): Promise<boolean> {
    const result = await db
      .update(documents)
      .set({ isActive: false })
      .where(eq(documents.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Chat operations
  async createChatSession(studentId: string, classroomId: string, title?: string): Promise<ChatSession> {
    const [session] = await db
      .insert(chatSessions)
      .values({ studentId, classroomId, title })
      .returning();
    return session;
  }

  async getChatSession(id: string): Promise<ChatSession | undefined> {
    const [session] = await db.select().from(chatSessions).where(eq(chatSessions.id, id));
    return session;
  }

  async getChatSessionsByStudent(studentId: string, classroomId: string): Promise<ChatSession[]> {
    return await db
      .select()
      .from(chatSessions)
      .where(
        and(
          eq(chatSessions.studentId, studentId),
          eq(chatSessions.classroomId, classroomId)
        )
      )
      .orderBy(desc(chatSessions.updatedAt));
  }

  async createChatMessage(messageData: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db
      .insert(chatMessages)
      .values(messageData)
      .returning();
    return message;
  }

  async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(chatMessages.createdAt);
  }
}

export const storage = new DatabaseStorage();
