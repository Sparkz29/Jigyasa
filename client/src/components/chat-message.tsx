import { Button } from "@/components/ui/button";
import { Lightbulb, Check, User } from "lucide-react";

interface ChatMessageProps {
  message: {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
    type?: string;
  };
  onGetHint?: () => void;
  onShowAnswer?: () => void;
  showActions?: boolean;
}

export function ChatMessage({ message, onGetHint, onShowAnswer, showActions }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-start space-x-3 animate-fade-in ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
        </div>
      )}
      
      <div className={`rounded-2xl px-4 py-3 max-w-lg ${
        isUser 
          ? 'bg-blue-600 text-white rounded-tr-sm' 
          : 'bg-gray-100 rounded-tl-sm'
      }`}>
        <div className={`${isUser ? 'text-white' : 'text-gray-800'} whitespace-pre-wrap`}>
          {message.content}
        </div>
        
        {showActions && !isUser && (
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={onGetHint}
              className="bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs"
              data-testid="button-message-hint"
            >
              <Lightbulb className="w-3 h-3 mr-1" />
              Get Hint
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={onShowAnswer}
              className="bg-green-100 text-green-700 hover:bg-green-200 text-xs"
              data-testid="button-message-answer"
            >
              <Check className="w-3 h-3 mr-1" />
              Show Answer
            </Button>
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="text-gray-600 w-4 h-4" />
        </div>
      )}
    </div>
  );
}
