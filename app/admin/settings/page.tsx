"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Moon,
  Sun,
  Monitor,
  Code,
  Database,
  Palette,
  Server,
  Zap,
} from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar";
import { useAdminTheme, type Theme } from "@/app/providers/AdminThemeProvider";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { theme, setTheme } = useAdminTheme();
  const currentPath = usePathname();
  const router = useRouter();

  // Tech stack information
  const techStack = [
    {
      category: "Frontend",
      icon: Code,
      color: "text-blue-600",
      items: [
        { name: "Next.js", version: "16.1.6", description: "React framework" },
        { name: "React", version: "19.2.3", description: "UI library" },
        { name: "React DOM", version: "19.2.3", description: "DOM renderer" },
        { name: "TypeScript", version: "^5", description: "Type safety" },
        {
          name: "Tailwind CSS",
          version: "4",
          description: "Styling framework",
        },
      ],
    },
    {
      category: "UI Components",
      icon: Palette,
      color: "text-purple-600",
      items: [
        {
          name: "Radix UI",
          version: "1.4.3",
          description: "Headless components",
        },
        {
          name: "@radix-ui/react-dialog",
          version: "1.1.15",
          description: "Dialog components",
        },
        {
          name: "@radix-ui/react-popover",
          version: "1.1.15",
          description: "Popover components",
        },
        {
          name: "Lucide React",
          version: "0.563.0",
          description: "Icon library",
        },
        {
          name: "shadcn/ui",
          version: "3.8.4",
          description: "Component library",
        },
        {
          name: "class-variance-authority",
          version: "0.7.1",
          description: "Component variants",
        },
        { name: "cmdk", version: "1.1.1", description: "Command menu" },
        { name: "vaul", version: "1.1.2", description: "Drawer/modal" },
      ],
    },
    {
      category: "Backend & Database",
      icon: Database,
      color: "text-green-600",
      items: [
        {
          name: "NextAuth.js",
          version: "4.24.13",
          description: "Authentication",
        },
        { name: "Supabase", version: "2.95.3", description: "Database & Auth" },
        { name: "bcryptjs", version: "3.0.3", description: "Password hashing" },
        { name: "nodemailer", version: "7.0.7", description: "Email sending" },
      ],
    },
    {
      category: "PDF & Media",
      icon: Zap,
      color: "text-orange-600",
      items: [
        {
          name: "@react-pdf/renderer",
          version: "4.3.2",
          description: "PDF generation",
        },
        {
          name: "tw-animate-css",
          version: "1.4.0",
          description: "Tailwind animations",
        },
      ],
    },
    {
      category: "Utilities",
      icon: Zap,
      color: "text-indigo-600",
      items: [
        { name: "Axios", version: "1.13.5", description: "HTTP client" },
        { name: "clsx", version: "2.1.1", description: "Utility classes" },
        {
          name: "tailwind-merge",
          version: "3.4.0",
          description: "Tailwind merging",
        },
      ],
    },
  ];

  const applyTheme = (selectedTheme: Theme) => {
    const root = document.documentElement;

    if (selectedTheme === "dark") {
      root.classList.add("dark");
    } else if (selectedTheme === "light") {
      root.classList.remove("dark");
    } else {
      // System theme
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  };

  useEffect(() => {
    // Apply theme on mount and when theme changes
    applyTheme(theme);
  }, [theme]);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem("admin-theme", newTheme);
    applyTheme(newTheme);
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen bg-background flex">
        <AdminSidebar
          user={null}
          sidebarOpen={false}
          setSidebarOpen={() => {}}
          onLogout={() => {}}
          onNavigate={() => {}}
          isCollapsed={false}
          onToggleCollapse={() => {}}
          currentPath="/admin/settings"
        />
        <div className="flex-1 lg:ml-64">
          <div className="p-6">
            <div className="animate-pulse">
              <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar
        user={{
          id: session.user.id,
          name: session.user.name || "",
          email: session.user.email || "",
          role: session.user.role || "user",
        }}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={handleLogout}
        onNavigate={(href: string) => router.push(href)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        currentPath={currentPath}
      />

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${isCollapsed ? "lg:ml-16" : "lg:ml-64"} lg:pt-0 pt-16`}
      >
        <main className="p-8">
          <div className="mb-10">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your admin preferences and view system information
            </p>
          </div>

          <div className="space-y-8 p-5">
            {/* Theme Settings */}
            <Card className="pt-5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Appearance
                </CardTitle>
                <CardDescription>
                  Choose your preferred theme for the admin interface
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    className="flex items-center gap-2 h-12 p-3"
                    onClick={() => handleThemeChange("light")}
                  >
                    <Sun className="h-4 w-4" />
                    <div className="text-left">
                      <div className="font-medium text-sm">Light</div>
                      <div className="text-xs text-muted-foreground">
                        Bright and clean
                      </div>
                    </div>
                  </Button>

                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    className="flex items-center gap-2 h-12 p-3"
                    onClick={() => handleThemeChange("dark")}
                  >
                    <Moon className="h-4 w-4" />
                    <div className="text-left">
                      <div className="font-medium text-sm">Dark</div>
                      <div className="text-xs text-muted-foreground">
                        Easy on the eyes
                      </div>
                    </div>
                  </Button>

                  <Button
                    variant={theme === "system" ? "default" : "outline"}
                    className="flex items-center gap-2 h-12 p-3"
                    onClick={() => handleThemeChange("system")}
                  >
                    <Monitor className="h-4 w-4" />
                    <div className="text-left">
                      <div className="font-medium text-sm">System</div>
                      <div className="text-xs text-muted-foreground">
                        Follow OS preference
                      </div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tech Stack Information */}
            <Card className="pt-5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Technology Stack
                </CardTitle>
                <CardDescription>
                  Technologies and libraries used in this project
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {techStack.map((category) => (
                    <div key={category.category} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <category.icon
                          className={`h-5 w-5 ${category.color}`}
                        />
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {category.category}
                        </h3>
                      </div>
                      <div className="space-y-2 max-h-90 overflow-y-auto scrollbar-hide ">
                        {category.items.map((item) => (
                          <div
                            key={item.name}
                            className="flex items-center justify-between p-3 bg-background rounded-lg"
                          >
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {item.name}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {item.description}
                              </div>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {item.version}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Information */}
            <Card className="pt-5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  System Information
                </CardTitle>
                <CardDescription>
                  Current system status and information
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        Environment
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Current deployment environment
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-green-600 border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800"
                    >
                      Development
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        Admin Panel
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Custom Product Designer Admin
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800"
                    >
                      v1.0.0
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
