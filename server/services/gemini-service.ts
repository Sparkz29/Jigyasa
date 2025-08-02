import { GoogleGenAI } from "@google/genai";
import { type QuizQuestion } from '@shared/schema';

// DON'T DELETE THIS COMMENT
// Follow these instructions when using this blueprint:
// - Note that the newest Gemini model series is "gemini-2.5-flash" or gemini-2.5-pro"
//   - do not change this unless explicitly requested by the user

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export class GeminiService {
  async chat(query: string, context: string[], conversationHistory: Array<{ role: string; content: string }> = []): Promise<string> {
    const contextString = context.join('\n\n');
    
    try {
      // Construct the conversation prompt
      let conversationContext = '';
      if (conversationHistory.length > 0) {
        conversationContext = conversationHistory
          .map(msg => `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`)
          .join('\n') + '\n';
      }

      const prompt = `You are a helpful AI study assistant. Use the provided context from the uploaded document to answer questions accurately and helpfully. If the context doesn't contain relevant information, say so and provide general guidance.

Context from the document:
${contextString}

${conversationContext}Human: ${query}
Assistant:`;

      const response = await genai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      return response.text || "I'm sorry, I couldn't generate a response.";
    } catch (error) {
      throw new Error(`Gemini API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateQuiz(context: string[], topic?: string): Promise<QuizQuestion[]> {
    const contextString = context.join('\n\n');
    const topicPrompt = topic ? ` on the topic of "${topic}"` : '';
    
    try {
      const prompt = `Create 5 multiple-choice questions${topicPrompt} based on the provided context. Each question should have 4 options with only one correct answer. Return the response in JSON format with this structure:

{
  "questions": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Explanation of the correct answer"
    }
  ]
}

Context: ${contextString}`;

      const response = await genai.models.generateContent({
        model: "gemini-2.5-pro",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    question: { type: "string" },
                    options: { 
                      type: "array",
                      items: { type: "string" }
                    },
                    correctAnswer: { type: "number" },
                    explanation: { type: "string" }
                  },
                  required: ["question", "options", "correctAnswer", "explanation"]
                }
              }
            },
            required: ["questions"]
          }
        },
        contents: prompt,
      });

      const result = JSON.parse(response.text || '{"questions": []}');
      return result.questions || [];
    } catch (error) {
      throw new Error(`Failed to generate quiz: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateHint(question: string, context: string[]): Promise<string> {
    const contextString = context.join('\n\n');
    
    try {
      const prompt = `Provide a helpful hint for the given question based on the context. The hint should guide the user towards the answer without giving it away completely. Be concise and encouraging.

Context:
${contextString}

Question: ${question}

Please provide a hint that will help me think about this question.`;

      const response = await genai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      return response.text || "I'm sorry, I couldn't generate a hint.";
    } catch (error) {
      throw new Error(`Failed to generate hint: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateAnswer(question: string, context: string[]): Promise<string> {
    const contextString = context.join('\n\n');
    
    try {
      const prompt = `Provide a comprehensive and detailed answer to the given question based on the context. Include explanations, examples, and any relevant details that would help someone understand the topic thoroughly.

Context:
${contextString}

Question: ${question}

Please provide a complete and detailed answer.`;

      const response = await genai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      return response.text || "I'm sorry, I couldn't generate an answer.";
    } catch (error) {
      throw new Error(`Failed to generate answer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await genai.models.embedContent({
        model: "text-embedding-004",
        contents: [{
          parts: [{ text }]
        }],
      });

      return response.embeddings?.[0]?.values || [];
    } catch (error) {
      throw new Error(`Failed to generate embedding: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const geminiService = new GeminiService();