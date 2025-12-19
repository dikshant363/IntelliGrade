import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, Target, Shield, Zap } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <nav className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl">IntelliGrade AI</span>
          </div>
          <Link to="/auth">
            <Button>Sign In</Button>
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tight">
              AI-Powered Academic Grading
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Streamline report evaluation with intelligent automation, transparent feedback, and human oversight
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="text-lg px-8">
                Get Started
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <div className="p-6 rounded-lg border border-border bg-card">
              <Target className="h-10 w-10 text-primary mb-4 mx-auto" />
              <h3 className="font-semibold text-lg mb-2">AI-Assisted Grading</h3>
              <p className="text-sm text-muted-foreground">
                Automated evaluation against rubric criteria with section-wise scoring
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border bg-card">
              <Shield className="h-10 w-10 text-primary mb-4 mx-auto" />
              <h3 className="font-semibold text-lg mb-2">Teacher Oversight</h3>
              <p className="text-sm text-muted-foreground">
                Review, adjust, and approve AI grades with full control
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border bg-card">
              <Zap className="h-10 w-10 text-primary mb-4 mx-auto" />
              <h3 className="font-semibold text-lg mb-2">Transparent Feedback</h3>
              <p className="text-sm text-muted-foreground">
                Clear explanations for every score with detailed rationale
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-border/40 mt-24">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>© 2025 IntelliGrade AI. Built for academic excellence.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
