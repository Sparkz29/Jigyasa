import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { pdfProcessor } from "./services/pdf-processor";
import { vectorStore } from "./services/vector-store";
import { geminiService } from "./services/gemini-service";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  chatRequestSchema, 
  createClassroomRequestSchema, 
  joinClassroomRequestSchema,
  uploadDocumentRequestSchema,
  USER_ROLES
} from "@shared/schema";
import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Helper to check if user is teacher
  const isTeacher: any = async (req: any, res: any, next: any) => {
    const userId = req.user.claims.sub;
    const user = await storage.getUser(userId);
    if (!user || user.role !== USER_ROLES.TEACHER) {
      return res.status(403).json({ message: "Teacher access required" });
    }
    req.currentUser = user;
    next();
  };
  // Create classroom (Teachers only)
  app.post("/api/classrooms", isAuthenticated, isTeacher, async (req: any, res) => {
    try {
      const { name, description, gradeLevel, subject } = createClassroomRequestSchema.parse(req.body);
      const teacherId = req.user.claims.sub;

      const classroom = await storage.createClassroom({
        name,
        description,
        gradeLevel,
        subject,
        teacherId,
      });

      res.json({
        message: "Classroom created successfully",
        classroom,
      });
    } catch (error) {
      console.error("Create classroom error:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to create classroom" });
    }
  });

  // Get user's classrooms
  app.get("/api/classrooms", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let classrooms;
      if (user.role === USER_ROLES.TEACHER) {
        classrooms = await storage.getClassroomsByTeacher(userId);
      } else {
        classrooms = await storage.getClassroomsByStudent(userId);
      }

      res.json({ classrooms });
    } catch (error) {
      console.error("Get classrooms error:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to get classrooms" });
    }
  });

  // Join classroom by invite code (Students only)
  app.post("/api/classrooms/join", isAuthenticated, async (req: any, res) => {
    try {
      const { inviteCode } = joinClassroomRequestSchema.parse(req.body);
      const studentId = req.user.claims.sub;

      const success = await storage.joinClassroomByCode(studentId, inviteCode);
      
      if (success) {
        res.json({ message: "Successfully joined classroom" });
      } else {
        res.status(404).json({ message: "Invalid invite code" });
      }
    } catch (error) {
      console.error("Join classroom error:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to join classroom" });
    }
  });

  // Upload document to classroom (Teachers only)
  app.post("/api/classrooms/:classroomId/documents", isAuthenticated, isTeacher, upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { classroomId } = req.params;
      const teacherId = req.user.claims.sub;

      // Verify teacher owns this classroom
      const classroom = await storage.getClassroom(classroomId);
      if (!classroom || classroom.teacherId !== teacherId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Create document record
      const document = await storage.createDocument({
        name: req.file.originalname,
        filename: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        classroomId,
        uploadedBy: teacherId,
      });

      // Process PDF and create embeddings for classroom content
      const text = await pdfProcessor.extractText(req.file.buffer);
      const chunks = pdfProcessor.chunkText(text);
      
      // Add to vector store with classroom context
      await vectorStore.addDocuments(document.id, chunks);

      res.json({
        message: "Document uploaded successfully",
        document,
      });
    } catch (error) {
      console.error("Upload document error:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to upload document" });
    }
  });

  // Get classroom documents
  app.get("/api/classrooms/:classroomId/documents", isAuthenticated, async (req: any, res) => {
    try {
      const { classroomId } = req.params;
      const documents = await storage.getDocumentsByClassroom(classroomId);
      res.json({ documents });
    } catch (error) {
      console.error("Get documents error:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to get documents" });
    }
  });

  // Chat with AI tutor
  app.post("/api/chat", isAuthenticated, async (req: any, res) => {
    try {
      const { sessionId, classroomId, message } = chatRequestSchema.parse(req.body);
      const studentId = req.user.claims.sub;

      // Get or create chat session
      let session;
      if (sessionId) {
        session = await storage.getChatSession(sessionId);
        if (!session || session.studentId !== studentId) {
          return res.status(403).json({ message: "Access denied" });
        }
      } else {
        session = await storage.createChatSession(studentId, classroomId);
      }

      // Get classroom documents for context
      const documents = await storage.getDocumentsByClassroom(classroomId);
      const allChunks = [];
      
      for (const doc of documents) {
        const chunks = await vectorStore.similaritySearch(doc.id, message);
        allChunks.push(...chunks);
      }

      const context = allChunks.map(chunk => chunk.content);

      // Get user info for grade-adaptive responses
      const user = await storage.getUser(studentId);
      const gradeLevel = user?.gradeLevel || 8;

      // Create grade-adaptive prompt
      const gradePrompt = `You are JIGYASA.AI, an AI tutor for grade ${gradeLevel} students. Use the Socratic method - ask leading questions to guide learning rather than giving direct answers. Adapt your language complexity to grade ${gradeLevel} level. Reference the provided curriculum materials and always cite your sources.`;

      // Generate response using Gemini with educational context
      const response = await geminiService.chat(
        `${gradePrompt}\n\nStudent question: ${message}`, 
        context, 
        []
      );

      // Store messages
      await storage.createChatMessage({
        sessionId: session.id,
        content: message,
        role: 'user',
      });

      await storage.createChatMessage({
        sessionId: session.id,
        content: response,
        role: 'assistant',
        citations: JSON.stringify(context.slice(0, 2)), // Store source references
      });

      res.json({
        sessionId: session.id,
        response,
        sources: context.slice(0, 2),
      });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to process chat request" });
    }
  });

  // Get chat sessions for a classroom
  app.get("/api/classrooms/:classroomId/sessions", isAuthenticated, async (req: any, res) => {
    try {
      const { classroomId } = req.params;
      const studentId = req.user.claims.sub;
      
      const sessions = await storage.getChatSessionsByStudent(studentId, classroomId);
      res.json({ sessions });
    } catch (error) {
      console.error("Get sessions error:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to get sessions" });
    }
  });

  // Get messages for a chat session
  app.get("/api/sessions/:sessionId/messages", isAuthenticated, async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      const studentId = req.user.claims.sub;
      
      // Verify session belongs to student
      const session = await storage.getChatSession(sessionId);
      if (!session || session.studentId !== studentId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const messages = await storage.getChatMessages(sessionId);
      res.json({ messages });
    } catch (error) {
      console.error("Get messages error:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to get messages" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
