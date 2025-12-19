import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ClipboardList } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreateRubric from "@/components/teacher/CreateRubric";
import RubricList from "@/components/teacher/RubricList";

export default function Rubrics() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);

  if (role !== "teacher") {
    navigate("/dashboard");
    return null;
  }

  function handleRubricCreated() {
    setRefreshKey((prev) => prev + 1);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <ClipboardList className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Rubric Management</h1>
          <p className="text-muted-foreground">Define grading criteria for academic reports</p>
        </div>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">My Rubrics</TabsTrigger>
          <TabsTrigger value="create">Create New</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <RubricList refresh={refreshKey} />
        </TabsContent>

        <TabsContent value="create">
          <CreateRubric onSuccess={handleRubricCreated} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
