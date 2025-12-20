import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

type RubricSection = {
  name: string;
  description: string;
  max_marks: number;
  keywords?: string; // comma-separated keywords
  concept_expectations?: string;
};

export default function CreateRubric({ onSuccess }: { onSuccess: () => void }) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [sections, setSections] = useState<RubricSection[]>([
    { name: "", description: "", max_marks: 0, keywords: "", concept_expectations: "" },
  ]);
  const [saving, setSaving] = useState(false);

  function addSection() {
    setSections([
      ...sections,
      { name: "", description: "", max_marks: 0, keywords: "", concept_expectations: "" },
    ]);
  }

  function removeSection(index: number) {
    if (sections.length === 1) {
      toast.error("At least one section is required");
      return;
    }
    setSections(sections.filter((_, i) => i !== index));
  }

  function updateSection(index: number, field: keyof RubricSection, value: string | number) {
    const updated = [...sections];
    updated[index] = { ...updated[index], [field]: value };
    setSections(updated);
  }

  function calculateTotalMarks() {
    return sections.reduce((sum, section) => sum + (section.max_marks || 0), 0);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("Rubric title is required");
      return;
    }
    
    if (!subject.trim()) {
      toast.error("Subject is required");
      return;
    }

    // Validate sections
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      if (!section.name.trim()) {
        toast.error(`Section ${i + 1}: Name is required`);
        return;
      }
      if (!section.description.trim()) {
        toast.error(`Section ${i + 1}: Description is required`);
        return;
      }
      if (section.max_marks <= 0) {
        toast.error(`Section ${i + 1}: Max marks must be greater than 0`);
        return;
      }
    }

    const totalMarks = calculateTotalMarks();
    if (totalMarks === 0) {
      toast.error("Total marks must be greater than 0");
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase.from("rubrics").insert({
        teacher_id: user?.id,
        title: title.trim(),
        description: description.trim(),
        subject: subject.trim(),
        sections: sections,
        total_marks: totalMarks,
        is_active: true,
      });

      if (error) throw error;

      toast.success("Rubric created successfully!");
      
      // Reset form
      setTitle("");
      setDescription("");
      setSubject("");
      setSections([
        { name: "", description: "", max_marks: 0, keywords: "", concept_expectations: "" },
      ]);
      
      onSuccess();
    } catch (error: any) {
      toast.error("Failed to create rubric: " + error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Rubric</CardTitle>
        <CardDescription>Define grading criteria and expectations</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Rubric Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Research Report Grading Rubric"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              placeholder="e.g., Computer Science, Mathematics"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Brief overview of this rubric"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base">Grading Sections *</Label>
              <Button type="button" variant="outline" size="sm" onClick={addSection}>
                <Plus className="h-4 w-4 mr-1" />
                Add Section
              </Button>
            </div>

            {sections.map((section, index) => (
              <Card key={index} className="relative">
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 space-y-3">
                      <div>
                        <Label>Section Name *</Label>
                        <Input
                          placeholder="e.g., Introduction & Thesis"
                          value={section.name}
                          onChange={(e) => updateSection(index, "name", e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <Label>Expectations *</Label>
                        <Textarea
                          placeholder="What should students demonstrate in this section?"
                          value={section.description}
                          onChange={(e) => updateSection(index, "description", e.target.value)}
                          rows={2}
                          required
                        />
                      </div>

                      <div>
                        <Label>Key concepts &amp; keywords (optional)</Label>
                        <Textarea
                          placeholder="Comma-separated key phrases the AI should look for"
                          value={section.keywords ?? ""}
                          onChange={(e) => updateSection(index, "keywords", e.target.value)}
                          rows={2}
                        />
                      </div>

                      <div>
                        <Label>Concept expectations (optional)</Label>
                        <Textarea
                          placeholder="Describe the deeper concepts or reasoning expected in this section"
                          value={section.concept_expectations ?? ""}
                          onChange={(e) => updateSection(index, "concept_expectations", e.target.value)}
                          rows={2}
                        />
                      </div>

                      <div>
                        <Label>Maximum Marks *</Label>
                        <Input
                          type="number"
                          min="1"
                          placeholder="10"
                          value={section.max_marks || ""}
                          onChange={(e) =>
                            updateSection(index, "max_marks", parseInt(e.target.value) || 0)
                          }
                          required
                        />
                      </div>
                    </div>

                    {sections.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSection(index)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <span className="font-medium">Total Marks:</span>
              <span className="text-2xl font-bold text-primary">{calculateTotalMarks()}</span>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? "Creating..." : "Create Rubric"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
