"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Menu } from "lucide-react";
import AdminSidebar from '../../components/AdminSidebar'
import CustomerPagePreview from '../../../components/CustomerPagePreview'

export default function CustomersPage() {
    const { data: session, status } = useSession();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();
    const currentPath = usePathname();

    useEffect(() => {
        if (status === 'loading') return;
        
        if (!session || session.user?.role !== 'admin') {
            router.push("/login");
            return;
        }
    }, [session, status, router]);

    const handleLogout = async () => {
        await signOut({ redirect: false });
        router.push("/login");
    };

    const [refreshCounter, setRefreshCounter] = useState(0);

    const handleRefresh = () => {
        setRefreshing(true);
        setRefreshCounter(prev => prev + 1);
        setTimeout(() => setRefreshing(false), 1000);
    };

    if (status === 'loading' || !session) {
        return (
            <div className="min-h-screen bg-gray-50 flex">
                <AdminSidebar
                    user={null}
                    sidebarOpen={false}
                    setSidebarOpen={() => { }}
                    onLogout={() => { }}
                    onNavigate={() => { }}
                    isCollapsed={false}
                    onToggleCollapse={() => { }}
                    currentPath="/admin/customers"
                />
                <div className="flex-1 lg:ml-64">
                    <div className="p-8">
                        <div className="animate-pulse">
                            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <AdminSidebar
                user={{
                    id: session.user.id,
                    name: session.user.name || '',
                    email: session.user.email || '',
                    role: session.user.role || 'user'
                }}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                onLogout={handleLogout}
                onNavigate={(href: string) => router.push(href)}
                isCollapsed={isCollapsed}
                onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
                currentPath={currentPath}
            />

            <header className="bg-white shadow-sm border-b lg:hidden fixed top-0 left-0 right-0 z-40 px-4">
                <div className="relative flex items-center justify-center h-16">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSidebarOpen(true)}
                        className="absolute left-0"
                    >
                        <Menu className="h-4 w-4" />
                    </Button>
                    <h1 className="text-lg font-bold tracking-tight text-gray-900">Print Pro</h1>
                </div>
            </header>

            <div
                className={`flex-1 w-full overflow-x-hidden min-w-0 transition-all duration-300 ${isCollapsed ? "lg:ml-16" : "lg:ml-64"} lg:pt-0 pt-16`}
            >
                <div className="p-4 sm:p-6 lg:p-8">
                    {/* Header */}
                    <div className="flex flex-row items-center justify-between gap-4 mb-6 sm:mb-8">
                        <div>
                            <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Customers</h1>
                            <p className="text-xs lg:text-base text-gray-600 mt-1 sm:mt-2">
                                View customer accounts, contact information, and purchase history.
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="rounded-full h-8 w-8 sm:h-10 sm:w-10 text-gray-400 hover:bg-gray-200 hover:text-gray-900 transition-colors shrink-0"
                        >
                            <RefreshCw
                                className={`h-4 w-4 sm:h-5 sm:w-5 ${refreshing ? "animate-spin" : ""}`}
                            />
                            <span className="sr-only">Refresh</span>
                        </Button>
                    </div>

                    <CustomerPagePreview key={refreshCounter} />
                </div>
            </div>
        </div>
    );
}
