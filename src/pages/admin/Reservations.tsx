import React, { useState, useEffect } from 'react';
import { Card } from '../../components/Card';
import { PageHeader } from '../../components/PageHeader';
import { Table, TableRow } from '../../components/TableRow';
import type { Booking } from '../../types';
import { reservationService } from '../../services/api';
import { CheckCircle, XCircle, Clock, Loader2, Trash2 } from 'lucide-react';

export const Reservations: React.FC = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const [confirmId, setConfirmId] = useState<string | null>(null);

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        setIsLoading(true);
        try {
            const data = await reservationService.getAll();
            setBookings(data);
        } catch (error) {
            console.error('Failed to load bookings', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelClick = (id: string) => {
        setConfirmId(id); // arată confirmarea
    };

    const handleConfirmCancel = async (id: string) => {
        setConfirmId(null);
        setCancellingId(id);
        try {
            await reservationService.updateStatus(id, 'cancelled');
            // Actualizează starea local — schimbă statusul la 'cancelled'
            setBookings(prev =>
                prev.map(b => b.id === id ? { ...b, status: 'cancelled' as const } : b)
            );
        } catch (error) {
            console.error('Failed to cancel booking', error);
        } finally {
            setCancellingId(null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':  return <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full text-xs font-bold uppercase flex items-center w-fit gap-1"><CheckCircle className="w-3 h-3" /> Completed</span>;
            case 'cancelled':  return <span className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 px-2 py-1 rounded-full text-xs font-bold uppercase flex items-center w-fit gap-1"><XCircle className="w-3 h-3" /> Cancelled</span>;
            default:           return <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 px-2 py-1 rounded-full text-xs font-bold uppercase flex items-center w-fit gap-1"><Clock className="w-3 h-3" /> Upcoming</span>;
        }
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-20">
            <PageHeader
                title={<>ALL <span className="text-host-cyan">RESERVATIONS</span></>}
                subtitle="Monitor and manage all training sessions."
            />

            <div className="container mx-auto px-6 -mt-10 relative z-20">
                <Card className="p-0 overflow-hidden shadow-xl border-t-4 border-t-host-cyan">
                    {isLoading ? (
                        <div className="p-12 text-center text-gray-500">Loading reservations...</div>
                    ) : (
                        <Table headers={['Date & Time', 'Course', 'Student (ID)', 'Coach (ID)', 'Status', 'Actions']}>
                            {bookings.map((booking) => (
                                <TableRow key={booking.id}>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-800 dark:text-gray-200">{booking.date}</span>
                                            <span className="text-sm text-host-cyan">{booking.time}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-700 dark:text-gray-300">{booking.courseId}</td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{booking.studentId}</td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{booking.coachId}</td>
                                    <td className="px-6 py-4">{getStatusBadge(booking.status)}</td>
                                    <td className="px-6 py-4">
                                        {booking.status === 'cancelled' ? (
                                            /* Deja anulat — buton dezactivat */
                                            <span className="text-gray-400 dark:text-gray-600 text-xs italic">Anulat</span>
                                        ) : booking.status === 'completed' ? (
                                            /* Finalizat — nu se poate anula */
                                            <span className="text-gray-400 dark:text-gray-600 text-xs italic">—</span>
                                        ) : confirmId === booking.id ? (
                                            /* Confirmare anulare */
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-500 dark:text-gray-400">Sigur?</span>
                                                <button
                                                    onClick={() => handleConfirmCancel(booking.id)}
                                                    className="text-xs px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold transition-colors"
                                                >
                                                    Da
                                                </button>
                                                <button
                                                    onClick={() => setConfirmId(null)}
                                                    className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-bold transition-colors"
                                                >
                                                    Nu
                                                </button>
                                            </div>
                                        ) : cancellingId === booking.id ? (
                                            /* Loading spinner */
                                            <div className="flex items-center gap-1 text-gray-400">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span className="text-xs">Se anulează...</span>
                                            </div>
                                        ) : (
                                            /* Buton Cancel normal */
                                            <button
                                                onClick={() => handleCancelClick(booking.id)}
                                                className="flex items-center gap-1 text-red-500 hover:text-white hover:bg-red-500 border border-red-500 text-xs font-bold px-3 py-1.5 rounded-lg transition-all duration-200"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                                Cancel
                                            </button>
                                        )}
                                    </td>
                                </TableRow>
                            ))}
                        </Table>
                    )}
                </Card>
            </div>
        </div>
    );
};
