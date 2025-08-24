import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  BookOpen, 
  Users, 
  Plus, 
  Upload, 
  Copy, 
  LogOut,
  GraduationCap,
  FileText,
  Sparkles,
  Brain
} from "lucide-react";
import type { Classroom, Document } from "@shared/schema";

export default function TeacherDashboard() {
  const { toast } = useToast();
  const [selectedClassroom, setSelectedClassroom] = useState<string>("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newClassroom, setNewClassroom] = useState({
    name: "",
    description: "",
    gradeLevel: "",
    subject: ""
  });

  // Get teacher's classrooms
  const { data: classroomsData, isLoading: classroomsLoading } = useQuery({
    queryKey: ["/api/classrooms"],
  });

  // Get documents for selected classroom
  const { data: documentsData, isLoading: documentsLoading } = useQuery({
    queryKey: ["/api/classrooms", selectedClassroom, "documents"],
    enabled: !!selectedClassroom,
  });

  // Create classroom mutation
  const createClassroomMutation = useMutation({
    mutationFn: async (classroomData: any) => {
      return await apiRequest("/api/classrooms", "POST", {
        ...classroomData,
        gradeLevel: parseInt(classroomData.gradeLevel)
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Success",
        description: "Classroom created successfully!",
      });
      setIsCreateDialogOpen(false);
      setNewClassroom({ name: "", description: "", gradeLevel: "", subject: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/classrooms"] });
      
      // Show invite code
      toast({
        title: "Invite Code Generated",
        description: `Share code "${data.classroom.inviteCode}" with your students`,
        duration: 5000,
      });
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
        description: error instanceof Error ? error.message : "Failed to create classroom",
        variant: "destructive",
      });
    },
  });

  // Upload document mutation
  const uploadDocumentMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`/api/classrooms/${selectedClassroom}/documents`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Document uploaded successfully!",
      });
      queryClient.invalidateQueries({ 
        queryKey: ["/api/classrooms", selectedClassroom, "documents"] 
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload document",
        variant: "destructive",
      });
    },
  });

  const handleCreateClassroom = () => {
    if (newClassroom.name && newClassroom.gradeLevel) {
      createClassroomMutation.mutate(newClassroom);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && selectedClassroom) {
      if (file.type !== 'application/pdf') {
        toast({
          title: "Error",
          description: "Only PDF files are supported",
          variant: "destructive",
        });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File size must be less than 10MB",
          variant: "destructive",
        });
        return;
      }
      uploadDocumentMutation.mutate(file);
    }
  };

  const copyInviteCode = (inviteCode: string) => {
    navigator.clipboard.writeText(inviteCode);
    toast({
      title: "Copied",
      description: "Invite code copied to clipboard",
    });
  };

  const classrooms: Classroom[] = (classroomsData as any)?.classrooms || [];
  const documents: Document[] = (documentsData as any)?.documents || [];
  const selectedClassroomData = classrooms.find(c => c.id === selectedClassroom);

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
                <p className="text-xs text-gray-600">Teacher Dashboard</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/api/logout'}
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
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-lg">
                    <GraduationCap className="w-5 h-5 mr-2" />
                    My Classrooms
                  </CardTitle>
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" data-testid="button-create-classroom">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Classroom</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input
                          placeholder="Classroom name"
                          value={newClassroom.name}
                          onChange={(e) => setNewClassroom({ ...newClassroom, name: e.target.value })}
                          data-testid="input-classroom-name"
                        />
                        <Textarea
                          placeholder="Description (optional)"
                          value={newClassroom.description}
                          onChange={(e) => setNewClassroom({ ...newClassroom, description: e.target.value })}
                          data-testid="input-classroom-description"
                        />
                        <Select 
                          value={newClassroom.gradeLevel} 
                          onValueChange={(value) => setNewClassroom({ ...newClassroom, gradeLevel: value })}
                        >
                          <SelectTrigger data-testid="select-grade-level">
                            <SelectValue placeholder="Select grade level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Grade 1</SelectItem>
                            <SelectItem value="2">Grade 2</SelectItem>
                            <SelectItem value="3">Grade 3</SelectItem>
                            <SelectItem value="4">Grade 4</SelectItem>
                            <SelectItem value="5">Grade 5</SelectItem>
                            <SelectItem value="6">Grade 6</SelectItem>
                            <SelectItem value="7">Grade 7</SelectItem>
                            <SelectItem value="8">Grade 8</SelectItem>
                            <SelectItem value="9">Grade 9</SelectItem>
                            <SelectItem value="10">Grade 10</SelectItem>
                            <SelectItem value="11">Grade 11</SelectItem>
                            <SelectItem value="12">Grade 12</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Subject (optional)"
                          value={newClassroom.subject}
                          onChange={(e) => setNewClassroom({ ...newClassroom, subject: e.target.value })}
                          data-testid="input-classroom-subject"
                        />
                        <Button 
                          onClick={handleCreateClassroom}
                          disabled={!newClassroom.name || !newClassroom.gradeLevel || createClassroomMutation.isPending}
                          className="w-full"
                          data-testid="button-save-classroom"
                        >
                          {createClassroomMutation.isPending ? "Creating..." : "Create Classroom"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {classroomsLoading ? (
                  <div className="text-sm text-gray-500">Loading classrooms...</div>
                ) : classrooms.length === 0 ? (
                  <div className="text-sm text-gray-500 text-center py-4">
                    No classrooms yet. Create one to get started!
                  </div>
                ) : (
                  classrooms.map((classroom) => (
                    <div
                      key={classroom.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedClassroom === classroom.id
                          ? 'bg-blue-50 border-blue-200'
                          : 'hover:bg-gray-50 border-gray-200'
                      }`}
                      onClick={() => setSelectedClassroom(classroom.id)}
                      data-testid={`classroom-${classroom.id}`}
                    >
                      <div className="font-medium text-sm">{classroom.name}</div>
                      <div className="text-xs text-gray-500 mb-2">
                        Grade {classroom.gradeLevel}
                        {classroom.subject && ` • ${classroom.subject}`}
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {classroom.inviteCode}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyInviteCode(classroom.inviteCode!);
                          }}
                          className="h-6 w-6 p-0"
                          data-testid={`button-copy-code-${classroom.id}`}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {!selectedClassroom ? (
              <Card className="h-[600px] flex items-center justify-center">
                <CardContent className="text-center">
                  <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Welcome to Your Teacher Dashboard
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Create or select a classroom to manage curriculum materials
                  </p>
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Classroom
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Classroom Header */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                          {selectedClassroomData?.name}
                        </h2>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>Grade {selectedClassroomData?.gradeLevel}</span>
                          {selectedClassroomData?.subject && (
                            <span>• {selectedClassroomData.subject}</span>
                          )}
                          <span>• Code: <code className="bg-gray-100 px-2 py-1 rounded">{selectedClassroomData?.inviteCode}</code></span>
                        </div>
                        {selectedClassroomData?.description && (
                          <p className="text-gray-600 mt-2">{selectedClassroomData.description}</p>
                        )}
                      </div>
                      <Button
                        onClick={() => copyInviteCode(selectedClassroomData?.inviteCode!)}
                        variant="outline"
                        data-testid="button-copy-invite-code"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Invite Code
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Document Management */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center">
                        <FileText className="w-5 h-5 mr-2" />
                        Curriculum Materials
                      </CardTitle>
                      <div>
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="file-upload"
                          disabled={uploadDocumentMutation.isPending}
                        />
                        <Button
                          onClick={() => document.getElementById('file-upload')?.click()}
                          disabled={uploadDocumentMutation.isPending}
                          data-testid="button-upload-document"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {uploadDocumentMutation.isPending ? "Uploading..." : "Upload PDF"}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {documentsLoading ? (
                      <div className="text-center py-8 text-gray-500">
                        Loading documents...
                      </div>
                    ) : documents.length === 0 ? (
                      <div className="text-center py-12">
                        <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No curriculum materials yet
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Upload PDF documents to create a safe knowledge base for your AI tutor
                        </p>
                        <Button
                          onClick={() => document.getElementById('file-upload')?.click()}
                          className="bg-gradient-to-r from-blue-600 to-purple-600"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload First Document
                        </Button>
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {documents.map((doc) => (
                          <Card key={doc.id} className="border border-gray-200">
                            <CardContent className="p-4">
                              <div className="flex items-start space-x-3">
                                <FileText className="w-8 h-8 text-red-500 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-sm truncate">{doc.name}</h4>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {(doc.size / 1024 / 1024).toFixed(1)} MB
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(doc.createdAt!).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* AI Safety Notice */}
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Brain className="w-6 h-6 text-blue-600 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-blue-900 mb-1">AI Safety & Control</h4>
                        <p className="text-sm text-blue-800">
                          JIGYASA.AI only uses the curriculum materials you upload as its knowledge base. 
                          Students can only access information from your approved documents, ensuring safe 
                          and curriculum-aligned learning experiences.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}