import React, { useState, useEffect } from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { PageHeader } from '../../components/PageHeader';
import { Table, TableRow } from '../../components/TableRow';
import { UserRole, getRoleLabel } from '../../types';
import type { AnyUser } from '../../types';
import { userService } from '../../services/api';
import { Search, CheckCircle, XCircle, Download } from 'lucide-react';
import { exportToCSV } from '../../utils/csvExport';

export const UsersManagement: React.FC = () => {
    const [users, setUsers] = useState<AnyUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterRole, setFilterRole] = useState<'all' | UserRole>('all');

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setIsLoading(true);
        try {
            const data = await userService.getAll();
            setUsers(data);
        } catch (error) {
            console.error('Failed to load users', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
        try {
            // @ts-ignore - Keeping just in case of union mismatch, but types should align
            await userService.updateStatus(id, newStatus);
            // @ts-ignore
            setUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u));
        } catch (error) {
            alert('Failed to update status');
        }
    };

    const filteredUsers = filterRole === 'all' ? users : users.filter(u => u.role === filterRole);

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-20">
            <PageHeader
                title={<>USER <span className="text-host-cyan">MANAGEMENT</span></>}
                subtitle="Manage authentication, roles, and account status."
            />

            <div className="container mx-auto px-6 -mt-10 relative z-20">
                <Card className="p-0 overflow-hidden shadow-xl border-t-4 border-t-host-cyan">
                    {/* Filters */}
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex space-x-2">
                            {(['all', UserRole.Student, UserRole.Coach, UserRole.Admin] as const).map(role => (
                                <button
                                    key={role}
                                    onClick={() => setFilterRole(role)}
                                    className={`px-4 py-2 rounded-full text-sm font-bold uppercase transition-colors ${filterRole === role
                                        ? 'bg-host-cyan text-white shadow-md'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    {role === 'all' ? 'Toți' : getRoleLabel(role)}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    className="pl-10 pr-4 py-2 rounded-full border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-1 focus:ring-host-cyan outline-none"
                                />
                                <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                            </div>
                            <button
                                onClick={() => exportToCSV(
                                    filteredUsers.map(u => {
                                        const parts = u.name.trim().split(' ');
                                        const prenume = parts[0] ?? '';
                                        const nume = parts.slice(1).join(' ') ?? '';
                                        return {
                                            ID: u.id,
                                            Prenume: prenume,
                                            Nume: nume,
                                            'Adresa Email': u.email,
                                            Rol: u.role,
                                            Status: (u as any).status ?? 'Active',
                                        };
                                    }),
                                    `utilizatori_${filterRole}`
                                )}
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                                <Download size={15} />
                                Export CSV
                            </button>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="p-12 text-center text-gray-500">Loading users...</div>
                    ) : (
                        <Table headers={['User', 'Role', 'Email', 'Status', 'Actions']}>
                            {filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} alt="" className="w-10 h-10 rounded-full mr-3" />
                                            <div>
                                                <div className="font-bold text-gray-800 dark:text-gray-200">{user.name}</div>
                                                <div className="text-xs text-gray-400">ID: {user.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase
                                            ${user.role === UserRole.Admin   ? 'bg-purple-100 text-purple-800' :
                                              user.role === UserRole.Coach   ? 'bg-blue-100 text-blue-800'   : 'bg-green-100 text-green-800'}`}>
                                            {getRoleLabel(user.role)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{user.email}</td>
                                    <td className="px-6 py-4">
                                        {user.status === 'Inactive' ? (
                                            <span className="text-red-500 flex items-center text-sm font-bold"><XCircle className="w-4 h-4 mr-1" /> Inactive</span>
                                        ) : (
                                            <span className="text-green-500 flex items-center text-sm font-bold"><CheckCircle className="w-4 h-4 mr-1" /> Active</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Button
                                            // @ts-ignore
                                            onClick={() => handleStatusChange(user.id, user.status)}
                                            variant="secondary"
                                            className="text-xs py-1 px-3 h-auto"
                                        >
                                            {/* @ts-ignore */}
                                            {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                                        </Button>
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
