import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Users as UsersIcon, Shield, BookOpen, GraduationCap } from "lucide-react";

type Profile = {
  id: string;
  email: string | null;
  created_at: string;
};

type UserRole = {
  user_id: string;
  role: "admin" | "teacher" | "student";
};

type UserWithRole = Profile & {
  role: "admin" | "teacher" | "student" | null;
};

export default function Users() {
  const { role, user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "teacher" | "student">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role !== "admin") {
      navigate("/dashboard");
      return;
    }
    fetchUsers();
  }, [role, navigate]);

  async function fetchUsers() {
    try {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all user roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) throw rolesError;

      // Merge profiles with roles
      const usersWithRoles: UserWithRole[] = (profiles || []).map((profile) => {
        const userRole = roles?.find((r) => r.user_id === profile.id);
        return {
          ...profile,
          role: userRole?.role || null,
        };
      });

      setUsers(usersWithRoles);
    } catch (error: any) {
      toast.error("Failed to load users: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleChange(userId: string, newRole: "admin" | "teacher" | "student") {
    try {
      // First, delete existing role
      const { error: deleteError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      if (deleteError) throw deleteError;

      // Then insert new role
      const { error: insertError } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: newRole });

      if (insertError) throw insertError;

      toast.success("Role updated successfully");
      fetchUsers();
    } catch (error: any) {
      toast.error("Failed to update role: " + error.message);
    }
  }

  function getRoleIcon(role: string | null) {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4" />;
      case "teacher":
        return <BookOpen className="h-4 w-4" />;
      case "student":
        return <GraduationCap className="h-4 w-4" />;
      default:
        return null;
    }
  }

  function getRoleBadgeVariant(role: string | null): "default" | "secondary" | "outline" {
    switch (role) {
      case "admin":
        return "default";
      case "teacher":
        return "secondary";
      default:
        return "outline";
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  const filteredUsers =
    roleFilter === "all" ? users : users.filter((u) => u.role === roleFilter);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <UsersIcon className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground text-sm">
              View user IDs and assign roles to control access
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-muted-foreground mr-1">Filter by role:</span>
          {(["all", "admin", "teacher", "student"] as const).map((f) => (
            <Badge
              key={f}
              variant={roleFilter === f ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setRoleFilter(f)}
            >
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            </Badge>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Users ({filteredUsers.length}
            {roleFilter !== "all" && ` of ${users.length}`} )
          </CardTitle>
          <CardDescription>
            Assign roles and verify IDs for teachers and students
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No users found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground max-w-[220px] truncate">
                      {u.id}
                    </TableCell>
                    <TableCell className="font-medium">
                      {u.email || "No email"}
                      {u.id === user?.id && (
                        <Badge variant="outline" className="ml-2">
                          You
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getRoleIcon(u.role)}
                        <Badge variant={getRoleBadgeVariant(u.role)}>
                          {u.role || "No role"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(u.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {u.id === user?.id ? (
                        <span className="text-sm text-muted-foreground">Can't change own role</span>
                      ) : (
                        <Select
                          value={u.role || ""}
                          onValueChange={(value) =>
                            handleRoleChange(u.id, value as "admin" | "teacher" | "student")
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Set role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="teacher">Teacher</SelectItem>
                            <SelectItem value="student">Student</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
