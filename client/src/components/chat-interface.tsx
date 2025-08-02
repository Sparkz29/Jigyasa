import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ChatMessage } from "@/components/chat-message";
import { QuizMessage } from "@/components/quiz-message";
import { Send, X, BookOpen, Lightbulb, HelpCircle, List, FileText } from "lucide-react";

interface ChatInterfaceProps {
  documentId: string;
  documentInfo: {
    id: string;
    name: string;
    size: number;
    uploadedAt: string;
  } | null;
  onClearDocument: () => void;
}

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  type?: 'chat' | 'quiz' | 'hint' | 'answer';
  quizData?: any;
}

export function ChatInterface({ documentId, documentInfo, onClearDocument }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load chat history
  const { data: chatHistory } = useQuery({
    queryKey: ['/api/chat', documentId],
    enabled: !!documentId,
  });

  useEffect(() => {
    if (chatHistory && typeof chatHistory === 'object' && chatHistory !== null && 'messages' in chatHistory && Array.isArray(chatHistory.messages)) {
      setMessages(chatHistory.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
        type: 'chat',
      })));
    } else {
      // Add welcome message
      setMessages([{
        id: 'welcome',
        content: "Hi! I've processed your document and I'm ready to help you learn. You can ask me questions about the content, start a quiz, or request hints on specific topics. What would you like to explore?",
        role: 'assistant',
        timestamp: new Date(),
        type: 'chat',
      }]);
    }
  }, [chatHistory]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const chatMutation = useMutation({
    mutationFn: async (data: { query: string; conversationHistory?: Array<{ role: string; content: string }> }) => {
      const response = await apiRequest('POST', '/api/chat', {
        query: data.query,
        documentId,
        conversationHistory: data.conversationHistory,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: data.response,
        role: 'assistant',
        timestamp: new Date(),
        type: 'chat',
      }]);
      setIsTyping(false);
      queryClient.invalidateQueries({ queryKey: ['/api/chat', documentId] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
      setIsTyping(false);
    },
  });

  const quizMutation = useMutation({
    mutationFn: async (topic?: string) => {
      const response = await apiRequest('POST', '/api/quiz', {
        documentId,
        topic,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: "Here's a quiz based on your document:",
        role: 'assistant',
        timestamp: new Date(),
        type: 'quiz',
        quizData: data.quiz,
      }]);
      setIsTyping(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate quiz",
        variant: "destructive",
      });
      setIsTyping(false);
    },
  });

  const hintMutation = useMutation({
    mutationFn: async (question: string) => {
      const response = await apiRequest('POST', '/api/hint', {
        question,
        documentId,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: `💡 **Hint**: ${data.hint}`,
        role: 'assistant',
        timestamp: new Date(),
        type: 'hint',
      }]);
      setIsTyping(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate hint",
        variant: "destructive",
      });
      setIsTyping(false);
    },
  });

  const answerMutation = useMutation({
    mutationFn: async (question: string) => {
      const response = await apiRequest('POST', '/api/answer', {
        question,
        documentId,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: `📖 **Complete Answer**: ${data.answer}`,
        role: 'assistant',
        timestamp: new Date(),
        type: 'answer',
      }]);
      setIsTyping(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate answer",
        variant: "destructive",
      });
      setIsTyping(false);
    },
  });

  const sendMessage = () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date(),
      type: 'chat',
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    const conversationHistory = messages
      .filter(msg => msg.type === 'chat')
      .map(msg => ({ role: msg.role, content: msg.content }));

    chatMutation.mutate({
      query: inputValue,
      conversationHistory,
    });

    setInputValue("");
  };

  const startQuiz = () => {
    if (isTyping) return;
    setIsTyping(true);
    quizMutation.mutate(undefined);
  };

  const getHint = () => {
    const lastUserMessage = messages.filter(msg => msg.role === 'user').slice(-1)[0];
    if (!lastUserMessage) {
      toast({
        title: "No Question Found",
        description: "Please ask a question first to get a hint.",
        variant: "destructive",
      });
      return;
    }
    
    if (isTyping) return;
    setIsTyping(true);
    hintMutation.mutate(lastUserMessage.content);
  };

  const showAnswer = () => {
    const lastUserMessage = messages.filter(msg => msg.role === 'user').slice(-1)[0];
    if (!lastUserMessage) {
      toast({
        title: "No Question Found",
        description: "Please ask a question first to see the answer.",
        variant: "destructive",
      });
      return;
    }
    
    if (isTyping) return;
    setIsTyping(true);
    answerMutation.mutate(lastUserMessage.content);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* File Info Bar */}
      {documentInfo && (
        <div className="bg-white border-b border-gray-200 px-4 py-3 sm:px-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <FileText className="text-red-600 w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate" data-testid="document-name">
                {documentInfo.name}
              </p>
              <p className="text-xs text-gray-500" data-testid="document-info">
                {formatFileSize(documentInfo.size)} • Uploaded {new Date(documentInfo.uploadedAt).toLocaleTimeString()}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearDocument}
              data-testid="button-clear-document"
              title="Upload new document"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4" data-testid="chat-messages">
        {messages.map((message) => (
          message.type === 'quiz' ? (
            <QuizMessage
              key={message.id}
              quiz={message.quizData}
              documentId={documentId}
            />
          ) : (
            <ChatMessage
              key={message.id}
              message={message}
              onGetHint={getHint}
              onShowAnswer={showAnswer}
              showActions={message.role === 'assistant' && message.type === 'chat' && messages.filter(m => m.role === 'user').length > 0}
            />
          )
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Area */}
      <div className="border-t border-gray-200 bg-white p-4 sm:p-6">
        <div className="flex flex-col space-y-3">
          {/* Action Buttons Row */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={startQuiz}
              disabled={isTyping}
              className="bg-purple-100 text-purple-700 hover:bg-purple-200"
              data-testid="button-start-quiz"
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              Start Quiz
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={getHint}
              disabled={isTyping}
              className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
              data-testid="button-get-hint"
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              Get Hint
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setInputValue("Explain the main concept from this chapter");
              }}
              disabled={isTyping}
              className="bg-green-100 text-green-700 hover:bg-green-200"
              data-testid="button-explain-topic"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Explain Topic
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setInputValue("Summarize the key points from this document");
              }}
              disabled={isTyping}
              className="bg-gray-100 text-gray-700 hover:bg-gray-200"
              data-testid="button-summarize"
            >
              <List className="w-4 h-4 mr-2" />
              Summarize
            </Button>
          </div>

          {/* Text Input Row */}
          <div className="flex space-x-3">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Ask a question about your document..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                disabled={isTyping}
                className="pr-12"
                data-testid="input-chat"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={sendMessage}
                disabled={isTyping || !inputValue.trim()}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                data-testid="button-send-message"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Input Helper Text */}
          <p className="text-xs text-gray-500">
            Try asking: "Explain this concept", "Give me a quiz", or "What's the main idea of chapter 3?"
          </p>
        </div>
      </div>
    </div>
  );
}
