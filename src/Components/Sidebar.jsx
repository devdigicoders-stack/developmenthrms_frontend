import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import {
    LayoutDashboard, Users, Building2, FolderKanban, ShieldCheck,
    Settings, UserCircle, LogOut, ChevronLeft, Menu, Calendar, IndianRupee, Clock, X, Bell, Briefcase, Palmtree, CalendarDays, UserCheck, FileText, Kanban, TrendingUp, Receipt, AlertCircle, PieChart, Monitor, Laptop
} from "lucide-react";
import { useNotifications } from "../context/NotificationContext";
import { authlogout } from "../modules/auth/services/authService";

const NAV = [
    {
        group: "Main",
        items: [
            { name: "Dashboard", icon: LayoutDashboard, path: "/", permissions: [] },
            { name: "My Offer Letter", icon: FileText, path: "/offer-letter", permissions: [], hideForAdmin: true, hideForClient: true },
            { name: "My NDA", icon: FileText, path: "/nda", permissions: [], clientOnly: true },
            { name: "My Proposal", icon: FileText, path: "/my-proposal", permissions: [], clientOnly: true },
            { name: "My Complaints", icon: AlertCircle, path: "/my-complaints", permissions: ["CREATE_COMPLAINT", "VIEW_COMPLAINT"], hideForSuperAdmin: true },
            { name: "My Tickets", icon: AlertCircle, path: "/my-tickets", permissions: ["RAISE_TICKET", "VIEW_TICKET"], hideForSuperAdmin: true },
            { name: "My Assets", icon: Laptop, path: "/my-assets", permissions: [], hideForClient: true },
            { name: "My Resignation", icon: LogOut, path: "/my-resignation", permissions: [], hideForClient: true },
            { name: "Submit Payment", icon: IndianRupee, path: "/submit-payment", permissions: ["SUBMIT_PAYMENT"] }
        ],
    },
    {
        group: "Organization",
        items: [
            { name: "Companies",   icon: Building2,    path: "/companies",      superAdminOnly: true },
            { name: "Departments", icon: FolderKanban, path: "/departments",    permissions: ["VIEW_DEPARTMENT", "VIEW_ALL_DEPARTMENTS"] },
            { name: "Roles",       icon: ShieldCheck,  path: "/settings/roles", permissions: ["VIEW_ROLE", "VIEW_ALL_ROLES"] },
            { name: "Manage Privacy and Policy", icon: ShieldCheck,  path: "/manage-policies", permissions: ["MANAGE_POLICY"] },
            { name: "View Policy",    icon: FileText,     path: "/policies",       permissions: ["VIEW_POLICY"] },
            { name: "Manage NDA",  icon: ShieldCheck,  path: "/manage-nda",     permissions: ["MANAGE_NDA"] },
            { name: "NDA",         icon: FileText,     path: "/nda",            permissions: ["VIEW_NDA"], hideForClient: true },
            { name: "Manage Complaints", icon: AlertCircle, path: "/manage-complaints", permissions: ["MANAGE_COMPLAINT"] },
            { name: "Manage Tickets", icon: AlertCircle, path: "/manage-tickets", permissions: ["MANAGE_TICKET"] },
            { name: "Assets",      icon: Monitor,      path: "/assets",         permissions: ["MANAGE_ASSETS"] },
            { name: "Employees",   icon: Users,        path: "/users",          permissions: ["VIEW_USER", "VIEW_ALL_USERS"] },
            { name: "Onboarding Approvals", icon: UserCheck, path: "/onboarding-approvals", permissions: ["APPROVE_ONBOARDING", "MANAGE_USER"] },
            { name: "Manage Payments", icon: IndianRupee, path: "/manage-payments", permissions: ["MANAGE_PAYMENTS"] },
        ],
    },
    {
        group: "Projects",
        items: [
            { name: "Projects",         icon: Kanban,     path: "/projects",          permissions: ["VIEW_PROJECT", "VIEW_ALL_PROJECTS"] },
            { name: "Leads",            icon: TrendingUp,  path: "/leads",             permissions: ["VIEW_LEAD", "VIEW_ALL_LEADS"] },
            { name: "Quotes",           icon: Receipt,     path: "/quotes",            permissions: ["VIEW_QUOTE", "VIEW_ALL_QUOTES"] },
        ],
    },
    {
        group: "HR",
        items: [
            { name: "Attendance",       icon: Calendar,    path: "/attendance",        permissions: ["VIEW_ATTENDANCE", "VIEW_ALL_ATTENDANCES", "VIEW_TEAM_ATTENDANCE"] },
            { name: "Work Shifts",      icon: Clock,       path: "/work-shifts",       permissions: ["VIEW_WORKSHIFT", "VIEW_ALL_WORKSHIFTS"] },
            { name: "Employment Status",icon: Briefcase,   path: "/employment-status", permissions: ["VIEW_EMPLOYMENT_STATUS", "VIEW_ALL_EMPLOYMENT_STATUSES"] },
            { name: "Leave Management", icon: Palmtree,    path: "/leave-management",  permissions: ["VIEW_LEAVE", "VIEW_ALL_LEAVES"] },
            { name: "Leave Types",       icon: FileText,    path: "/leave/types",       permissions: ["VIEW_LEAVE_TYPE", "VIEW_ALL_LEAVE_TYPES"] },
            { name: "Assign Leave",     icon: UserCheck,   path: "/leave/assign",      permissions: ["ASSIGN_LEAVE", "BULK_ASSIGN_LEAVE"] },
            { name: "Holidays",         icon: CalendarDays,path: "/leave/holidays",    permissions: ["VIEW_HOLIDAY", "VIEW_ALL_HOLIDAYS"] },
            { name: "Payroll",          icon: IndianRupee, path: "/payroll",           permissions: ["VIEW_PAYROLL", "MANAGE_PAYROLL"] },
            { name: "Exit Management",  icon: LogOut,      path: "/manage-resignations", permissions: ["MANAGE_RESIGNATIONS"] },
        ],
    },
    {
        group: "Reports",
        items: [
            { name: "Attendance Report", icon: CalendarDays, path: "/reports/attendance", permissions: ["VIEW_ALL_ATTENDANCES", "VIEW_TEAM_ATTENDANCE"] },
            { name: "Leave Report", icon: Palmtree, path: "/reports/leave", permissions: ["VIEW_ALL_LEAVES"] },
            { name: "Payroll Report", icon: IndianRupee, path: "/reports/payroll", permissions: ["VIEW_PAYROLL"] },
            { name: "Employee Report", icon: Users, path: "/reports/employees", permissions: ["VIEW_ALL_USERS"] },
        ],
    },
];

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
    const { user, logout } = useStore();
    const navigate = useNavigate();
    const { taskCommentCount } = useNotifications();
    const [collapsed, setCollapsed] = useState(false);
    const permissions = user?.role?.permissions || [];

    const handleLogout = () => { authlogout(); logout(); navigate("/auth/login"); };

    useEffect(() => { if (!user || !user.role) handleLogout(); }, [user]);
    useEffect(() => {
        const fn = (e) => { if (e.key === "Escape") setMobileOpen(false); };
        window.addEventListener("keydown", fn);
        return () => window.removeEventListener("keydown", fn);
    }, []);

    const isSuperAdmin = user?.role?.name === "super_admin";
    const isAdmin = user?.role?.name === "admin" || isSuperAdmin;
    const isClient = user?.role?.name?.toLowerCase() === "client";
    
    const canSeeItem = (item) => {
        if (item.hideForAdmin && isAdmin) return false;
        if (item.hideForSuperAdmin && isSuperAdmin) return false;
        if (item.hideForClient && isClient) return false;
        if (item.clientOnly && !isClient) return false;
        if (item.superAdminOnly) return isSuperAdmin;
        if (item.adminOnly) return isAdmin;
        const perms = item.permissions || [];
        return isSuperAdmin || !perms.length || perms.some(p => permissions.includes(p));
    };
    const initials = `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase();
    const close = () => setMobileOpen(false);

    return (
        <>
            {/* Mobile overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={close} />
            )}

            <aside className={`
                fixed top-0 left-0 z-50 h-screen bg-slate-900 text-white flex flex-col
                transition-all duration-300 ease-in-out
                ${collapsed ? "w-[70px]" : "w-64"}
                ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
                md:translate-x-0 md:static md:flex
            `}>
                {/* Logo */}
                <div className={`flex items-center h-16 px-4 border-b border-slate-700/50 ${collapsed ? "justify-center" : "justify-between"}`}>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
                            {user?.companyId?.icon?.url
                                ? <img src={user.companyId.icon.url} alt="logo" className="w-full h-full object-cover" />
                                : <span>HR</span>}
                        </div>
                        {!collapsed && (
                            <span className="font-bold text-base tracking-tight text-white">HRMS</span>
                        )}
                    </div>
                    {!collapsed && (
                        <button
                            onClick={() => window.innerWidth < 768 ? close() : setCollapsed(c => !c)}
                            className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition"
                        >
                            {window.innerWidth < 768 ? <X size={18} /> : <ChevronLeft size={18} />}
                        </button>
                    )}
                    {collapsed && (
                        <button
                            onClick={() => setCollapsed(false)}
                            className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition mt-1"
                        >
                            <Menu size={18} />
                        </button>
                    )}
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5 no-scrollbar">
                    {NAV.map(section => {
                        const visible = section.items.filter(canSeeItem);
                        if (!visible.length) return null;
                        return (
                            <div key={section.group}>
                                {!collapsed && (
                                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 px-3 mb-1">
                                        {section.group}
                                    </p>
                                )}
                                <div className="space-y-0.5">
                                    {visible.map(item => (
                                        <NavLink key={item.path} to={item.path} end={item.path === "/"} onClick={close}
                                            className={({ isActive }) =>
                                                `relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all
                                                ${isActive ? "bg-blue-600 text-white font-medium" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`
                                            }>
                                            <item.icon size={18} className="shrink-0" />
                                            {!collapsed && (
                                                <span className="truncate flex-1">{item.name}</span>
                                            )}
                                            {!collapsed && item.path === "/projects" && taskCommentCount > 0 && (
                                                <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0 animate-pulse" />
                                            )}
                                            {collapsed && item.path === "/projects" && taskCommentCount > 0 && (
                                                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-400" />
                                            )}
                                        </NavLink>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-2 border-t border-slate-700/50 space-y-0.5">
                    <NavLink to="/profile" onClick={close}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all
                            ${isActive ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`
                        }>
                        <UserCircle size={18} className="shrink-0" />
                        {!collapsed && <span>Profile</span>}
                    </NavLink>
                    <NavLink to="/notifications" onClick={close}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all
                            ${isActive ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`
                        }>
                        <Bell size={18} className="shrink-0" />
                        {!collapsed && <span>Notifications</span>}
                    </NavLink>
                    <NavLink to="/settings" onClick={close}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all
                            ${isActive ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`
                        }>
                        <Settings size={18} className="shrink-0" />
                        {!collapsed && <span>Settings</span>}
                    </NavLink>
                    <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-red-600/20 hover:text-red-400 transition-all">
                        <LogOut size={18} className="shrink-0" />
                        {!collapsed && <span>Logout</span>}
                    </button>

                    {!collapsed && (
                        <div className="flex items-center gap-3 px-3 py-2.5 mt-1 rounded-lg bg-slate-800">
                            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
                                {initials}
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-medium text-white truncate">{user?.firstName} {user?.lastName}</p>
                                <p className="text-[10px] text-slate-400 truncate">{user?.role?.name}</p>
                            </div>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
