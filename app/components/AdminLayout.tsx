"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import { AdminThemeProvider } from "@/contexts/AdminThemeContext";

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export default function AdminLayout({ children, title, description }: AdminLayoutProps) {
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const currentPath = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  const handleNavigate = (href: string) => {
    router.push(href);
  };

  if (status === "loading" || !session) {
    return (
      <AdminThemeProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
          <AdminSidebar
            user={null}
            sidebarOpen={false}
            setSidebarOpen={() => {}}
            onLogout={() => {}}
            onNavigate={() => {}}
            isCollapsed={false}
            onToggleCollapse={() => {}}
            currentPath={currentPath}
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
      </AdminThemeProvider>
    );
  }

  if (session.user?.role !== "admin") {
    router.push("/login");
    return null;
  }

  return (
    <AdminThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
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
          onNavigate={handleNavigate}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          currentPath={currentPath}
        />

        {/* Mobile Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b lg:hidden fixed top-0 left-0 right-0 z-40 px-4">
          <div className="relative flex items-center justify-center h-16">
            <button
              onClick={() => setSidebarOpen(true)}
              className="absolute left-0 p-2"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">Print Pro</h1>
          </div>
        </header>

        {/* Main Content */}
        <div
          className={`flex-1 transition-all duration-300 ${isCollapsed ? "lg:ml-16" : "lg:ml-64"} lg:pt-0 pt-16`}
        >
          <main className="p-6">
            {(title || description) && (
              <div className="mb-8">
                {title && <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{title}</h1>}
                {description && <p className="text-gray-600 dark:text-gray-400">{description}</p>}
              </div>
            )}
            {children}
          </main>
        </div>
      </div>
    </AdminThemeProvider>
  );
}
