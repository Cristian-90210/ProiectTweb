import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { serverStatusService } from '../services/api';

export const ServerStatus: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkServer = async () => {
            try {
                await serverStatusService.healthCheck();
            } catch {
                navigate('/500', { replace: true });
            } finally {
                setLoading(false);
            }
        };

        checkServer();
    }, [navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-center px-4">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mb-6" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">Checking server status…</p>
            </div>
        );
    }

    return null;
};
