import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    UserCircle,
    Settings,
    LogOut,
    X
} from 'lucide-react';
import { clsx } from 'clsx';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth();
    const isAdmin = user?.role === UserRole.Admin;

    const links = [
        { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/courses', icon: GraduationCap, label: 'Courses' },
        // Only verify admin access for these if needed, but per requirements user sees Dashboard & Courses.
        // For now I'll show Coaches/Students to everyone or filter based on role as per Requirement 9.
        // Req 9: "user vede doar Dashboard și Cursuri".
        ...(isAdmin ? [
            { to: '/coaches', icon: UserCircle, label: 'Coaches' },
            { to: '/students', icon: Users, label: 'Students' },
            { to: '/admin', icon: Settings, label: 'Admin Profile' },
        ] : []),
    ];

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={clsx(
                    "fixed inset-0 z-20 bg-black/50 transition-opacity lg:hidden",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            {/* Sidebar */}
            <div className={clsx(
                "fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                        Atlantis SwimSchool
                    </span>
                    <button onClick={onClose} className="lg:hidden p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                        <X size={20} />
                    </button>
                </div>

                <nav className="p-4 space-y-1">
                    {links.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            onClick={() => window.innerWidth < 1024 && onClose()}
                            className={({ isActive }) => clsx(
                                "flex items-center px-4 py-3 text-[15px] font-medium rounded-lg transition-colors",
                                isActive
                                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"
                            )}
                        >
                            <link.icon className="w-5 h-5 mr-3" />
                            {link.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={logout}
                        className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        Sign Out
                    </button>
                </div>
            </div>
        </>
    );
};
