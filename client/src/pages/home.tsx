import { useState } from "react";
import { FileUpload } from "@/components/file-upload";
import { ChatInterface } from "@/components/chat-interface";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [documentInfo, setDocumentInfo] = useState<{
    id: string;
    name: string;
    size: number;
    uploadedAt: string;
  } | null>(null);
  const { toast } = useToast();

  const handleDocumentUploaded = (docId: string, docInfo: any) => {
    setDocumentId(docId);
    setDocumentInfo(docInfo);
    toast({
      title: "Success",
      description: "Document uploaded successfully!",
    });
  };

  const handleClearDocument = () => {
    setDocumentId(null);
    setDocumentInfo(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Smart Study Buddy</h1>
          </div>
          <div className="text-sm text-gray-500 hidden sm:block">
            AI-Powered Learning Assistant
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {!documentId ? (
          <FileUpload onDocumentUploaded={handleDocumentUploaded} />
        ) : (
          <ChatInterface 
            documentId={documentId} 
            documentInfo={documentInfo}
            onClearDocument={handleClearDocument}
          />
        )}
      </main>
    </div>
  );
}
