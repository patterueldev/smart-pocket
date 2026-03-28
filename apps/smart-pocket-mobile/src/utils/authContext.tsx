import { useRouter } from 'expo-router';
import React, { createContext, useState } from 'react';

type AuthState = {
    isLoggedIn: boolean;
    login: () => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthState>({
    isLoggedIn: false,
    login: () => {},
    logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();

    const login = () => {
        setIsLoggedIn(true);
        router.replace('/');
    };
    const logout = () => {
        setIsLoggedIn(false);
        router.replace('/login');
    }

    return (
        <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}