import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ClipboardList, Trash2, Eye, EyeOff } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type RubricSection = {
  name: string;
  description: string;
  max_marks: number;
  keywords?: string;
  concept_expectations?: string;
};

type Rubric = {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  sections: RubricSection[];
  total_marks: number;
  is_active: boolean;
  created_at: string;
};

export default function RubricList({ refresh }: { refresh: number }) {
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchRubrics();
  }, [refresh]);

  async function fetchRubrics() {
    try {
      const { data, error } = await supabase
        .from("rubrics")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Cast sections from Json to RubricSection[]
      const typedRubrics = (data || []).map((rubric) => ({
        ...rubric,
        sections: rubric.sections as unknown as RubricSection[],
      }));
      
      setRubrics(typedRubrics);
    } catch (error: any) {
      toast.error("Failed to load rubrics: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const { error } = await supabase.from("rubrics").delete().eq("id", id);

      if (error) throw error;

      toast.success("Rubric deleted successfully");
      fetchRubrics();
    } catch (error: any) {
      toast.error("Failed to delete rubric: " + error.message);
    } finally {
      setDeleteId(null);
    }
  }

  async function toggleActive(id: string, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from("rubrics")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      toast.success(`Rubric ${!currentStatus ? "activated" : "deactivated"}`);
      fetchRubrics();
    } catch (error: any) {
      toast.error("Failed to update rubric: " + error.message);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading rubrics...</p>
        </div>
      </div>
    );
  }

  if (rubrics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Rubrics</CardTitle>
          <CardDescription>Manage your grading templates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No rubrics created yet</p>
            <p className="text-sm">Create your first rubric to start grading</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">My Rubrics ({rubrics.length})</h3>
      </div>

      {rubrics.map((rubric) => (
        <Card key={rubric.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <CardTitle className="text-xl">{rubric.title}</CardTitle>
                  <Badge variant={rubric.is_active ? "default" : "secondary"}>
                    {rubric.is_active ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant="outline">{rubric.subject}</Badge>
                </div>
                {rubric.description && (
                  <CardDescription className="mt-1">{rubric.description}</CardDescription>
                )}
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span>{rubric.sections.length} sections</span>
                  <span>•</span>
                  <span className="font-medium">{rubric.total_marks} total marks</span>
                  <span>•</span>
                  <span>Created {new Date(rubric.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setExpandedId(expandedId === rubric.id ? null : rubric.id)}
                >
                  {expandedId === rubric.id ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleActive(rubric.id, rubric.is_active)}
                >
                  {rubric.is_active ? "Deactivate" : "Activate"}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteId(rubric.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {expandedId === rubric.id && (
            <CardContent className="space-y-3 border-t pt-4">
              {rubric.sections.map((section, index) => (
                <div
                  key={index}
                  className="p-3 bg-muted/50 rounded-lg space-y-1"
                >
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium">{section.name}</h4>
                    <Badge variant="outline">{section.max_marks} marks</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                  {section.keywords && (
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">Keywords:</span> {section.keywords}
                    </p>
                  )}
                  {section.concept_expectations && (
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">Concept expectations:</span> {section.concept_expectations}
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      ))}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Rubric?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this rubric. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
