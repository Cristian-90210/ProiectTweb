import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { CTAButton } from '../components/CTAButton';
import { ServerCrash } from 'lucide-react';

export const InternalServerError: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-center px-4">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <ServerCrash className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-4xl font-extrabold text-gray-800 dark:text-white mb-2">500 - Internal Server Error</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
                Something went wrong on our end. Our team has been notified and is working to fix the issue. Please try again later.
            </p>
            <div className="flex space-x-4">
                <Button onClick={() => navigate(-1)} variant="secondary" className="rounded-full px-6 text-gray-600">
                    Go Back
                </Button>
                <CTAButton fullWidth={false} onClick={() => navigate('/')}>
                    Go Home
                </CTAButton>
            </div>
        </div>
    );
};
