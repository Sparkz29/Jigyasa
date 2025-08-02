import OpenAI from 'openai';
import { type QuizQuestion } from '@shared/schema';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "your-api-key-here",
});

export class OpenAIService {
  async chat(query: string, context: string[], conversationHistory: Array<{ role: string; content: string }> = []): Promise<string> {
    const contextString = context.join('\n\n');
    
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `You are a helpful AI study assistant. Use the provided context from the uploaded document to answer questions accurately and helpfully. If the context doesn't contain relevant information, say so and provide general guidance.

Context from the document:
${contextString}`
      },
      ...conversationHistory.map(msg => ({ role: msg.role as 'user' | 'assistant', content: msg.content })),
      {
        role: "user",
        content: query
      }
    ];

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages,
        max_tokens: 500,
        temperature: 0.7,
      });

      return response.choices[0].message.content || "I'm sorry, I couldn't generate a response.";
    } catch (error) {
      throw new Error(`OpenAI API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateQuiz(context: string[], topic?: string): Promise<QuizQuestion[]> {
    const contextString = context.join('\n\n');
    const topicPrompt = topic ? ` on the topic of "${topic}"` : '';
    
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Create 5 multiple-choice questions${topicPrompt} based on the provided context. Each question should have 4 options with only one correct answer. Return the response in JSON format with this structure:
{
  "questions": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Explanation of the correct answer"
    }
  ]
}`
          },
          {
            role: "user",
            content: `Context: ${contextString}`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.8,
      });

      const result = JSON.parse(response.choices[0].message.content || '{"questions": []}');
      return result.questions || [];
    } catch (error) {
      throw new Error(`Failed to generate quiz: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateHint(question: string, context: string[]): Promise<string> {
    const contextString = context.join('\n\n');
    
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Provide a helpful hint for the given question based on the context. The hint should guide the user towards the answer without giving it away completely. Be concise and encouraging.

Context:
${contextString}`
          },
          {
            role: "user",
            content: `Question: ${question}

Please provide a hint that will help me think about this question.`
          }
        ],
        max_tokens: 150,
        temperature: 0.7,
      });

      return response.choices[0].message.content || "I'm sorry, I couldn't generate a hint.";
    } catch (error) {
      throw new Error(`Failed to generate hint: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateAnswer(question: string, context: string[]): Promise<string> {
    const contextString = context.join('\n\n');
    
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Provide a comprehensive and detailed answer to the given question based on the context. Include explanations, examples, and any relevant details that would help someone understand the topic thoroughly.

Context:
${contextString}`
          },
          {
            role: "user",
            content: `Question: ${question}

Please provide a complete and detailed answer.`
          }
        ],
        max_tokens: 800,
        temperature: 0.7,
      });

      return response.choices[0].message.content || "I'm sorry, I couldn't generate an answer.";
    } catch (error) {
      throw new Error(`Failed to generate answer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const openaiService = new OpenAIService();
