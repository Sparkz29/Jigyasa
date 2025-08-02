import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { HelpCircle, CheckCircle, XCircle } from "lucide-react";

interface QuizMessageProps {
  quiz: {
    id: string;
    topic: string;
    questions: Array<{
      question: string;
      options: string[];
      correctAnswer: number;
      explanation: string;
    }>;
  };
  documentId: string;
}

export function QuizMessage({ quiz }: QuizMessageProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [score, setScore] = useState(0);

  const question = quiz.questions[currentQuestion];
  const isLastQuestion = currentQuestion === quiz.questions.length - 1;

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return;

    const answerIndex = parseInt(selectedAnswer);
    const isCorrect = answerIndex === question.correctAnswer;
    
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);

    if (isCorrect) {
      setScore(score + 1);
    }

    setShowResult(true);
  };

  const handleNextQuestion = () => {
    if (isLastQuestion) {
      // Quiz completed - could add completion logic here
      return;
    }
    
    setCurrentQuestion(currentQuestion + 1);
    setSelectedAnswer("");
    setShowResult(false);
  };

  const handleSkipQuestion = () => {
    if (isLastQuestion) {
      return;
    }
    
    setCurrentQuestion(currentQuestion + 1);
    setSelectedAnswer("");
    setShowResult(false);
  };

  return (
    <div className="flex items-start space-x-3 animate-fade-in">
      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
        </svg>
      </div>
      
      <Card className="max-w-2xl border border-gray-200 rounded-2xl rounded-tl-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <HelpCircle className="text-purple-600 w-5 h-5" />
            <h4 className="font-semibold text-gray-900">Quiz: {quiz.topic}</h4>
            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </span>
          </div>
        </CardHeader>
        
        <CardContent>
          <p className="text-gray-800 mb-4" data-testid="quiz-question">
            {question.question}
          </p>
          
          {!showResult ? (
            <div className="space-y-2">
              <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
                {question.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-gray-800">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              
              <div className="mt-4 flex justify-between">
                <Button
                  variant="ghost"
                  onClick={handleSkipQuestion}
                  disabled={isLastQuestion}
                  data-testid="button-skip-question"
                >
                  Skip Question
                </Button>
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={!selectedAnswer}
                  data-testid="button-submit-answer"
                >
                  Submit Answer
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Show result */}
              <div className={`p-4 rounded-lg border ${
                parseInt(selectedAnswer) === question.correctAnswer 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center space-x-2 mb-2">
                  {parseInt(selectedAnswer) === question.correctAnswer ? (
                    <>
                      <CheckCircle className="text-green-600 w-5 h-5" />
                      <span className="font-semibold text-green-800">Correct!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="text-red-600 w-5 h-5" />
                      <span className="font-semibold text-red-800">Incorrect</span>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-700" data-testid="quiz-explanation">
                  {question.explanation}
                </p>
                {parseInt(selectedAnswer) !== question.correctAnswer && (
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>Correct answer:</strong> {question.options[question.correctAnswer]}
                  </p>
                )}
              </div>
              
              {/* Progress and next button */}
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Score: {score}/{currentQuestion + 1}
                </div>
                {!isLastQuestion ? (
                  <Button onClick={handleNextQuestion} data-testid="button-next-question">
                    Next Question
                  </Button>
                ) : (
                  <div className="text-sm font-semibold text-gray-800">
                    Quiz Complete! Final Score: {score}/{quiz.questions.length}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
