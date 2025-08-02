import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { pdfProcessor } from "./services/pdf-processor";
import { vectorStore } from "./services/vector-store";
import { geminiService } from "./services/gemini-service";
import { chatRequestSchema, quizRequestSchema, hintRequestSchema, answerRequestSchema } from "@shared/schema";
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
  // Upload PDF document
  app.post("/api/upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Extract text from PDF
      const text = await pdfProcessor.extractText(req.file.buffer);
      
      // Chunk the text
      const chunks = pdfProcessor.chunkText(text);
      
      // Create document record
      const document = await storage.createDocument({
        name: req.file.originalname,
        size: req.file.size,
        chunks: chunks.map((chunk, index) => ({
          id: `chunk_${index}`,
          content: chunk.content,
          embedding: [], // Will be populated by vector store
          metadata: chunk.metadata,
        })),
      });

      // Add to vector store
      await vectorStore.addDocuments(document.id, chunks);

      res.json({
        message: "Document uploaded successfully",
        documentId: document.id,
        document: {
          id: document.id,
          name: document.name,
          size: document.size,
          uploadedAt: document.uploadedAt,
        },
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to upload document" });
    }
  });

  // Chat with document
  app.post("/api/chat", async (req, res) => {
    try {
      const { query, documentId, conversationHistory } = chatRequestSchema.parse(req.body);

      // Get relevant chunks from vector store
      const relevantChunks = await vectorStore.similaritySearch(documentId, query);
      const context = relevantChunks.map(chunk => chunk.content);

      // Generate response using Gemini
      const response = await geminiService.chat(query, context, conversationHistory);

      // Store chat messages
      await storage.createChatMessage({
        content: query,
        role: 'user',
        documentId,
      });

      await storage.createChatMessage({
        content: response,
        role: 'assistant',
        documentId,
      });

      res.json({
        response,
        context: context.slice(0, 2), // Return limited context for frontend
      });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to process chat request" });
    }
  });

  // Generate quiz
  app.post("/api/quiz", async (req, res) => {
    try {
      const { documentId, topic } = quizRequestSchema.parse(req.body);

      // Get relevant chunks
      const query = topic || "general knowledge";
      const relevantChunks = await vectorStore.similaritySearch(documentId, query, 5);
      const context = relevantChunks.map(chunk => chunk.content);

      // Generate quiz questions
      const questions = await geminiService.generateQuiz(context, topic);

      // Store quiz
      const quiz = await storage.createQuiz({
        documentId,
        topic: topic || "General Quiz",
        questions,
      });

      res.json({
        quiz: {
          id: quiz.id,
          topic: quiz.topic,
          questions: quiz.questions,
        },
      });
    } catch (error) {
      console.error("Quiz generation error:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to generate quiz" });
    }
  });

  // Get hint
  app.post("/api/hint", async (req, res) => {
    try {
      const { question, documentId } = hintRequestSchema.parse(req.body);

      // Get relevant context
      const relevantChunks = await vectorStore.similaritySearch(documentId, question);
      const context = relevantChunks.map(chunk => chunk.content);

      // Generate hint
      const hint = await geminiService.generateHint(question, context);

      res.json({ hint });
    } catch (error) {
      console.error("Hint generation error:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to generate hint" });
    }
  });

  // Get answer
  app.post("/api/answer", async (req, res) => {
    try {
      const { question, documentId } = answerRequestSchema.parse(req.body);

      // Get relevant context
      const relevantChunks = await vectorStore.similaritySearch(documentId, question);
      const context = relevantChunks.map(chunk => chunk.content);

      // Generate answer
      const answer = await geminiService.generateAnswer(question, context);

      res.json({ answer });
    } catch (error) {
      console.error("Answer generation error:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to generate answer" });
    }
  });

  // Get chat history
  app.get("/api/chat/:documentId", async (req, res) => {
    try {
      const { documentId } = req.params;
      const messages = await storage.getChatMessages(documentId);
      res.json({ messages });
    } catch (error) {
      console.error("Get chat history error:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to get chat history" });
    }
  });

  // Get document info
  app.get("/api/document/:documentId", async (req, res) => {
    try {
      const { documentId } = req.params;
      const document = await storage.getDocument(documentId);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      res.json({
        document: {
          id: document.id,
          name: document.name,
          size: document.size,
          uploadedAt: document.uploadedAt,
        },
      });
    } catch (error) {
      console.error("Get document error:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to get document" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
