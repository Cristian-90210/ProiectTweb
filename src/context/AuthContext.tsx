import React, { createContext, useContext, useState } from 'react';
import type { User } from '../types';
import { mockUserAccounts } from '../data/mockData';

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => boolean;
    logout: () => void;
    isAuthenticated: boolean;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
    });

    const login = (email: string, password: string): boolean => {
        const account = mockUserAccounts.find(
            (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );
        if (!account) return false;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _pw, ...safeUser } = account;
        setUser(safeUser);
        localStorage.setItem('user', JSON.stringify(safeUser));
        return true;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('atlantis_cart');
        window.dispatchEvent(new Event('user-logout'));
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
                isAuthenticated: !!user,
                isAdmin: user?.role === 'admin',
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
