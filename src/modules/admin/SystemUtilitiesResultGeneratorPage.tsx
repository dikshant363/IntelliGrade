import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SystemUtilitiesResultGeneratorPage() {
  const { role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (role !== "admin") {
      navigate("/dashboard");
    }
  }, [role, navigate]);

  return (
    <main className="p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-bold mb-2">Result Generator</h1>
        <p className="text-muted-foreground text-sm max-w-2xl">
          How IntelliGrade AI presents grades and feedback to students, teachers, and admins.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>UI Output</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Feeds scores, section breakdowns, and explanations into the dashboards for
              human-friendly review.
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Send section-wise scores to Teacher and Student panels</li>
              <li>Show plagiarism indicators and risk levels</li>
              <li>Highlight differences between AI and final teacher grades</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>PDF Export</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Generates a printable report that can be shared or archived as an official record.
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Include student and rubric details</li>
              <li>List section-wise marks and feedback</li>
              <li>Embed plagiarism score and explanation</li>
            </ul>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
