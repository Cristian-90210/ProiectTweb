import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockBookings, mockCoaches, mockCourses, mockSubscriptions, subscriptionPlans } from '../data/mockData';
import { Calendar, Clock, User, ArrowRight, CheckCircle, XCircle, RotateCcw, Trophy, MessageCircle, Send, CreditCard, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { PageHeader } from '../components/PageHeader';
import { useTranslation } from 'react-i18next';
import type { AttendanceRecord, SwimmingResult, Message, RecoveryCredit, RecoveryRequest } from '../types';
import { attendanceService, resultsService, messageService, recoveryService, recoveryRequestService } from '../services/api';

export const StudentDashboard: React.FC = () => {
    const { user } = useAuth();
    const { t, i18n } = useTranslation();

    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [results, setResults] = useState<SwimmingResult[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [selectedReceiver, setSelectedReceiver] = useState('c1');
    const [activeTab, setActiveTab] = useState<'bookings' | 'attendance' | 'results' | 'recovery' | 'messages'>('bookings');
    const [attendanceMonth, setAttendanceMonth] = useState(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    });
    const [attendanceMonthInitialized, setAttendanceMonthInitialized] = useState(false);
    const [savingAttendanceDate, setSavingAttendanceDate] = useState<string | null>(null);
    const [attendanceFeedback, setAttendanceFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [recoveryCredits, setRecoveryCredits] = useState<RecoveryCredit[]>([]);
    const [recoveryRequests, setRecoveryRequests] = useState<RecoveryRequest[]>([]);
    const [recoveryMonth, setRecoveryMonth] = useState(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    });
    const [selectedRecoveryDate, setSelectedRecoveryDate] = useState<string | null>(null);
    const [recoveryFeedback, setRecoveryFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [isSubmittingRecoveryRequest, setIsSubmittingRecoveryRequest] = useState(false);

    useEffect(() => {
        if (user) {
            attendanceService.getByStudent(user.id).then(setAttendance);
            resultsService.getByStudent(user.id).then(setResults);
            messageService.getByUser(user.id).then(setMessages);
            recoveryService.getByStudent(user.id).then(setRecoveryCredits);
            recoveryRequestService.getByStudent(user.id).then(setRecoveryRequests);
        }
    }, [user]);

    const myBookings = useMemo(() => {
        return mockBookings.filter(b => b.studentId === user?.id).map(b => {
            const course = mockCourses.find(c => c.id === b.courseId);
            const coach = mockCoaches.find(c => c.id === b.coachId);
            return { ...b, course, coach };
        });
    }, [user]);

    const upcoming = myBookings.filter(b => b.status === 'upcoming');
    const activeRecoveryCredits = recoveryCredits.filter(c => c.status === 'active');
    const pendingRecoveryRequests = recoveryRequests.filter(r => r.status === 'pending');
    const confirmedRecoveryRequests = recoveryRequests.filter(r => r.status === 'confirmed');
    const usedRecoveryCredits = pendingRecoveryRequests.length + confirmedRecoveryRequests.length;
    const availableRecoveryCredits = Math.max(0, activeRecoveryCredits.length - usedRecoveryCredits);

    const mySubscription = mockSubscriptions.find(s => s.studentId === user?.id);
    const matchedPlan = mySubscription ? subscriptionPlans.find(p => p.id === mySubscription.planId) : null;
    const sessionsRemaining = mySubscription ? mySubscription.sessionsTotal - mySubscription.sessionsUsed : 0;
    const sessionProgress = mySubscription ? (mySubscription.sessionsUsed / mySubscription.sessionsTotal) * 100 : 0;

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !user) return;
        const receiver = mockCoaches.find(c => c.id === selectedReceiver);
        const sent = await messageService.send({
            senderId: user.id,
            senderName: user.name,
            receiverId: selectedReceiver,
            receiverName: receiver?.name || 'Admin',
            content: newMessage,
        });
        setMessages(prev => [...prev, sent]);
        setNewMessage('');
    };

    const handleMarkAbsent = async (bookingId: string, date: string) => {
        if (!user) return;
        const record = await attendanceService.mark({
            bookingId,
            studentId: user.id,
            date,
            status: 'absent',
            markedBy: user.id,
            confirmed: false,
            submittedByStudent: true,
        });
        setAttendance(prev => {
            const withoutSameDate = prev.filter(a => a.date !== date);
            return [record, ...withoutSameDate];
        });
    };

    const handleMarkMyAttendanceForDate = async (date: string, bookingId: string, status: AttendanceRecord['status']) => {
        if (!user) return;

        setSavingAttendanceDate(date);
        const record = await attendanceService.mark({
            bookingId,
            studentId: user.id,
            date,
            status,
            markedBy: user.id,
            confirmed: false,
            submittedByStudent: true,
        });

        setAttendance(prev => {
            const withoutSameDate = prev.filter(a => a.date !== date);
            return [record, ...withoutSameDate];
        });
        setSavingAttendanceDate(null);
        setAttendanceFeedback({ type: 'success', message: t('student_dashboard.attendance.saved_success') });
    };

    const locale = i18n.language === 'ro' ? 'ro-RO' : i18n.language === 'ru' ? 'ru-RU' : 'en-US';

    const getAttendanceStatusClass = (status: AttendanceRecord['status']) => {
        if (status === 'present') return 'bg-green-100 text-green-700';
        if (status === 'absent') return 'bg-red-100 text-red-700';
        if (status === 'absent_medical') return 'bg-orange-100 text-orange-700';
        if (status === 'late') return 'bg-blue-100 text-blue-700';
        return 'bg-yellow-100 text-yellow-700';
    };

    const getAttendanceStatusLabel = (status: AttendanceRecord['status']) => {
        if (status === 'present') return t('student_dashboard.attendance.present');
        if (status === 'absent') return t('student_dashboard.attendance.absent');
        if (status === 'absent_medical') return t('student_dashboard.attendance.absent_medical');
        if (status === 'late') return t('student_dashboard.attendance.late');
        return t('student_dashboard.attendance.recovery');
    };

    const attendanceStatusOptions = [
        { value: 'present' as const, label: t('student_dashboard.attendance.present') },
        { value: 'absent' as const, label: t('student_dashboard.attendance.absent') },
        { value: 'absent_medical' as const, label: t('student_dashboard.attendance.absent_medical') },
        { value: 'late' as const, label: t('student_dashboard.attendance.late') },
        { value: 'recovery' as const, label: t('student_dashboard.attendance.recovery') },
    ];

    const getAttendanceSelectClass = (status?: AttendanceRecord['status']) => clsx(
        "w-full text-[11px] py-1.5 px-2 rounded border font-semibold outline-none transition-colors disabled:opacity-60 dark:bg-gray-700",
        status === 'present' && "border-green-300 text-green-700 dark:text-green-300",
        status === 'absent' && "border-red-300 text-red-700 dark:text-red-300",
        status === 'absent_medical' && "border-orange-300 text-orange-700 dark:text-orange-300",
        status === 'late' && "border-blue-300 text-blue-700 dark:text-blue-300",
        status === 'recovery' && "border-yellow-300 text-yellow-700 dark:text-yellow-300",
        !status && "border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200"
    );

    const trainingBookings = useMemo(() => {
        return myBookings.filter(b => b.status !== 'cancelled');
    }, [myBookings]);

    const trainingsByDate = useMemo(() => {
        const grouped = new Map<string, typeof trainingBookings>();
        trainingBookings.forEach(booking => {
            const existing = grouped.get(booking.date) ?? [];
            grouped.set(booking.date, [...existing, booking]);
        });
        return grouped;
    }, [trainingBookings]);

    const attendanceByDate = useMemo(() => {
        const grouped = new Map<string, AttendanceRecord>();
        attendance.forEach(record => {
            grouped.set(record.date, record);
        });
        return grouped;
    }, [attendance]);

    const weekdays = useMemo(() => {
        const monday = new Date(2026, 0, 5);
        return Array.from({ length: 7 }, (_, i) =>
            new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i).toLocaleDateString(locale, { weekday: 'short' })
        );
    }, [locale]);

    const daysInCalendarMonth = useMemo(() => {
        const year = attendanceMonth.getFullYear();
        const month = attendanceMonth.getMonth();
        return new Date(year, month + 1, 0).getDate();
    }, [attendanceMonth]);

    const firstDayOffset = useMemo(() => {
        const firstDay = new Date(attendanceMonth.getFullYear(), attendanceMonth.getMonth(), 1).getDay();
        return firstDay === 0 ? 6 : firstDay - 1;
    }, [attendanceMonth]);

    const monthLabel = attendanceMonth.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
    const recoveryMonthLabel = recoveryMonth.toLocaleDateString(locale, { month: 'long', year: 'numeric' });

    const recoveryDaysInMonth = useMemo(() => {
        const year = recoveryMonth.getFullYear();
        const month = recoveryMonth.getMonth();
        return new Date(year, month + 1, 0).getDate();
    }, [recoveryMonth]);

    const recoveryFirstDayOffset = useMemo(() => {
        const firstDay = new Date(recoveryMonth.getFullYear(), recoveryMonth.getMonth(), 1).getDay();
        return firstDay === 0 ? 6 : firstDay - 1;
    }, [recoveryMonth]);

    const trainingDateSet = useMemo(() => new Set(trainingBookings.map(b => b.date)), [trainingBookings]);
    const recoveryRequestByDate = useMemo(() => {
        const map = new Map<string, RecoveryRequest>();
        recoveryRequests.forEach(request => {
            const existing = map.get(request.date);
            if (!existing || existing.status === 'pending') {
                map.set(request.date, request);
            }
        });
        return map;
    }, [recoveryRequests]);

    const isRecoveryDateSelectable = (isoDate: string) => {
        if (availableRecoveryCredits <= 0) return false;
        if (recoveryRequestByDate.has(isoDate)) return false;
        if (trainingDateSet.has(isoDate)) return false;
        const date = new Date(`${isoDate}T00:00:00`);
        const today = new Date();
        const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const maxDate = new Date(start);
        maxDate.setDate(maxDate.getDate() + 45);
        const day = date.getDay();
        const isWeekend = day === 0 || day === 6;
        return date >= start && date <= maxDate && !isWeekend;
    };

    const handleCreateRecoveryRequest = async () => {
        if (!user) return;
        if (!selectedRecoveryDate) {
            setRecoveryFeedback({ type: 'error', message: t('student_dashboard.recovery.select_date_error') });
            return;
        }
        if (!isRecoveryDateSelectable(selectedRecoveryDate)) {
            setRecoveryFeedback({ type: 'error', message: t('student_dashboard.recovery.date_not_available') });
            return;
        }
        setIsSubmittingRecoveryRequest(true);
        const created = await recoveryRequestService.create({
            studentId: user.id,
            date: selectedRecoveryDate,
        });
        setRecoveryRequests(prev => [...prev, created]);
        setSelectedRecoveryDate(null);
        setRecoveryFeedback({ type: 'success', message: t('student_dashboard.recovery.request_sent') });
        setIsSubmittingRecoveryRequest(false);
    };

    useEffect(() => {
        if (attendanceMonthInitialized || trainingBookings.length === 0) return;
        const sorted = [...trainingBookings].sort((a, b) => a.date.localeCompare(b.date));
        const firstTrainingDate = sorted[0]?.date;
        if (!firstTrainingDate) return;
        const [year, month] = firstTrainingDate.split('-').map(Number);
        setAttendanceMonth(new Date(year, month - 1, 1));
        setAttendanceMonthInitialized(true);
    }, [attendanceMonthInitialized, trainingBookings]);

    const tabs = [
        { key: 'bookings' as const, label: t('student_dashboard.tabs.bookings') },
        { key: 'attendance' as const, label: t('student_dashboard.tabs.attendance') },
        { key: 'results' as const, label: t('student_dashboard.tabs.results') },
        { key: 'recovery' as const, label: t('student_dashboard.tabs.recovery') },
        { key: 'messages' as const, label: t('student_dashboard.tabs.messages') },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
            <PageHeader
                title={t('student_dashboard.welcome', { name: user?.name })}
                subtitle={t('student_dashboard.subtitle')}
            />

            <div className="container mx-auto px-6 -mt-10 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Stats Cards */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
                                <Calendar size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{t('student_dashboard.stats.upcoming_sessions')}</p>
                                <p className="text-2xl font-bold text-gray-800 dark:text-white">{upcoming.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-host-cyan/10 rounded-full text-host-cyan">
                                <User size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{t('student_dashboard.stats.student_level')}</p>
                                <p className="text-2xl font-bold text-gray-800 dark:text-white">{t('hero.levels.beginner')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-host-blue to-blue-600 p-6 rounded-2xl shadow-xl text-white flex flex-col justify-between">
                        <div>
                            <p className="opacity-80 text-sm">{t('student_dashboard.stats.next_session')}</p>
                            <p className="text-xl font-bold mt-1">
                                {upcoming[0] ? `${upcoming[0].date} @ ${upcoming[0].time}` : t('student_dashboard.stats.no_upcoming')}
                            </p>
                        </div>
                        <Link to="/courses" className="self-end mt-4 text-xs uppercase font-bold tracking-wider hover:text-host-cyan transition-colors flex items-center">
                            {t('student_dashboard.stats.book_new')} <ArrowRight size={14} className="ml-1" />
                        </Link>
                    </div>
                </div>

                {/* My Subscription Section */}
                <div className="mt-12">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
                        <CreditCard className="mr-3 text-host-cyan" size={24} />
                        {t('student_dashboard.subscription.title')}
                    </h2>

                    {mySubscription && matchedPlan ? (
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 relative overflow-hidden hover:shadow-xl hover:border-host-cyan/50 transition-all duration-300 max-w-2xl">
                            {/* Active Status Badge */}
                            <div className="absolute top-4 right-4">
                                <span className="inline-flex items-center space-x-1.5 bg-emerald-500 text-white text-xs font-extrabold px-4 py-1.5 rounded-full shadow-lg uppercase tracking-widest">
                                    <Award className="w-3.5 h-3.5" />
                                    <span>{t('student_dashboard.subscription.status_active')}</span>
                                </span>
                            </div>

                            {/* Category badge */}
                            <div className="mb-4">
                                {(() => {
                                    const categoryConfig: Record<string, { label: string; icon: string; color: string }> = {
                                        standard: { label: t('landing.subscriptions.standard'), icon: '◎', color: 'bg-host-cyan/20 text-host-cyan border-host-cyan/30' },
                                        pro: { label: t('landing.subscriptions.pro'), icon: '★', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
                                        individual: { label: t('landing.subscriptions.individual'), icon: '✦', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
                                        transport: { label: t('landing.subscriptions.transport'), icon: '🚐', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
                                    };
                                    const cat = categoryConfig[matchedPlan.category] || categoryConfig.standard;
                                    return (
                                        <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${cat.color}`}>
                                            <span>{cat.icon}</span>
                                            <span>{cat.label}</span>
                                        </span>
                                    );
                                })()}
                            </div>

                            {/* Plan name */}
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3 pr-28">
                                {t(`landing.plans.${matchedPlan.id}.name`)}
                            </h3>

                            {/* Sessions & Duration row */}
                            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-5">
                                <span>◷ {matchedPlan.sessions} {t('landing.subscriptions.sessions')}</span>
                                <span className="text-gray-300 dark:text-gray-600">·</span>
                                <span>{t(`landing.plans.${matchedPlan.id}.duration`)}</span>
                            </div>

                            {/* Sessions Progress */}
                            <div className="mb-5">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-bold text-gray-600 dark:text-gray-300">
                                        {t('student_dashboard.subscription.sessions_remaining')}
                                    </span>
                                    <span className="text-sm font-extrabold text-host-cyan">
                                        {sessionsRemaining} / {mySubscription.sessionsTotal}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                    <div
                                        className="bg-gradient-to-r from-host-blue to-host-cyan h-2.5 rounded-full transition-all duration-500"
                                        style={{ width: `${100 - sessionProgress}%` }}
                                    />
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{t('student_dashboard.subscription.valid_until')}</p>
                                    <p className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center">
                                        <Calendar size={14} className="mr-1.5 text-host-cyan" />
                                        {mySubscription.expiryDate}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{t('student_dashboard.subscription.paid_on')}</p>
                                    <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                                        {mySubscription.paidDate}
                                    </p>
                                </div>
                            </div>

                            {/* Price */}
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-baseline space-x-2">
                                    <span className="text-2xl font-extrabold text-host-cyan">{mySubscription.amount}</span>
                                    <span className="text-sm text-gray-500 font-medium">MDL</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8 text-center max-w-2xl">
                            <CreditCard className="mx-auto mb-4 text-gray-300 dark:text-gray-600" size={40} />
                            <p className="text-gray-500 mb-4">{t('student_dashboard.subscription.no_subscription')}</p>
                            <Link to="/" className="text-host-cyan font-bold hover:underline">
                                {t('student_dashboard.subscription.browse_plans')}
                            </Link>
                        </div>
                    )}
                </div>

                {/* Tab Navigation */}
                <div className="mt-12 flex flex-wrap gap-3 overflow-x-auto pb-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={clsx(
                                "px-5 py-2.5 text-sm font-bold uppercase tracking-wider transition-all duration-200 whitespace-nowrap",
                                activeTab === tab.key
                                    ? "bg-host-cyan text-white shadow-lg shadow-cyan-500/25"
                                    : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="mt-8">
                    {/* Bookings Tab */}
                    {activeTab === 'bookings' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-8">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">{t('student_dashboard.my_bookings')}</h2>
                                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                                        {myBookings.length > 0 ? (
                                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                                {myBookings.map((binding) => (
                                                    <div key={binding.id} className="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                        <div className="flex items-center space-x-4">
                                                            <div className={clsx(
                                                                "w-2 h-12 rounded-full",
                                                                binding.status === 'upcoming' ? "bg-host-cyan" : "bg-gray-300"
                                                            )} />
                                                            <div>
                                                                <h4 className="font-bold text-gray-800 dark:text-gray-200">{binding.course ? t(`courses.${binding.course.id}.title`) : ''}</h4>
                                                                <div className="flex items-center text-sm text-gray-500 mt-1">
                                                                    <User size={14} className="mr-1" /> {binding.coach?.name}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-4">
                                                            <div className="text-right">
                                                                <div className="font-bold text-gray-700 dark:text-gray-300 flex items-center justify-end">
                                                                    <Calendar size={16} className="mr-2 text-host-cyan" /> {binding.date}
                                                                </div>
                                                                <div className="text-sm text-gray-500 flex items-center justify-end mt-1">
                                                                    <Clock size={14} className="mr-1" /> {binding.time}
                                                                </div>
                                                            </div>
                                                            {binding.status === 'upcoming' && (
                                                                <button
                                                                    onClick={() => handleMarkAbsent(binding.id, binding.date)}
                                                                    className="text-xs px-3 py-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors font-bold"
                                                                >
                                                                    {t('student_dashboard.actions.mark_absent')}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-12 text-center">
                                                <p className="text-gray-500 mb-4">{t('student_dashboard.no_bookings')}</p>
                                                <Link to="/courses" className="text-host-cyan font-bold hover:underline">{t('student_dashboard.browse_courses')}</Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">{t('student_dashboard.quick_actions')}</h2>
                                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                                    <ul className="space-y-4">
                                        <li>
                                            <Link to="/courses" className="block p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-host-cyan/10 transition-colors group">
                                                <span className="font-bold text-gray-700 dark:text-gray-200 group-hover:text-host-cyan">{t('student_dashboard.actions.browse_all')}</span>
                                                <p className="text-sm text-gray-500 mt-1">{t('student_dashboard.actions.browse_all_desc')}</p>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to="/coaches" className="block p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-host-cyan/10 transition-colors group">
                                                <span className="font-bold text-gray-700 dark:text-gray-200 group-hover:text-host-cyan">{t('student_dashboard.actions.meet_coaches')}</span>
                                                <p className="text-sm text-gray-500 mt-1">{t('student_dashboard.actions.meet_coaches_desc')}</p>
                                            </Link>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Attendance Tab */}
                    {activeTab === 'attendance' && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                                <h2 className="text-xl font-bold text-gray-800 dark:text-white">{t('student_dashboard.attendance.title')}</h2>
                            </div>
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 space-y-4">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {t('student_dashboard.attendance.self_only')}
                                </p>
                                <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4 md:p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <button
                                            type="button"
                                            onClick={() => setAttendanceMonth(new Date(attendanceMonth.getFullYear(), attendanceMonth.getMonth() - 1, 1))}
                                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                                        >
                                            <ChevronLeft size={18} />
                                        </button>
                                        <h3 className="text-lg font-bold text-gray-800 dark:text-white capitalize">{monthLabel}</h3>
                                        <button
                                            type="button"
                                            onClick={() => setAttendanceMonth(new Date(attendanceMonth.getFullYear(), attendanceMonth.getMonth() + 1, 1))}
                                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                                        >
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-7 gap-2 mb-2">
                                        {weekdays.map(day => (
                                            <div key={day} className="text-center text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 py-2">
                                                {day}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-7 gap-2">
                                        {Array.from({ length: firstDayOffset }).map((_, index) => (
                                            <div key={`empty-${index}`} className="min-h-28 md:min-h-32 rounded-lg bg-gray-50/60 dark:bg-gray-900/40" />
                                        ))}

                                        {Array.from({ length: daysInCalendarMonth }, (_, index) => {
                                            const day = index + 1;
                                            const isoDate = `${attendanceMonth.getFullYear()}-${String(attendanceMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                            const bookings = trainingsByDate.get(isoDate) ?? [];
                                            const existingAttendance = attendanceByDate.get(isoDate);
                                            const hasTraining = bookings.length > 0;
                                            const isSaving = savingAttendanceDate === isoDate;

                                            return (
                                                <div
                                                    key={isoDate}
                                                    className={clsx(
                                                        "min-h-28 md:min-h-32 rounded-lg border p-2 flex flex-col gap-2",
                                                        hasTraining
                                                            ? "border-host-cyan/40 bg-cyan-50/60 dark:bg-cyan-900/10"
                                                            : "border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800"
                                                    )}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-bold text-gray-800 dark:text-white">{day}</span>
                                                        {hasTraining && (
                                                            <span className="text-[10px] font-bold uppercase tracking-wider text-host-cyan">
                                                                {t('student_dashboard.attendance.training_day')}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {hasTraining && (
                                                        <div className="text-[11px] text-gray-600 dark:text-gray-300 leading-tight space-y-1">
                                                            {bookings.map(booking => (
                                                                <div key={booking.id} className="font-medium">{booking.time}</div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {hasTraining && existingAttendance && (
                                                        <span className={clsx(
                                                            "inline-flex items-center justify-center px-2 py-1 rounded text-[11px] font-bold uppercase",
                                                            getAttendanceStatusClass(existingAttendance.status)
                                                        )}>
                                                            {getAttendanceStatusLabel(existingAttendance.status)}
                                                        </span>
                                                    )}
                                                    {hasTraining && existingAttendance && (
                                                        <span className={clsx(
                                                            "inline-flex items-center justify-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide",
                                                            existingAttendance.confirmed === false
                                                                ? "bg-amber-100 text-amber-700"
                                                                : "bg-emerald-100 text-emerald-700"
                                                        )}>
                                                            {existingAttendance.confirmed === false
                                                                ? t('student_dashboard.attendance.pending_teacher_confirmation')
                                                                : t('student_dashboard.attendance.confirmed_by_teacher')}
                                                        </span>
                                                    )}

                                                    {hasTraining && (
                                                        <div className="mt-auto space-y-2">
                                                            <select
                                                                value={existingAttendance?.status ?? ''}
                                                                onChange={e => {
                                                                    const nextStatus = e.target.value as AttendanceRecord['status'];
                                                                    if (!nextStatus) return;
                                                                    setAttendanceFeedback(null);
                                                                    handleMarkMyAttendanceForDate(isoDate, bookings[0].id, nextStatus);
                                                                }}
                                                                disabled={isSaving || existingAttendance?.confirmed === true}
                                                                className={getAttendanceSelectClass(existingAttendance?.status)}
                                                            >
                                                                <option value="">
                                                                    {isSaving ? t('student_dashboard.attendance.saving') : 'Selecteaza status'}
                                                                </option>
                                                                {attendanceStatusOptions.map(option => (
                                                                    <option key={option.value} value={option.value}>
                                                                        {option.label}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {attendanceFeedback && (
                                    <div
                                        className={clsx(
                                            "text-sm font-medium",
                                            attendanceFeedback.type === 'success'
                                                ? "text-green-600 dark:text-green-400"
                                                : "text-red-600 dark:text-red-400"
                                        )}
                                    >
                                        {attendanceFeedback.message}
                                    </div>
                                )}
                            </div>
                            {attendance.length > 0 ? (
                                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {attendance.map(a => (
                                        <div key={a.id} className="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <div className="flex items-center space-x-4">
                                            <div className={clsx(
                                                    "p-2 rounded-full",
                                                    a.status === 'present' ? "bg-green-100 text-green-600" :
                                                        a.status === 'absent' ? "bg-red-100 text-red-600" :
                                                            a.status === 'absent_medical' ? "bg-orange-100 text-orange-600" :
                                                                a.status === 'late' ? "bg-blue-100 text-blue-600" :
                                                                    "bg-yellow-100 text-yellow-600"
                                                )}>
                                                    {a.status === 'present' ? <CheckCircle size={20} /> :
                                                        a.status === 'absent' || a.status === 'absent_medical' ? <XCircle size={20} /> :
                                                            a.status === 'late' ? <Clock size={20} /> :
                                                                <RotateCcw size={20} />}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-800 dark:text-gray-200">{a.date}</div>
                                                    <div className="text-xs text-gray-500">{t('student_dashboard.attendance.booking')}: {a.bookingId}</div>
                                                </div>
                                            </div>
                                            <span className={clsx(
                                                "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide",
                                                getAttendanceStatusClass(a.status)
                                            )}>
                                                {getAttendanceStatusLabel(a.status)}
                                            </span>
                                            <span className={clsx(
                                                "ml-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide",
                                                a.confirmed === false ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                                            )}>
                                                {a.confirmed === false
                                                    ? t('student_dashboard.attendance.pending_teacher_confirmation')
                                                    : t('student_dashboard.attendance.confirmed_by_teacher')}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 text-center text-gray-500">{t('student_dashboard.attendance.no_records')}</div>
                            )}
                        </div>
                    )}

                    {/* Results Tab */}
                    {activeTab === 'results' && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center space-x-3">
                                <Trophy className="text-host-cyan" size={24} />
                                <h2 className="text-xl font-bold text-gray-800 dark:text-white">{t('student_dashboard.results.title')}</h2>
                            </div>
                            {results.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider">
                                            <tr>
                                                <th className="p-4 font-semibold">{t('student_dashboard.results.headers.date')}</th>
                                                <th className="p-4 font-semibold">{t('student_dashboard.results.headers.style')}</th>
                                                <th className="p-4 font-semibold">{t('student_dashboard.results.headers.distance')}</th>
                                                <th className="p-4 font-semibold">{t('student_dashboard.results.headers.time')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                            {results.map(r => (
                                                <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                                    <td className="p-4 font-medium text-gray-700 dark:text-gray-300">{r.date}</td>
                                                    <td className="p-4">
                                                        <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 capitalize">
                                                            {r.style}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 font-bold text-gray-800 dark:text-white">{r.distance}</td>
                                                    <td className="p-4 font-bold text-host-cyan">{r.time}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="p-12 text-center text-gray-500">{t('student_dashboard.results.no_results')}</div>
                            )}
                        </div>
                    )}

                    {/* Recovery Tab */}
                    {activeTab === 'recovery' && (
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center space-x-3">
                                    <RotateCcw className="text-yellow-500" size={24} />
                                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">{t('student_dashboard.recovery.title')}</h2>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3">
                                            <div className="text-xs font-bold uppercase tracking-wider text-yellow-700">
                                                {t('student_dashboard.recovery.active_credits')}
                                            </div>
                                            <div className="text-2xl font-extrabold text-yellow-700">{availableRecoveryCredits}</div>
                                        </div>
                                        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                                            <div className="text-xs font-bold uppercase tracking-wider text-amber-700">
                                                {t('student_dashboard.recovery.pending_requests')}
                                            </div>
                                            <div className="text-2xl font-extrabold text-amber-700">{pendingRecoveryRequests.length}</div>
                                        </div>
                                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
                                            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                                                {t('student_dashboard.recovery.confirmed_requests')}
                                            </div>
                                            <div className="text-2xl font-extrabold text-emerald-700">{confirmedRecoveryRequests.length}</div>
                                        </div>
                                    </div>

                                    <div className="text-sm text-gray-600 dark:text-gray-300">
                                        {t('student_dashboard.recovery.instructions')}
                                    </div>

                                    <div className="flex items-center justify-between gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setRecoveryMonth(new Date(recoveryMonth.getFullYear(), recoveryMonth.getMonth() - 1, 1))}
                                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <ChevronLeft size={18} />
                                        </button>
                                        <div className="font-bold text-gray-800 dark:text-white capitalize">{recoveryMonthLabel}</div>
                                        <button
                                            type="button"
                                            onClick={() => setRecoveryMonth(new Date(recoveryMonth.getFullYear(), recoveryMonth.getMonth() + 1, 1))}
                                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-7 gap-2 mb-2">
                                        {weekdays.map(day => (
                                            <div key={`recovery-${day}`} className="text-center text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 py-2">
                                                {day}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-7 gap-2">
                                        {Array.from({ length: recoveryFirstDayOffset }).map((_, index) => (
                                            <div key={`recovery-empty-${index}`} className="min-h-20 rounded-lg bg-gray-50/60 dark:bg-gray-900/40" />
                                        ))}
                                        {Array.from({ length: recoveryDaysInMonth }, (_, index) => {
                                            const day = index + 1;
                                            const isoDate = `${recoveryMonth.getFullYear()}-${String(recoveryMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                            const request = recoveryRequestByDate.get(isoDate);
                                            const isSelectable = isRecoveryDateSelectable(isoDate);
                                            const isSelected = selectedRecoveryDate === isoDate;

                                            return (
                                                <button
                                                    key={isoDate}
                                                    type="button"
                                                    onClick={() => {
                                                        if (!isSelectable) return;
                                                        setSelectedRecoveryDate(isoDate);
                                                        setRecoveryFeedback(null);
                                                    }}
                                                    disabled={!isSelectable}
                                                    className={clsx(
                                                        "min-h-20 rounded-lg border text-left p-2 transition-colors",
                                                        request?.status === 'pending' && "border-amber-300 bg-amber-50 text-amber-800",
                                                        request?.status === 'confirmed' && "border-emerald-300 bg-emerald-50 text-emerald-800",
                                                        request?.status === 'rejected' && "border-red-300 bg-red-50 text-red-800",
                                                        !request && isSelectable && (isSelected
                                                            ? "border-host-cyan bg-cyan-50 text-host-cyan"
                                                            : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:border-host-cyan"),
                                                        !request && !isSelectable && "border-gray-100 bg-gray-50 text-gray-400 dark:border-gray-700 dark:bg-gray-800/40 dark:text-gray-500"
                                                    )}
                                                >
                                                    <div className="text-sm font-bold">{day}</div>
                                                    {request && (
                                                        <div className="mt-1 text-[10px] font-bold uppercase tracking-wide">
                                                            {request.status === 'pending' && t('student_dashboard.recovery.status_pending')}
                                                            {request.status === 'confirmed' && t('student_dashboard.recovery.status_confirmed')}
                                                            {request.status === 'rejected' && t('student_dashboard.recovery.status_rejected')}
                                                        </div>
                                                    )}
                                                    {!request && isSelectable && (
                                                        <div className="mt-1 text-[10px] font-bold uppercase tracking-wide text-host-cyan">
                                                            {t('student_dashboard.recovery.available')}
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <div className="flex flex-col md:flex-row md:items-center gap-3">
                                        <div className="text-sm text-gray-600 dark:text-gray-300">
                                            {selectedRecoveryDate
                                                ? t('student_dashboard.recovery.selected_date', { date: selectedRecoveryDate })
                                                : t('student_dashboard.recovery.no_date_selected')}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleCreateRecoveryRequest}
                                            disabled={!selectedRecoveryDate || isSubmittingRecoveryRequest || availableRecoveryCredits <= 0}
                                            className="md:ml-auto px-4 py-2 rounded-lg bg-host-cyan text-white text-sm font-bold hover:bg-host-blue transition-colors disabled:opacity-60"
                                        >
                                            {isSubmittingRecoveryRequest
                                                ? t('student_dashboard.recovery.sending')
                                                : t('student_dashboard.recovery.send_request')}
                                        </button>
                                    </div>

                                    {recoveryFeedback && (
                                        <div className={clsx(
                                            "text-sm font-semibold",
                                            recoveryFeedback.type === 'success' ? "text-emerald-600" : "text-red-600"
                                        )}>
                                            {recoveryFeedback.message}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">{t('student_dashboard.recovery.requests_title')}</h3>
                                </div>
                                {recoveryRequests.length > 0 ? (
                                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {recoveryRequests
                                            .slice()
                                            .sort((a, b) => b.date.localeCompare(a.date))
                                            .map(request => (
                                                <div key={request.id} className="p-4 flex items-center justify-between">
                                                    <div>
                                                        <div className="font-bold text-gray-800 dark:text-gray-200">{request.date}</div>
                                                        <div className="text-xs text-gray-500">
                                                            {t('student_dashboard.recovery.request_made')}: {new Date(request.requestedAt).toLocaleDateString(locale)}
                                                        </div>
                                                    </div>
                                                    <span className={clsx(
                                                        "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide",
                                                        request.status === 'pending' && "bg-amber-100 text-amber-700",
                                                        request.status === 'confirmed' && "bg-emerald-100 text-emerald-700",
                                                        request.status === 'rejected' && "bg-red-100 text-red-700"
                                                    )}>
                                                        {request.status === 'pending' && t('student_dashboard.recovery.status_pending')}
                                                        {request.status === 'confirmed' && t('student_dashboard.recovery.status_confirmed')}
                                                        {request.status === 'rejected' && t('student_dashboard.recovery.status_rejected')}
                                                    </span>
                                                </div>
                                            ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-sm text-gray-500">{t('student_dashboard.recovery.no_requests')}</div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Messages Tab */}
                    {activeTab === 'messages' && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center space-x-3">
                                <MessageCircle className="text-host-cyan" size={24} />
                                <h2 className="text-xl font-bold text-gray-800 dark:text-white">{t('student_dashboard.messages.title')}</h2>
                            </div>
                            <div className="max-h-96 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
                                {messages.length > 0 ? messages.map(m => (
                                    <div key={m.id} className={clsx(
                                        "p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors",
                                        m.senderId === user?.id ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
                                    )}>
                                        <div className="flex justify-between items-start">
                                            <span className="text-sm font-bold text-host-blue dark:text-host-cyan">{m.senderName}</span>
                                            <span className="text-xs text-gray-400">{new Date(m.timestamp).toLocaleString()}</span>
                                        </div>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{m.content}</p>
                                    </div>
                                )) : (
                                    <div className="p-12 text-center text-gray-500">{t('student_dashboard.messages.no_messages')}</div>
                                )}
                            </div>
                            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/80">
                                <div className="flex items-center gap-3">
                                    <select
                                        value={selectedReceiver}
                                        onChange={e => setSelectedReceiver(e.target.value)}
                                        className="border-none bg-gray-200 dark:bg-gray-700/80 text-sm px-5 py-2.5 outline-none focus:ring-2 focus:ring-host-cyan/30 text-gray-700 dark:text-white font-semibold transition-all duration-200 cursor-pointer appearance-none"
                                        style={{ borderRadius: '9999px' }}
                                    >
                                        {mockCoaches.map((coach) => (
                                            <option key={coach.id} value={coach.id}>
                                                {coach.name} ({t(`coaches.${coach.id}.specialization`)})
                                            </option>
                                        ))}
                                        <option value="admin-1">{t('roles.admin')}</option>
                                    </select>
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={e => setNewMessage(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                                        placeholder={t('student_dashboard.messages.placeholder')}
                                        className="flex-1 border-none bg-gray-200 dark:bg-gray-700/80 text-sm px-5 py-2.5 outline-none focus:ring-2 focus:ring-host-cyan/30 text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200"
                                        style={{ borderRadius: '9999px' }}
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        className="p-2.5 bg-host-cyan text-white hover:bg-host-blue transition-all duration-200 hover:scale-105 active:scale-95 flex-shrink-0"
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
