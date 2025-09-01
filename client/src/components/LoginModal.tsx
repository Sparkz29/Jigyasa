import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { UserCircle, Award, X, Plus, ArrowLeft } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [userType, setUserType] = useState<"student" | "teacher">("student");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    firstName: "",
    lastName: "",
    gradeLevel: "",
  });
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: async ({
      userId,
      type,
    }: {
      userId: string;
      type: "student" | "teacher";
    }) => {
      return await apiRequest(`/api/login/${type}`, "POST", { userId });
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

  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      return await apiRequest("/api/users", "POST", userData);
    },
    onSuccess: (data: any) => {
      toast({
        title: "Account Created",
        description: `Welcome ${data.user.firstName}! You can now sign in.`,
      });
      setShowCreateForm(false);
      setNewUser({ email: "", firstName: "", lastName: "", gradeLevel: "" });
      // Automatically log in the new user
      loginMutation.mutate({ userId: data.user.id, type: userType });
    },
    onError: (error) => {
      toast({
        title: "Account Creation Failed",
        description: error instanceof Error ? error.message : "Failed to create account",
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

  const handleCreateUser = () => {
    if (!newUser.email || !newUser.firstName || !newUser.lastName) {
      toast({
        title: "Fill Required Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (userType === "student" && !newUser.gradeLevel) {
      toast({
        title: "Grade Level Required",
        description: "Please select a grade level for students",
        variant: "destructive",
      });
      return;
    }

    const userData = {
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: userType,
      gradeLevel: userType === "student" ? parseInt(newUser.gradeLevel) : undefined,
    };

    createUserMutation.mutate(userData);
  };

  // Actual user data from database
  const sampleUsers = {
    student: [
      { id: "0914b99d-8b87-4062-be90-caf812cf2aab", name: "Alex Johnson", grade: 5 },
      { id: "a7aa4231-0caa-45ef-a949-df02d4933b67", name: "Emma Davis", grade: 8 },
    ],
    teacher: [
      { id: "7a6f6452-9812-4536-a269-7b2b66cda2e7", name: "Sarah Miller", subject: "Science" },
      { id: "ca382934-f328-491d-af87-35fda0e3d35d", name: "John Wilson", subject: "Mathematics" },
    ],
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Sign In to JIGYASA.AI
          </h2>
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
                  variant={userType === "student" ? "default" : "outline"}
                  onClick={() => {
                    setUserType("student");
                    setSelectedUserId("");
                  }}
                  className="flex items-center justify-center space-x-2 h-12"
                  data-testid="button-select-student"
                >
                  <UserCircle className="w-5 h-5" />
                  <span>Student</span>
                </Button>
                <Button
                  variant={userType === "teacher" ? "default" : "outline"}
                  onClick={() => {
                    setUserType("teacher");
                    setSelectedUserId("");
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
                Select {userType === "student" ? "Student" : "Teacher"} Account
              </label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger data-testid="select-user">
                  <SelectValue
                    placeholder={`Choose a ${userType} account...`}
                  />
                </SelectTrigger>
                <SelectContent>
                  {sampleUsers[userType].map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center space-x-2">
                        <span>{user.name}</span>
                        <span className="text-sm text-gray-500">
                          {userType === "student"
                            ? `Grade ${(user as any).grade}`
                            : (user as any).subject}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!showCreateForm && (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Demo Users:</strong> These are real accounts in the system.
                    {userType === "student"
                      ? " Students can join classrooms and chat with the AI tutor."
                      : " Teachers can create classrooms and upload curriculum materials."}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleLogin}
                    disabled={!selectedUserId || loginMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    data-testid="button-login"
                  >
                    {loginMutation.isPending ? "Signing In..." : "Sign In"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateForm(true)}
                    className="flex items-center space-x-2"
                    data-testid="button-create-new"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create New</span>
                  </Button>
                </div>
              </>
            )}

            {showCreateForm && (
              <>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCreateForm(false)}
                      className="p-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <h3 className="text-lg font-medium">Create New {userType === "student" ? "Student" : "Teacher"}</h3>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
                    <Input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      placeholder="Enter email address"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">First Name</label>
                      <Input
                        value={newUser.firstName}
                        onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                        placeholder="First name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Last Name</label>
                      <Input
                        value={newUser.lastName}
                        onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                        placeholder="Last name"
                      />
                    </div>
                  </div>
                  
                  {userType === "student" && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Grade Level</label>
                      <Select value={newUser.gradeLevel} onValueChange={(value) => setNewUser({ ...newUser, gradeLevel: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select grade level" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 13 }, (_, i) => (
                            <SelectItem key={i} value={i.toString()}>
                              {i === 0 ? "Kindergarten" : `Grade ${i}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleCreateUser}
                  disabled={createUserMutation.isPending}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  data-testid="button-create-account"
                >
                  {createUserMutation.isPending ? "Creating Account..." : "Create Account & Sign In"}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
