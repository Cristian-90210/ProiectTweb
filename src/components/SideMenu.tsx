import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, User, Users, BookOpen, LayoutDashboard, X, LogOut, UserCircle, CreditCard, Calendar, Trophy, ClipboardList, Megaphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';
import clsx from 'clsx';

interface SideMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const { logout, user } = useAuth();

    // Public menu: landing page links only when NOT logged in
    // Authenticated: role-specific dashboard + relevant links
    const links = user
        ? [
            ...(user.role === 'student' ? [
                { to: '/student', label: t('header.dashboard'), icon: LayoutDashboard },
                { to: '/student/profile', label: t('dropdown.my_profile', { defaultValue: 'My Profile' }), icon: UserCircle },
                { to: '/student/subscription', label: t('dropdown.my_subscription', { defaultValue: 'My Subscription' }), icon: CreditCard },
                { to: '/student/schedule', label: t('dropdown.schedule', { defaultValue: 'Schedule' }), icon: Calendar },
                { to: '/student/results', label: t('dropdown.results', { defaultValue: 'Results' }), icon: Trophy },
            ] : []),
            ...(user.role === 'coach' ? [
                { to: '/coach', label: t('header.dashboard'), icon: LayoutDashboard },
                { to: '/coach/profile', label: t('dropdown.my_profile', { defaultValue: 'My Profile' }), icon: UserCircle },
                { to: '/coach/schedule', label: t('dropdown.training_schedule', { defaultValue: 'Training Schedule' }), icon: Calendar },
                { to: '/coach/attendance', label: t('dropdown.attendance', { defaultValue: 'Attendance' }), icon: ClipboardList },
                { to: '/coach/results', label: t('dropdown.student_results', { defaultValue: 'Student Results' }), icon: Trophy },
            ] : []),
            ...(user.role === 'admin' ? [
                { to: '/admin', label: t('header.dashboard'), icon: LayoutDashboard },
                { to: '/admin/users', label: t('dropdown.manage_users', { defaultValue: 'Manage Users' }), icon: Users },
                { to: '/admin/reservations', label: t('dropdown.reservations', { defaultValue: 'Reservations' }), icon: BookOpen },
                { to: '/admin/announcements', label: t('dropdown.announcements', { defaultValue: 'Announcements' }), icon: Megaphone },
                { to: '/courses', label: t('header.courses'), icon: BookOpen },
                { to: '/coaches', label: t('header.coaches', { defaultValue: 'Coaches' }), icon: User },
                { to: '/students', label: t('header.students'), icon: Users },
            ] : []),
        ]
        : [
            { to: '/', label: t('header.home'), icon: Home },
            { to: '/courses', label: t('header.courses'), icon: BookOpen },
            { to: '/coaches', label: t('header.our_team'), icon: User },
        ];

    return (
        <>
            {/* Backdrop */}
            <div
                className={clsx(
                    "fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            {/* Sidebar Drawer */}
            <aside
                className={clsx(
                    "fixed top-0 left-0 w-64 h-full bg-white dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <Logo className="h-8 w-8 text-host-blue" />
                        <span className="font-bold text-gray-800 dark:text-white">Menu</span>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Profile Card */}
                {user && (
                    <div className="p-5 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900">
                        <div className="flex items-center space-x-3">
                            <img
                                src={user.avatar || `https://ui-avatars.com/api/?background=0ea5e9&color=fff&name=${encodeURIComponent(user.name)}`}
                                alt={user.name}
                                className="w-12 h-12 rounded-full object-cover ring-2 ring-host-cyan/30 shadow"
                            />
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold text-gray-800 dark:text-white truncate">{user.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                                <span className="mt-1 inline-block text-[10px] font-bold uppercase tracking-widest text-host-cyan bg-host-cyan/10 px-2 py-0.5 rounded-full">
                                    {user.role}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {links.map((link: any) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            onClick={onClose}
                            className={({ isActive }) => clsx(
                                "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200",
                                isActive
                                    ? "bg-host-cyan/10 text-host-cyan font-bold"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-host-blue"
                            )}
                        >
                            <link.icon size={20} />
                            <span>{link.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Footer Actions */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
                    {user ? (
                        <button
                            onClick={() => { logout(); onClose(); }}
                            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 w-full transition-colors"
                        >
                            <LogOut size={20} />
                            <span>{t('header.logout')}</span>
                        </button>
                    ) : (
                        <NavLink
                            to="/login"
                            onClick={onClose}
                            style={{ borderRadius: '9999px' }}
                            className="btn-pill flex items-center justify-center w-full bg-host-gradient text-white font-bold py-3 shadow-lg hover:shadow-cyan-500/20 transition-all"
                        >
                            {t('header.login')}
                        </NavLink>
                    )}
                </div>
            </aside>
        </>
    );
};
