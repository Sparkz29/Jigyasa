# Overview

Smart Study Buddy is a full-stack interactive learning application that allows students to upload educational materials (PDFs) and interact with an AI-powered chat interface for learning, quizzing, and getting study assistance. The application uses advanced features like document processing, vector search, and AI-powered quiz generation to create a comprehensive learning experience.

# User Preferences

Preferred communication style: Simple, everyday language.

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
The application uses a hybrid storage approach:

- **Database**: PostgreSQL configured via Drizzle ORM with schema-first approach
- **In-Memory Storage**: Fallback MemStorage class for development/testing
- **Vector Store**: Custom in-memory vector storage for document embeddings
- **File Storage**: Temporary in-memory file processing (no persistent file storage)

The storage layer supports documents, chat messages, and quiz data with proper relationships and indexing.

## AI Integration Architecture
The application integrates with OpenAI's services for AI capabilities:

- **LLM**: OpenAI GPT-4o for chat responses and content generation
- **Embeddings**: OpenAI text-embedding-3-small for document vectorization
- **RAG Pipeline**: Custom retrieval-augmented generation using vector similarity search
- **Context Management**: Conversation history tracking and context injection

The AI service handles multiple interaction types including general chat, quiz generation, hints, and answer explanations.

## Document Processing Pipeline
The application implements a sophisticated document processing workflow:

1. **Upload Validation**: File type and size validation (PDF only, 10MB limit)
2. **Text Extraction**: PDF parsing using pdf-parse library
3. **Text Chunking**: Intelligent text splitting with overlap for context preservation
4. **Vectorization**: Embedding generation for each text chunk
5. **Storage**: Persistent storage of chunks with metadata and embeddings

## External Dependencies

- **OpenAI API**: For LLM chat completions and text embeddings
- **Neon Database**: PostgreSQL hosting service (configured but can fall back to other providers)
- **PDF Processing**: pdf-parse library for extracting text from PDF documents
- **Radix UI**: Comprehensive set of accessible UI components
- **TanStack Query**: Powerful data synchronization library for React
- **Drizzle ORM**: Type-safe SQL toolkit and ORM
- **Vite**: Next-generation frontend build tool
- **Tailwind CSS**: Utility-first CSS framework

The application is designed to be flexible with database providers and can easily switch between different PostgreSQL services or local databases through environment configuration.