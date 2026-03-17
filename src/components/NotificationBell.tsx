import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, CheckCheck, Trash2, Info, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationsContext';
import type { AppNotification, NotificationType } from '../types';

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatRelativeTime(isoString: string): string {
    const diff = (Date.now() - new Date(isoString).getTime()) / 1000; // seconds
    if (diff < 60) return 'acum câteva secunde';
    if (diff < 3600) return `acum ${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `acum ${Math.floor(diff / 3600)}h`;
    return `acum ${Math.floor(diff / 86400)}z`;
}

const typeConfig: Record<NotificationType, { icon: React.ReactNode; bg: string; border: string; iconColor: string }> = {
    info:    { icon: <Info size={16} />,          bg: 'bg-blue-50 dark:bg-blue-900/20',    border: 'border-blue-200 dark:border-blue-800',   iconColor: 'text-blue-500' },
    success: { icon: <CheckCircle size={16} />,   bg: 'bg-green-50 dark:bg-green-900/20',  border: 'border-green-200 dark:border-green-800', iconColor: 'text-green-500' },
    warning: { icon: <AlertTriangle size={16} />, bg: 'bg-yellow-50 dark:bg-yellow-900/20',border: 'border-yellow-300 dark:border-yellow-700',iconColor: 'text-yellow-500' },
    alert:   { icon: <AlertCircle size={16} />,   bg: 'bg-red-50 dark:bg-red-900/20',      border: 'border-red-200 dark:border-red-800',     iconColor: 'text-red-500' },
};

// ── Single notification item ─────────────────────────────────────────────────

const NotificationItem: React.FC<{
    notif: AppNotification;
    onRead: (id: string) => void;
    onNavigate: (link?: string) => void;
}> = ({ notif, onRead, onNavigate }) => {
    const cfg = typeConfig[notif.type];

    const handleClick = () => {
        onRead(notif.id);
        if (notif.link) {
            onNavigate(notif.link);
        }
    };

    return (
        <div
            onClick={handleClick}
            className={`relative flex gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-700/60 last:border-none transition-all duration-200
                ${notif.link ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/40' : 'cursor-default'}
                ${notif.read ? 'opacity-60' : ''}
            `}
        >
            {/* Unread dot */}
            {!notif.read && (
                <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-host-cyan animate-pulse" />
            )}

            {/* Type icon */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${cfg.bg} border ${cfg.border} ${cfg.iconColor}`}>
                {cfg.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                    {notif.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed line-clamp-2">
                    {notif.message}
                </p>
                <div className="flex items-center gap-2 mt-1">
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">
                        {formatRelativeTime(notif.timestamp)}
                    </p>
                    {notif.link && (
                        <span className="text-[10px] text-host-cyan font-medium">→ Vezi detalii</span>
                    )}
                </div>
            </div>
        </div>
    );
};


// ── Main Bell component ──────────────────────────────────────────────────────

export const NotificationBell: React.FC = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const handleNavigate = (link?: string) => {
        setOpen(false);
        if (link) {
            navigate(link);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        if (open) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    return (
        <div ref={containerRef} className="relative">
            {/* Bell button */}
            <button
                onClick={() => setOpen(prev => !prev)}
                className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-host-cyan transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                title="Notificări"
                aria-label={`Notificări${unreadCount > 0 ? `, ${unreadCount} necitite` : ''}`}
            >
                <Bell size={20} className={open ? 'text-host-cyan' : ''} />

                {/* Unread badge */}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-200">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown panel */}
            {open && (
                <div
                    className="absolute right-0 top-full mt-2 w-[360px] max-w-[90vw] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden
                        animate-in slide-in-from-top-2 fade-in duration-200"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                            <Bell size={16} className="text-host-cyan" />
                            <span className="text-sm font-bold text-gray-800 dark:text-gray-100">Notificări</span>
                            {unreadCount > 0 && (
                                <span className="bg-host-cyan/20 text-host-cyan text-xs font-bold px-2 py-0.5 rounded-full">
                                    {unreadCount} noi
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="p-1.5 text-gray-400 hover:text-host-cyan transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                                    title="Marchează toate ca citite"
                                >
                                    <CheckCheck size={15} />
                                </button>
                            )}
                            {notifications.length > 0 && (
                                <button
                                    onClick={clearAll}
                                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                                    title="Șterge toate"
                                >
                                    <Trash2 size={15} />
                                </button>
                            )}
                            <button
                                onClick={() => setOpen(false)}
                                className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                                title="Închide"
                            >
                                <X size={15} />
                            </button>
                        </div>
                    </div>

                    {/* Notifications list */}
                    <div className="overflow-y-auto max-h-[400px]">
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                                <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                                    <Bell size={24} className="text-gray-300 dark:text-gray-600" />
                                </div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Nicio notificare</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Ești la curent cu tot!</p>
                            </div>
                        ) : (
                            notifications.map(notif => (
                                <NotificationItem key={notif.id} notif={notif} onRead={markAsRead} onNavigate={handleNavigate} />
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                            <p className="text-xs text-center text-gray-400 dark:text-gray-500">
                                {notifications.length} notific{notifications.length === 1 ? 'are' : 'ări'} total · click pentru a citi
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
