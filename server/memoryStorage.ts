import { randomUUID } from 'crypto';

// Simple types without database dependencies
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  gradeLevel?: number;
  createdAt: Date;
  updatedAt: Date;
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
  createdAt: Date;
  updatedAt: Date;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatSession {
  id: string;
  studentId: string;
  classroomId: string;
  title?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  content: string;
  role: string;
  citations?: string;
  createdAt: Date;
}

export interface ClassroomEnrollment {
  id: string;
  studentId: string;
  classroomId: string;
  enrolledAt: Date;
  isActive: boolean;
}

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: Partial<User> & { email: string; firstName: string; lastName: string; role: string }): Promise<User>;
  
  // Classroom operations
  createClassroom(classroom: { name: string; description?: string; gradeLevel: number; subject?: string; teacherId: string }): Promise<Classroom>;
  getClassroom(id: string): Promise<Classroom | undefined>;
  getClassroomsByTeacher(teacherId: string): Promise<Classroom[]>;
  getClassroomsByStudent(studentId: string): Promise<Classroom[]>;
  generateInviteCode(classroomId: string): Promise<string>;
  joinClassroomByCode(studentId: string, inviteCode: string): Promise<boolean>;
  
  // Document operations
  createDocument(document: { name: string; filename: string; size: number; mimeType: string; classroomId: string; uploadedBy: string }): Promise<Document>;
  getDocumentsByClassroom(classroomId: string): Promise<Document[]>;
  deleteDocument(id: string): Promise<boolean>;
  
  // Chat operations
  createChatSession(studentId: string, classroomId: string, title?: string): Promise<ChatSession>;
  getChatSession(id: string): Promise<ChatSession | undefined>;
  getChatSessionsByStudent(studentId: string, classroomId: string): Promise<ChatSession[]>;
  createChatMessage(message: { sessionId: string; content: string; role: string; citations?: string }): Promise<ChatMessage>;
  getChatMessages(sessionId: string): Promise<ChatMessage[]>;
}

export class MemoryStorage implements IStorage {
  private users = new Map<string, User>();
  private classrooms = new Map<string, Classroom>();
  private documents = new Map<string, Document>();
  private chatSessions = new Map<string, ChatSession>();
  private chatMessages = new Map<string, ChatMessage>();
  private enrollments = new Map<string, ClassroomEnrollment>();

  constructor() {
    // Initialize with some sample users
    this.initializeData();
  }

  private initializeData() {
    // Create sample students (matching frontend hardcoded IDs)
    const student1: User = {
      id: "0914b99d-8b87-4062-be90-caf812cf2aab",
      email: "alex.johnson@student.edu",
      firstName: "Alex",
      lastName: "Johnson",
      role: "student",
      gradeLevel: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const student2: User = {
      id: "a7aa4231-0caa-45ef-a949-df02d4933b67",
      email: "emma.davis@student.edu",
      firstName: "Emma",
      lastName: "Davis",
      role: "student",
      gradeLevel: 8,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Create sample teachers (matching frontend hardcoded IDs)
    const teacher1: User = {
      id: "7a6f6452-9812-4536-a269-7b2b66cda2e7",
      email: "sarah.miller@school.edu",
      firstName: "Sarah",
      lastName: "Miller",
      role: "teacher",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const teacher2: User = {
      id: "ca382934-f328-491d-af87-35fda0e3d35d",
      email: "john.wilson@school.edu",
      firstName: "John",
      lastName: "Wilson",
      role: "teacher",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Store users
    this.users.set(student1.id, student1);
    this.users.set(student2.id, student2);
    this.users.set(teacher1.id, teacher1);
    this.users.set(teacher2.id, teacher2);

    // Create sample classrooms
    const classroom1: Classroom = {
      id: randomUUID(),
      name: "Grade 5 Science",
      description: "Introduction to biology and physics",
      gradeLevel: 5,
      subject: "Science",
      teacherId: teacher1.id,
      inviteCode: "SC501A",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const classroom2: Classroom = {
      id: randomUUID(),
      name: "Grade 8 Mathematics",
      description: "Algebra and geometry fundamentals",
      gradeLevel: 8,
      subject: "Mathematics",
      teacherId: teacher2.id,
      inviteCode: "MATH8B",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Store classrooms
    this.classrooms.set(classroom1.id, classroom1);
    this.classrooms.set(classroom2.id, classroom2);

    // Create enrollments
    const enrollment1: ClassroomEnrollment = {
      id: randomUUID(),
      studentId: student1.id,
      classroomId: classroom1.id,
      enrolledAt: new Date(),
      isActive: true,
    };

    const enrollment2: ClassroomEnrollment = {
      id: randomUUID(),
      studentId: student2.id,
      classroomId: classroom2.id,
      enrolledAt: new Date(),
      isActive: true,
    };

    this.enrollments.set(enrollment1.id, enrollment1);
    this.enrollments.set(enrollment2.id, enrollment2);

    console.log('Memory storage initialized with users:');
    console.log(`Student: ${student1.firstName} ${student1.lastName} (${student1.id})`);
    console.log(`Student: ${student2.firstName} ${student2.lastName} (${student2.id})`);
    console.log(`Teacher: ${teacher1.firstName} ${teacher1.lastName} (${teacher1.id})`);
    console.log(`Teacher: ${teacher2.firstName} ${teacher2.lastName} (${teacher2.id})`);
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: Partial<User> & { email: string; firstName: string; lastName: string; role: string }): Promise<User> {
    // Find existing user by email
    const existingUser = Array.from(this.users.values()).find(u => u.email === userData.email);
    
    if (existingUser) {
      // Update existing user
      const updatedUser = {
        ...existingUser,
        ...userData,
        updatedAt: new Date(),
      };
      this.users.set(existingUser.id, updatedUser);
      return updatedUser;
    } else {
      // Create new user
      const newUser: User = {
        id: userData.id || randomUUID(),
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        gradeLevel: userData.gradeLevel,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.users.set(newUser.id, newUser);
      return newUser;
    }
  }

  // Classroom operations
  async createClassroom(classroomData: { name: string; description?: string; gradeLevel: number; subject?: string; teacherId: string }): Promise<Classroom> {
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const classroom: Classroom = {
      id: randomUUID(),
      ...classroomData,
      inviteCode,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.classrooms.set(classroom.id, classroom);
    return classroom;
  }

  async getClassroom(id: string): Promise<Classroom | undefined> {
    return this.classrooms.get(id);
  }

  async getClassroomsByTeacher(teacherId: string): Promise<Classroom[]> {
    return Array.from(this.classrooms.values()).filter(
      c => c.teacherId === teacherId && c.isActive
    );
  }

  async getClassroomsByStudent(studentId: string): Promise<Classroom[]> {
    const studentEnrollments = Array.from(this.enrollments.values())
      .filter(e => e.studentId === studentId && e.isActive);
    
    const classroomIds = studentEnrollments.map(e => e.classroomId);
    return Array.from(this.classrooms.values())
      .filter(c => classroomIds.includes(c.id) && c.isActive);
  }

  async generateInviteCode(classroomId: string): Promise<string> {
    const classroom = this.classrooms.get(classroomId);
    if (!classroom) throw new Error('Classroom not found');
    
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    classroom.inviteCode = newCode;
    classroom.updatedAt = new Date();
    return newCode;
  }

  async joinClassroomByCode(studentId: string, inviteCode: string): Promise<boolean> {
    const classroom = Array.from(this.classrooms.values())
      .find(c => c.inviteCode === inviteCode && c.isActive);
    
    if (!classroom) return false;

    // Check if already enrolled
    const existingEnrollment = Array.from(this.enrollments.values())
      .find(e => e.studentId === studentId && e.classroomId === classroom.id && e.isActive);
    
    if (existingEnrollment) return true;

    // Create new enrollment
    const enrollment: ClassroomEnrollment = {
      id: randomUUID(),
      studentId,
      classroomId: classroom.id,
      enrolledAt: new Date(),
      isActive: true,
    };
    this.enrollments.set(enrollment.id, enrollment);
    return true;
  }

  // Document operations
  async createDocument(documentData: { name: string; filename: string; size: number; mimeType: string; classroomId: string; uploadedBy: string }): Promise<Document> {
    const document: Document = {
      id: randomUUID(),
      ...documentData,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.documents.set(document.id, document);
    return document;
  }

  async getDocumentsByClassroom(classroomId: string): Promise<Document[]> {
    return Array.from(this.documents.values())
      .filter(d => d.classroomId === classroomId && d.isActive)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async deleteDocument(id: string): Promise<boolean> {
    const document = this.documents.get(id);
    if (!document) return false;
    
    document.isActive = false;
    document.updatedAt = new Date();
    return true;
  }

  // Chat operations
  async createChatSession(studentId: string, classroomId: string, title?: string): Promise<ChatSession> {
    const session: ChatSession = {
      id: randomUUID(),
      studentId,
      classroomId,
      title,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.chatSessions.set(session.id, session);
    return session;
  }

  async getChatSession(id: string): Promise<ChatSession | undefined> {
    return this.chatSessions.get(id);
  }

  async getChatSessionsByStudent(studentId: string, classroomId: string): Promise<ChatSession[]> {
    return Array.from(this.chatSessions.values())
      .filter(s => s.studentId === studentId && s.classroomId === classroomId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async createChatMessage(messageData: { sessionId: string; content: string; role: string; citations?: string }): Promise<ChatMessage> {
    const message: ChatMessage = {
      id: randomUUID(),
      ...messageData,
      createdAt: new Date(),
    };
    this.chatMessages.set(message.id, message);
    
    // Update session timestamp
    const session = this.chatSessions.get(messageData.sessionId);
    if (session) {
      session.updatedAt = new Date();
    }
    
    return message;
  }

  async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(m => m.sessionId === sessionId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
}