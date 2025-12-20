import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Users as UsersIcon, Shield, BookOpen, GraduationCap, ClipboardCopy } from "lucide-react";

type Profile = {
  id: string;
  email: string | null;
  created_at: string;
  is_active: boolean;
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
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<"teacher" | "student" | "admin" | "">("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sendWelcome, setSendWelcome] = useState(true);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastTempPassword, setLastTempPassword] = useState<string | null>(null);
  const [lastTempEmail, setLastTempEmail] = useState<string | null>(null);

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
      const { error: deleteError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      if (deleteError) throw deleteError;

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

  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault();
    if (!newEmail || !newRole) {
      toast.error("Please provide an email and select a role");
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      toast.error("Please enter a password with at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Password and confirmation do not match");
      return;
    }

    setCreating(true);
    try {
      // Check if a profile already exists with this email before calling the edge function
      const { data: existingProfiles, error: existingError } = await supabase
        .from("profiles")
        .select("id")
        .ilike("email", newEmail.trim());

      if (existingError) {
        console.error("Error checking existing profiles", existingError);
      }

      if (existingProfiles && existingProfiles.length > 0) {
        toast.error("A user with this email address has already been registered");
        return;
      }

      const { data, error } = await supabase.functions.invoke("admin-create-user", {
        body: { email: newEmail, role: newRole, password: newPassword },
      });

      if (error) {
        console.error("admin-create-user error", error, data);
        const apiMessage =
          (data as any)?.error ||
          (typeof error.message === "string" && error.message) ||
          "Failed to create account";
        throw new Error(apiMessage);
      }

      toast.success(
        `Account created for ${data.email}. Password: ${data.password}`,
      );

      setLastTempPassword(data.password ?? null);
      setLastTempEmail(data.email ?? null);

      if (sendWelcome) {
        try {
          await supabase.functions.invoke("send-welcome-email", {
            body: { email: data.email, password: data.password, role: data.role },
          });
          toast.success("Welcome email sent");
        } catch (emailError: any) {
          console.error("Welcome email error", emailError);
          toast.error("Account created, but failed to send welcome email");
        }
      }

      setNewEmail("");
      setNewRole("");
      setNewPassword("");
      setConfirmPassword("");
      fetchUsers();
    } catch (error: any) {
      console.error("Create account error", error);
      toast.error(error.message || "Failed to create account. Check console logs.");
    } finally {
      setCreating(false);
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
              View user IDs, create accounts, and assign roles
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
          <CardTitle>Create Teacher/Student Account</CardTitle>
          <CardDescription>
            Generate a login for a teacher or student; they can later change their password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleCreateAccount}
            className="flex flex-col gap-3 md:grid md:grid-cols-2 md:items-end"
          >
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="new-email">
                Email
              </label>
              <Input
                id="new-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="teacher@example.edu"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="new-role">
                Role
              </label>
              <Select
                value={newRole}
                onValueChange={(value) => setNewRole(value as "teacher" | "student" | "admin")}
              >
                <SelectTrigger id="new-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label
                className="text-xs font-medium text-muted-foreground"
                htmlFor="new-password"
              >
                Password
              </label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Set initial password"
                required
              />
            </div>
            <div className="space-y-1">
              <label
                className="text-xs font-medium text-muted-foreground"
                htmlFor="confirm-password"
              >
                Confirm password
              </label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                required
              />
            </div>
            <div className="flex items-center gap-2 mt-2 md:mt-0">
              <Checkbox
                id="send-welcome"
                checked={sendWelcome}
                onCheckedChange={(val) => setSendWelcome(Boolean(val))}
              />
              <label
                htmlFor="send-welcome"
                className="text-xs text-muted-foreground select-none cursor-pointer"
              >
                Send welcome email
              </label>
            </div>
            <Button
              type="submit"
              className="w-full md:w-auto"
              disabled={creating}
            >
              {creating ? "Creating..." : "Create account"}
            </Button>
          </form>
          <p className="mt-2 text-xs text-muted-foreground">
            The student or teacher will log in on the same login page using this email and
            password. They can change their password later.
          </p>
          {lastTempPassword && lastTempEmail && (
            <div className="mt-3 inline-flex items-center gap-3 rounded-md border px-3 py-2 bg-background/40">
              <div className="space-y-0.5">
                <p className="text-xs font-medium text-muted-foreground">Most recent account</p>
                <p className="text-xs text-muted-foreground">{lastTempEmail}</p>
                <p className="font-mono text-sm">Temporary password: {lastTempPassword}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(lastTempPassword);
                  toast.success("Temporary password copied to clipboard");
                }}
              >
                <ClipboardCopy className="h-4 w-4 mr-1" />
                Copy
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Users ({filteredUsers.length}
            {roleFilter !== "all" && ` of ${users.length}`} )
          </CardTitle>
          <CardDescription>
            Assign roles, verify IDs, and deactivate accounts when needed
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
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((u) => (
                  <TableRow key={u.id} className={u.is_active ? "" : "opacity-60"}>
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
                    <TableCell>
                      <Badge variant={u.is_active ? "secondary" : "outline"}>
                        {u.is_active ? "Active" : "Deactivated"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(u.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="space-x-2">
                      {u.id !== user?.id && (
                        <Button
                          type="button"
                          size="sm"
                          variant={u.is_active ? "outline" : "default"}
                          onClick={async () => {
                            try {
                              const { error } = await supabase
                                .from("profiles")
                                .update({ is_active: !u.is_active })
                                .eq("id", u.id);

                              if (error) throw error;
                              toast.success(
                                u.is_active
                                  ? "User deactivated. They will be signed out on next activity."
                                  : "User reactivated."
                              );
                              fetchUsers();
                            } catch (error: any) {
                              toast.error("Failed to update user status: " + error.message);
                            }
                          }}
                        >
                          {u.is_active ? "Deactivate" : "Reactivate"}
                        </Button>
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
