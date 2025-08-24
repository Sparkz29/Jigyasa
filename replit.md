# Overview

JIGYASA.AI is a pilot-ready AI Tutor Platform with dual interfaces for teachers and students. The platform features grade-adaptive learning, Socratic questioning methodology, and a safe "walled garden" knowledge base controlled by teachers. Teachers create virtual classrooms and manage curriculum materials, while students receive personalized AI tutoring based on approved content. Built with modern web technologies and powered by Google Gemini AI for cost-effective, scalable education solutions.

# User Preferences

Preferred communication style: Simple, everyday language.
Platform name: JIGYASA.AI with subtitle "Artificial Intelligence that builds Real Intelligence"
Design inspiration: SchoolAI.com for modern, safe learning environment aesthetics
Key focus areas: Teacher control, student safety, grade-adaptive responses, Socratic questioning

# System Architecture

## Frontend Architecture
The frontend is built with React and TypeScript, following a modern component-based architecture:

- **Framework**: React with TypeScript for type safety
- **Routing**: Wouter for lightweight client-side routing
- **UI Library**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **State Management**: TanStack Query for server state management
- **Build Tool**: Vite for fast development and optimized builds

The application uses a single-page layout with conditional rendering between file upload and chat interface states. The UI follows a clean, minimalist design with responsive breakpoints for mobile devices.

## Backend Architecture
The backend follows a Node.js/Express architecture with TypeScript:

- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints with structured error handling
- **File Processing**: Multer for file uploads with PDF validation
- **Document Processing**: PDF parsing and text chunking for RAG implementation

The server implements middleware for request logging, JSON parsing, and development-specific features like Vite integration for hot reloading.

## Data Storage Solutions
The application uses a comprehensive PostgreSQL-based storage architecture:

- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Replit OAuth integration with session-based authentication
- **Multi-tenancy**: Role-based access control (Teachers, Students, Admin roles)
- **Classroom System**: Teachers create classrooms with unique invite codes for student enrollment
- **Document Management**: PDF upload and processing with classroom-scoped access controls
- **Chat Persistence**: Conversation sessions and message history per classroom
- **Vector Store**: Custom in-memory vector storage for document embeddings with classroom isolation

The storage layer implements proper foreign key relationships, cascading deletes, and indexing for optimal performance across the multi-user education platform.

## AI Integration Architecture
The application integrates with Google's Gemini API for educational AI capabilities:

- **LLM**: Gemini 2.5 Flash and Pro models for grade-adaptive chat responses
- **Embeddings**: Gemini text-embedding-004 for document vectorization
- **RAG Pipeline**: Custom retrieval-augmented generation using classroom-specific vector stores
- **Socratic Method**: AI prompts designed to ask guiding questions rather than provide direct answers
- **Grade Adaptation**: Dynamic language complexity adjustment based on student grade levels (K-12)
- **Safety Controls**: "Walled garden" approach using only teacher-approved curriculum materials
- **Free Tier**: Uses Google AI Studio's generous free tier (15 requests/minute)

The AI service implements educational best practices with conversation history tracking and source citation for all responses. Updated January 2025 for multi-user education platform with role-based access control.

## Document Processing Pipeline
The application implements a sophisticated document processing workflow:

1. **Upload Validation**: File type and size validation (PDF only, 10MB limit)
2. **Text Extraction**: PDF parsing using pdf-parse library
3. **Text Chunking**: Intelligent text splitting with overlap for context preservation
4. **Vectorization**: Embedding generation for each text chunk
5. **Storage**: Persistent storage of chunks with metadata and embeddings

## External Dependencies

- **Google Gemini API**: For LLM chat completions and text embeddings (free tier)
- **Neon Database**: PostgreSQL hosting service (configured but can fall back to other providers)
- **PDF Processing**: pdf-parse library for extracting text from PDF documents
- **Radix UI**: Comprehensive set of accessible UI components
- **TanStack Query**: Powerful data synchronization library for React
- **Drizzle ORM**: Type-safe SQL toolkit and ORM
- **Vite**: Next-generation frontend build tool
- **Tailwind CSS**: Utility-first CSS framework

The application is designed to be flexible with database providers and can easily switch between different PostgreSQL services or local databases through environment configuration.