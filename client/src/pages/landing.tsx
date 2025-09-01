import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoginModal } from "@/components/LoginModal";
import { useState } from "react";
import { 
  BookOpen, 
  Users, 
  Shield, 
  Brain, 
  MessageSquare, 
  Target,
  CheckCircle,
  Star,
  ArrowRight,
  Sparkles,
  GraduationCap,
  Lock
} from "lucide-react";

export default function Landing() {
  const [showLogin, setShowLogin] = useState(false);
  
  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
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
                <p className="text-xs text-gray-600">Artificial Intelligence that builds Real Intelligence</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection('features')}
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('pricing')}
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Pricing
              </button>
              <button 
                onClick={() => scrollToSection('about')}
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                About
              </button>
              <button 
                onClick={() => scrollToSection('contact')}
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Contact
              </button>
              <Button variant="outline" onClick={() => setShowLogin(true)} data-testid="button-sign-in">
                Sign In
              </Button>
              <Button 
                onClick={() => setShowLogin(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                data-testid="button-get-started"
              >
                Get Started
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-full text-sm text-blue-700 font-medium mb-8">
              <Sparkles className="w-4 h-4 mr-2" />
              Powered by Grade-Adaptive AI Technology
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Empower every learner,
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                support every educator
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              A trusted AI platform that creates safe, personalized learning experiences through Socratic questioning and curriculum-aligned content controlled by teachers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4"
                onClick={() => setShowLogin(true)}
                data-testid="button-get-started-free"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="text-lg px-8 py-4"
                onClick={() => scrollToSection('demo')}
              >
                <MessageSquare className="mr-2 w-5 h-5" />
                Try Live Demo
              </Button>
            </div>

            {/* Hero Image/Animation */}
            <div className="relative max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-2xl p-6 border">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <div className="flex-1 bg-gray-100 rounded-full px-4 py-2">
                    <span className="text-sm text-gray-500">JIGYASA.AI - Grade 8 Biology</span>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-8 text-left">
                  <div className="flex items-start space-x-4 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Brain className="text-white w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 mb-2">
                        "Let's explore photosynthesis together! Instead of just telling you the answer, can you think about what plants need to make their own food?"
                      </p>
                      <div className="text-xs text-gray-500 bg-white/50 rounded px-2 py-1 inline-block">
                        📚 Referenced: Chapter 3 - Plant Biology Textbook
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    <span className="text-sm ml-2">AI is thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              AI-Powered Learning That Actually Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built specifically for education, with safety and pedagogical effectiveness at its core
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            <Card className="border-2 border-blue-100 hover:border-blue-200 transition-colors">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Target className="text-white w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Grade-Adaptive Learning</h3>
                <p className="text-gray-600 mb-6">
                  AI automatically adjusts complexity and language to match each student's grade level, ensuring age-appropriate interactions.
                </p>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-700 font-medium">Example for Grade 5:</p>
                  <p className="text-sm text-gray-600 mt-1">"What do you think helps plants grow tall and strong?"</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-100 hover:border-purple-200 transition-colors">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="text-white w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Socratic Questioning</h3>
                <p className="text-gray-600 mb-6">
                  Instead of giving direct answers, JIGYASA guides students with thoughtful questions that promote critical thinking.
                </p>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-purple-700 font-medium">Socratic Method:</p>
                  <p className="text-sm text-gray-600 mt-1">"What do you already know about this topic?"</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-100 hover:border-green-200 transition-colors">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Shield className="text-white w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Walled Garden Safety</h3>
                <p className="text-gray-600 mb-6">
                  AI only uses curriculum materials approved by teachers, ensuring safe, accurate, and curriculum-aligned responses.
                </p>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-700 font-medium">Teacher Controlled:</p>
                  <p className="text-sm text-gray-600 mt-1">Only approved textbooks and materials</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Roles */}
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            <div className="text-left">
              <div className="flex items-center mb-6">
                <GraduationCap className="text-blue-600 w-8 h-8 mr-3" />
                <h3 className="text-2xl font-bold text-gray-900">For Students</h3>
              </div>
              <div className="space-y-4">
                {[
                  "Personalized AI tutoring adapted to your grade level",
                  "Safe learning environment with curriculum-approved content",
                  "Socratic questioning that develops critical thinking",
                  "Real-time help with homework and study questions",
                  "Chat history to review past conversations",
                  "Source citations for all AI responses"
                ].map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle className="text-blue-600 w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-left">
              <div className="flex items-center mb-6">
                <Users className="text-purple-600 w-8 h-8 mr-3" />
                <h3 className="text-2xl font-bold text-gray-900">For Teachers</h3>
              </div>
              <div className="space-y-4">
                {[
                  "Create virtual classrooms and manage students",
                  "Upload and control curriculum materials",
                  "Monitor student interactions and progress",
                  "Generate secure classroom invite codes",
                  "Role-based access control and permissions",
                  "Complete oversight of AI knowledge base"
                ].map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle className="text-purple-600 w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Start free and scale as your educational needs grow
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-2">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-2">Free</h3>
                <div className="text-4xl font-bold mb-6">$0<span className="text-lg text-gray-500 font-normal">/month</span></div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" />Up to 1 classroom</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" />10 students per classroom</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" />Basic AI tutoring</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" />Document upload</li>
                </ul>
                <Button variant="outline" className="w-full">Get Started</Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">Most Popular</span>
              </div>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-2">Pro</h3>
                <div className="text-4xl font-bold mb-6">$29<span className="text-lg text-gray-500 font-normal">/month</span></div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" />Unlimited classrooms</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" />100 students per classroom</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" />Advanced AI features</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" />Analytics dashboard</li>
                </ul>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Start Free Trial</Button>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
                <div className="text-4xl font-bold mb-6">Custom</div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" />Unlimited everything</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" />SSO integration</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" />Custom deployment</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" />Priority support</li>
                </ul>
                <Button variant="outline" className="w-full">Contact Sales</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Experience JIGYASA.AI in Action
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            See how our AI tutor adapts to different grade levels and uses the Socratic method
          </p>
          <Button 
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4"
            onClick={() => window.location.href = '/api/login'}
          >
            Try Interactive Demo
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              About JIGYASA.AI
            </h2>
            <p className="text-xl text-gray-600">
              Building the future of personalized education through responsible AI
            </p>
          </div>
          
          <div className="prose prose-lg mx-auto text-gray-700">
            <p>
              JIGYASA.AI represents a breakthrough in educational technology, combining cutting-edge artificial intelligence 
              with proven pedagogical methods. Our platform is designed specifically for K-12 education, ensuring that 
              every interaction is safe, age-appropriate, and educationally valuable.
            </p>
            
            <p>
              By implementing the Socratic method through AI, we help students develop critical thinking skills rather 
              than just providing answers. Our grade-adaptive technology ensures that conversations are always at the 
              right level of complexity, while our "walled garden" approach gives teachers complete control over the 
              knowledge base their students can access.
            </p>

            <p>
              Built by educators, for educators, JIGYASA.AI is more than just an AI chatbot – it's a comprehensive 
              learning platform that empowers both students and teachers to achieve better educational outcomes.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Ready to Transform Learning?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of educators already using JIGYASA.AI in their classrooms
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4"
              onClick={() => setShowLogin(true)}
              data-testid="button-get-started-now"
            >
              Get Started Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="text-lg px-8 py-4"
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="text-white w-5 h-5" />
              </div>
              <div>
                <div className="font-bold">JIGYASA.AI</div>
                <div className="text-sm text-gray-400">Artificial Intelligence that builds Real Intelligence</div>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              © 2025 JIGYASA.AI. Built with ❤️ for education.
            </div>
          </div>
        </div>
      </footer>
      
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );
}