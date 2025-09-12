import { Express, RequestHandler } from "express";
import session from "express-session";
import { MemoryStorage } from "./memoryStorage";

// Create global memory storage instance
export const storage = new MemoryStorage();

// User roles constants
export const USER_ROLES = {
  STUDENT: "student",
  TEACHER: "teacher",
  ADMIN: "admin"
} as const;

declare module "express-session" {
  interface SessionData {
    user?: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      gradeLevel?: number;
    };
  }
}

export function getSession() {
  return session({
    secret: process.env.SESSION_SECRET || "jigyasa-ai-secret-key-development",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  // Simple login route for students
  app.post("/api/login/student", async (req, res) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.role !== USER_ROLES.STUDENT) {
        return res.status(403).json({ message: "Invalid user role for student login" });
      }

      // Store user in session
      (req.session as any).user = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        gradeLevel: user.gradeLevel,
      };

      res.json({ 
        message: "Login successful", 
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          gradeLevel: user.gradeLevel,
        }
      });
    } catch (error) {
      console.error("Student login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Simple login route for teachers
  app.post("/api/login/teacher", async (req, res) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.role !== USER_ROLES.TEACHER) {
        return res.status(403).json({ message: "Invalid user role for teacher login" });
      }

      // Store user in session
      (req.session as any).user = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      };

      res.json({ 
        message: "Login successful", 
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        }
      });
    } catch (error) {
      console.error("Teacher login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Logout route
  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  // Get current user route
  app.get("/api/auth/user", (req: any, res) => {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    res.json(req.session.user);
  });
}

// Middleware to check if user is authenticated
export const isAuthenticated: RequestHandler = (req: any, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  req.user = req.session.user;
  next();
};

// Middleware to check if user is a teacher
export const isTeacher: RequestHandler = (req: any, res, next) => {
  if (!req.user || req.user.role !== USER_ROLES.TEACHER) {
    return res.status(403).json({ message: "Teacher access required" });
  }
  next();
};

// Middleware to check if user is a student
export const isStudent: RequestHandler = (req: any, res, next) => {
  if (!req.user || req.user.role !== USER_ROLES.STUDENT) {
    return res.status(403).json({ message: "Student access required" });
  }
  next();
};