import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const thresholdsSchema = z.object({
  A: z.number().min(0).max(100),
  B: z.number().min(0).max(100),
  C: z.number().min(0).max(100),
  D: z.number().min(0).max(100),
});

const weightsSchema = z.object({
  content: z.number().min(0).max(100),
  structure: z.number().min(0).max(100),
  originality: z.number().min(0).max(100),
});

const formatsSchema = z.array(z.enum(["pdf", "docx"]));

export default function EvaluationConfigPage() {
  const { role } = useAuth();
  const navigate = useNavigate();

  const [thresholds, setThresholds] = useState({ A: 85, B: 75, C: 65, D: 50 });
  const [weights, setWeights] = useState({ content: 40, structure: 30, originality: 30 });
  const [formats, setFormats] = useState<string[]>(["pdf", "docx"]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (role !== "admin") {
      navigate("/dashboard");
      return;
    }
    loadSettings();
  }, [role, navigate]);

  async function loadSettings() {
    const { data, error } = await supabase
      .from("evaluation_settings")
      .select("key, value");

    if (error) {
      console.error("Failed to load evaluation settings", error);
      return;
    }

    for (const row of data || []) {
      if (row.key === "grading_thresholds" && row.value && typeof row.value === "object") {
        setThresholds((prev) => ({ ...prev, ...(row.value as any) }));
      }
      if (row.key === "weight_distribution" && row.value && typeof row.value === "object") {
        setWeights((prev) => ({ ...prev, ...(row.value as any) }));
      }
      if (row.key === "allowed_file_formats" && Array.isArray(row.value)) {
        setFormats(row.value as string[]);
      }
    }
  }

  async function save() {
    try {
      const thresholdsParsed = thresholdsSchema.parse(thresholds);
      const weightsParsed = weightsSchema.parse(weights);
      const formatsParsed = formatsSchema.parse(formats);

      const weightSum = weightsParsed.content + weightsParsed.structure + weightsParsed.originality;
      if (weightSum !== 100) {
        toast.error("Weight distribution must add up to 100%.");
        return;
      }

      setSaving(true);

      const payload = [
        { key: "grading_thresholds", value: thresholdsParsed },
        { key: "weight_distribution", value: weightsParsed },
        { key: "allowed_file_formats", value: formatsParsed },
      ];

      const { error } = await supabase
        .from("evaluation_settings")
        .upsert(payload, { onConflict: "key" });

      if (error) throw error;
      toast.success("Evaluation configuration saved.");
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        toast.error(err.issues[0]?.message ?? "Invalid configuration");
      } else {
        console.error("Save settings error", err);
        toast.error("Failed to save configuration.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Evaluation Configuration</h1>
        <p className="text-muted-foreground text-sm">
          Control grading thresholds, weight distribution, and allowed upload formats.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Grading Thresholds</CardTitle>
            <CardDescription>Percentage cutoffs for letter grades</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {(["A", "B", "C", "D"] as const).map((grade) => (
              <div key={grade} className="space-y-1">
                <label className="text-xs text-muted-foreground">{grade} threshold (%)</label>
                <Input
                  type="number"
                  value={thresholds[grade]}
                  onChange={(e) =>
                    setThresholds((prev) => ({ ...prev, [grade]: Number(e.target.value) || 0 }))
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weight Distribution</CardTitle>
            <CardDescription>How much each rubric dimension contributes</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {([
              ["content", "Content"],
              ["structure", "Structure"],
              ["originality", "Originality"],
            ] as const).map(([key, label]) => (
              <div key={key} className="space-y-1">
                <label className="text-xs text-muted-foreground">{label} (%)</label>
                <Input
                  type="number"
                  value={weights[key]}
                  onChange={(e) =>
                    setWeights((prev) => ({ ...prev, [key]: Number(e.target.value) || 0 }))
                  }
                />
              </div>
            ))}
            <p className="col-span-2 text-xs text-muted-foreground">
              Ensure the three weights add up to 100%.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Allowed File Formats</CardTitle>
          <CardDescription>Extensions students are allowed to upload</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Textarea
            rows={3}
            value={formats.join(", ")}
            onChange={(e) =>
              setFormats(
                e.target.value
                  .split(",")
                  .map((v) => v.trim().toLowerCase())
                  .filter(Boolean)
              )
            }
          />
          <p className="text-xs text-muted-foreground">
            Supported values: <code>pdf</code>, <code>docx</code>. Separate with commas.
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save configuration"}
        </Button>
      </div>
    </div>
  );
}
