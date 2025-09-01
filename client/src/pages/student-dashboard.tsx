import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  BookOpen, 
  MessageSquare, 
  Plus, 
  Users, 
  LogOut,
  Send,
  Brain,
  Sparkles,
  Clock
} from "lucide-react";
import type { Classroom, ChatMessage } from "@shared/schema";

export default function StudentDashboard() {
  const { toast } = useToast();
  const [inviteCode, setInviteCode] = useState("");
  const [selectedClassroom, setSelectedClassroom] = useState<string>("");
  const [currentMessage, setCurrentMessage] = useState("");
  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Get user's classrooms
  const { data: classroomsData, isLoading: classroomsLoading } = useQuery({
    queryKey: ["/api/classrooms"],
  });

  // Get chat sessions for selected classroom
  const { data: sessionsData } = useQuery({
    queryKey: ["/api/classrooms", selectedClassroom, "sessions"],
    enabled: !!selectedClassroom,
  });

  // Get messages for current session
  useEffect(() => {
    if (currentSessionId) {
      queryClient.fetchQuery({
        queryKey: ["/api/sessions", currentSessionId, "messages"],
      }).then((data: any) => {
        setMessages(data?.messages || []);
      }).catch(console.error);
    }
  }, [currentSessionId]);

  // Join classroom mutation
  const joinClassroomMutation = useMutation({
    mutationFn: async (code: string) => {
      return await apiRequest("/api/classrooms/join", "POST", { inviteCode: code });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Successfully joined classroom!",
      });
      setInviteCode("");
      queryClient.invalidateQueries({ queryKey: ["/api/classrooms"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to join classroom",
        variant: "destructive",
      });
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { message: string; classroomId: string; sessionId?: string }) => {
      return await apiRequest("/api/chat", "POST", messageData);
    },
    onSuccess: (data: any) => {
      setCurrentSessionId(data.sessionId);
      // Refresh messages
      queryClient.fetchQuery({
        queryKey: ["/api/sessions", data.sessionId, "messages"],
      }).then((messagesData: any) => {
        setMessages(messagesData?.messages || []);
      });
      setCurrentMessage("");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleJoinClassroom = () => {
    if (inviteCode.trim()) {
      joinClassroomMutation.mutate(inviteCode.trim().toUpperCase());
    }
  };

  const handleSendMessage = () => {
    if (currentMessage.trim() && selectedClassroom) {
      sendMessageMutation.mutate({
        message: currentMessage.trim(),
        classroomId: selectedClassroom,
        sessionId: currentSessionId || undefined,
      });
    }
  };

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/logout', 'POST');
    },
    onSuccess: () => {
      window.location.href = '/';
    },
    onError: (error) => {
      toast({
        title: "Logout Failed",
        description: error instanceof Error ? error.message : "Failed to logout",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const classrooms: Classroom[] = (classroomsData as any)?.classrooms || [];
  const sessions = (sessionsData as any)?.sessions || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Brain className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  JIGYASA.AI
                </h1>
                <p className="text-xs text-gray-600">Student Dashboard</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - Classrooms */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  My Classrooms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Join Classroom */}
                <div className="space-y-2">
                  <Input
                    placeholder="Enter invite code"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    data-testid="input-invite-code"
                  />
                  <Button 
                    onClick={handleJoinClassroom}
                    disabled={!inviteCode.trim() || joinClassroomMutation.isPending}
                    className="w-full"
                    size="sm"
                    data-testid="button-join-classroom"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {joinClassroomMutation.isPending ? "Joining..." : "Join Classroom"}
                  </Button>
                </div>

                <Separator />

                {/* Classroom List */}
                {classroomsLoading ? (
                  <div className="text-sm text-gray-500">Loading classrooms...</div>
                ) : classrooms.length === 0 ? (
                  <div className="text-sm text-gray-500 text-center py-4">
                    No classrooms yet. Join one using an invite code!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {classrooms.map((classroom) => (
                      <div
                        key={classroom.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedClassroom === classroom.id
                            ? 'bg-blue-50 border-blue-200'
                            : 'hover:bg-gray-50 border-gray-200'
                        }`}
                        onClick={() => {
                          setSelectedClassroom(classroom.id);
                          setCurrentSessionId("");
                          setMessages([]);
                        }}
                        data-testid={`classroom-${classroom.id}`}
                      >
                        <div className="font-medium text-sm">{classroom.name}</div>
                        <div className="text-xs text-gray-500">
                          Grade {classroom.gradeLevel}
                          {classroom.subject && ` • ${classroom.subject}`}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Chat Sessions */}
            {selectedClassroom && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="flex items-center text-sm">
                    <Clock className="w-4 h-4 mr-2" />
                    Recent Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {sessions.length === 0 ? (
                    <div className="text-xs text-gray-500 text-center py-2">
                      Start a new conversation
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {sessions.slice(0, 5).map((session: any) => (
                        <div
                          key={session.id}
                          className={`p-2 rounded text-xs cursor-pointer transition-colors ${
                            currentSessionId === session.id
                              ? 'bg-purple-50 border border-purple-200'
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => setCurrentSessionId(session.id)}
                          data-testid={`session-${session.id}`}
                        >
                          {session.title || `Session ${String(session.id).slice(-6)}`}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            {!selectedClassroom ? (
              <Card className="h-[600px] flex items-center justify-center">
                <CardContent className="text-center">
                  <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Welcome to JIGYASA.AI
                  </h3>
                  <p className="text-gray-600">
                    Select a classroom to start learning with your AI tutor
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-[600px] flex flex-col">
                <CardHeader className="flex-shrink-0 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <MessageSquare className="w-5 h-5 mr-2" />
                      AI Tutor Chat
                    </CardTitle>
                    <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-purple-100">
                      {classrooms.find(c => c.id === selectedClassroom)?.name}
                    </Badge>
                  </div>
                </CardHeader>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <Brain className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600 mb-2">
                        Start a conversation with your AI tutor
                      </p>
                      <p className="text-sm text-gray-500">
                        Ask questions about your curriculum materials and get personalized help!
                      </p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] px-4 py-3 rounded-lg ${
                            message.role === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {message.role === 'assistant' && (
                            <div className="flex items-center mb-2">
                              <Brain className="w-4 h-4 mr-2 text-purple-600" />
                              <span className="text-xs font-medium text-purple-600">
                                JIGYASA.AI
                              </span>
                            </div>
                          )}
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          {message.role === 'assistant' && message.citations && (
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <p className="text-xs text-gray-600">
                                📚 Sources referenced in this response
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}

                  {sendMessageMutation.isPending && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 px-4 py-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                          <span className="text-sm text-gray-600 ml-2">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="flex-shrink-0 border-t p-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Ask your AI tutor a question..."
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      disabled={sendMessageMutation.isPending}
                      data-testid="input-chat-message"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!currentMessage.trim() || sendMessageMutation.isPending}
                      data-testid="button-send-message"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Press Enter to send, Shift+Enter for new line
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}