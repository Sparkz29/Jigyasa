import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { UserCircle, Award, X } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [userType, setUserType] = useState<'student' | 'teacher'>('student');
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: async ({ userId, type }: { userId: string; type: 'student' | 'teacher' }) => {
      return await apiRequest(`/api/login/${type}`, 'POST', { userId });
    },
    onSuccess: () => {
      window.location.reload();
    },
    onError: (error) => {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Failed to login",
        variant: "destructive",
      });
    },
  });

  const handleLogin = () => {
    if (!selectedUserId) {
      toast({
        title: "Select User",
        description: "Please select a user to login as",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate({ userId: selectedUserId, type: userType });
  };

  // Sample user data for selection
  const sampleUsers = {
    student: [
      { id: 'student1', name: 'Emma Davis', grade: 5 },
      { id: 'student2', name: 'Alex Wilson', grade: 8 },
      { id: 'student3', name: 'Maya Patel', grade: 10 },
      { id: 'student4', name: 'Noah Thompson', grade: 6 },
      { id: 'student5', name: 'Zoe Martinez', grade: 9 },
    ],
    teacher: [
      { id: 'teacher1', name: 'Sarah Johnson', subject: 'Mathematics' },
      { id: 'teacher2', name: 'Michael Chen', subject: 'Science' },
    ],
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Sign In to JIGYASA.AI</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            data-testid="button-close-login"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                I am a...
              </label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={userType === 'student' ? 'default' : 'outline'}
                  onClick={() => {
                    setUserType('student');
                    setSelectedUserId('');
                  }}
                  className="flex items-center justify-center space-x-2 h-12"
                  data-testid="button-select-student"
                >
                  <UserCircle className="w-5 h-5" />
                  <span>Student</span>
                </Button>
                <Button
                  variant={userType === 'teacher' ? 'default' : 'outline'}
                  onClick={() => {
                    setUserType('teacher');
                    setSelectedUserId('');
                  }}
                  className="flex items-center justify-center space-x-2 h-12"
                  data-testid="button-select-teacher"
                >
                  <Award className="w-5 h-5" />
                  <span>Teacher</span>
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Select {userType === 'student' ? 'Student' : 'Teacher'} Account
              </label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger data-testid="select-user">
                  <SelectValue placeholder={`Choose a ${userType} account...`} />
                </SelectTrigger>
                <SelectContent>
                  {sampleUsers[userType].map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center space-x-2">
                        <span>{user.name}</span>
                        <span className="text-sm text-gray-500">
                          {userType === 'student' ? `Grade ${(user as any).grade}` : (user as any).subject}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Demo Users:</strong> These are sample accounts for testing. 
                {userType === 'student' ? ' Students can join classrooms and chat with the AI tutor.' : ' Teachers can create classrooms and upload curriculum materials.'}
              </p>
            </div>

            <Button
              onClick={handleLogin}
              disabled={!selectedUserId || loginMutation.isPending}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              data-testid="button-login"
            >
              {loginMutation.isPending ? 'Signing In...' : 'Sign In'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}