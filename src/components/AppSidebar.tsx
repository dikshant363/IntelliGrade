import { Home, Users, ClipboardList, FileText, LogOut, GraduationCap, Settings } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

export function AppSidebar() {
  const { role, signOut } = useAuth();
  const { open } = useSidebar();

  const adminItems = [
    { title: "Dashboard", url: "/admin/dashboard", icon: Home },
    { title: "User Management", url: "/admin/users", icon: Users },
    { title: "Rubric Oversight", url: "/admin/evaluation-config", icon: ClipboardList },
    { title: "System Overview", url: "/admin/system-overview", icon: Settings },
    { title: "System Monitoring", url: "/admin/system-monitoring", icon: FileText },
    { title: "System Utilities", url: "/admin/system-utilities", icon: ClipboardList },
  ];

  const teacherItems = [
    { title: "Dashboard", url: "/teacher/dashboard", icon: Home },
    { title: "Rubric Management", url: "/teacher/rubrics", icon: ClipboardList },
    { title: "Submission Review", url: "/teacher/submissions", icon: FileText },
    { title: "Finalization", url: "/teacher/finalization", icon: ClipboardList },
    { title: "Analytics", url: "/teacher/analytics", icon: ClipboardList },
    { title: "Settings", url: "/teacher/settings", icon: Settings },
  ];

  const studentItems = [
    { title: "Dashboard", url: "/student/dashboard", icon: Home },
    { title: "Report Submission", url: "/student/report-submission", icon: FileText },
    { title: "Evaluation Results", url: "/student/results", icon: ClipboardList },
    { title: "Download", url: "/student/download", icon: FileText },
    { title: "Settings", url: "/student/settings", icon: Settings },
  ];

  let items = studentItems;
  if (role === "admin") items = adminItems;
  if (role === "teacher") items = teacherItems;

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="p-4 border-b border-sidebar-border flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-primary" />
          {open && <span className="font-bold text-lg">IntelliGrade</span>}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <Button
          variant="ghost"
          size={open ? "default" : "icon"}
          onClick={signOut}
          className="w-full justify-start"
        >
          <LogOut className="h-4 w-4" />
          {open && <span className="ml-2">Sign Out</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
