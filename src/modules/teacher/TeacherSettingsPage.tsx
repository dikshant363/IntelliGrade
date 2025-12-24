import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Profile {
  id: string;
  email: string | null;
  is_active: boolean;
  created_at: string;
}

export default function TeacherSettingsPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [primarySubject, setPrimarySubject] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (!user) return;

    const storedDisplayName =
      localStorage.getItem("intelligrade_teacher_display_name") || "";
    const storedSubject =
      localStorage.getItem("intelligrade_teacher_primary_subject") || "";
    setDisplayName(storedDisplayName);
    setPrimarySubject(storedSubject);

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, email, is_active, created_at")
          .eq("id", user.id)
          .maybeSingle();

        if (error) throw error;
        if (data) setProfile(data as Profile);
      } catch (err) {
        console.error("Failed to load teacher profile", err);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSavePreferences = () => {
    localStorage.setItem("intelligrade_teacher_display_name", displayName);
    localStorage.setItem(
      "intelligrade_teacher_primary_subject",
      primarySubject,
    );
    toast.success("Teacher preferences saved on this device");
  };

  const maskedId = profile?.id ? `${profile.id.slice(0, 8)}••••${profile.id.slice(-4)}` : "--";

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Teacher Settings</h1>
        <p className="text-sm text-muted-foreground">
          View your teacher ID details and personalize how IntelliGrade AI works for you
          during grading and demo.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Teacher Identity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {loadingProfile ? (
              <p className="text-muted-foreground">Loading your profile...</p>
            ) : profile ? (
              <>
                <div>
                  <p className="text-xs text-muted-foreground">Teacher ID</p>
                  <p className="font-mono text-sm">{maskedId}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p>{profile.email || "--"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge variant={profile.is_active ? "default" : "outline"}>
                    {profile.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Member since</p>
                  <p>{new Date(profile.created_at).toLocaleDateString()}</p>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">
                We couldn&apos;t load your profile details right now.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Teaching Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p className="text-xs text-muted-foreground">
              These settings are stored only on this browser. They help personalize how the
              Teacher Dashboard and demo scripts refer to you and your classes.
            </p>
            <div className="space-y-2">
              <label
                className="text-xs font-medium text-muted-foreground"
                htmlFor="teacherDisplayName"
              >
                Display name in teacher views
              </label>
              <Input
                id="teacherDisplayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Prof. Sharma, Dr. Mehta"
              />
            </div>
            <div className="space-y-2">
              <label
                className="text-xs font-medium text-muted-foreground"
                htmlFor="primarySubject"
              >
                Primary subject you teach
              </label>
              <Input
                id="primarySubject"
                value={primarySubject}
                onChange={(e) => setPrimarySubject(e.target.value)}
                placeholder="e.g. AI & ML, English Literature"
              />
            </div>
            <Button type="button" size="sm" onClick={handleSavePreferences}>
              Save preferences
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
