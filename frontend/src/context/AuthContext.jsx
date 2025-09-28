import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    // Initialize state by trying to read from localStorage
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    // Function to persist data during login
    const login = (jwtToken, userData) => {
        // 1. Save to state
        setToken(jwtToken);
        setUser(userData);
        
        // 2. Save to localStorage for persistence!
        localStorage.setItem('token', jwtToken);
        localStorage.setItem('user', JSON.stringify(userData)); 
    };

    // Function to clear data during logout
    const logout = () => {
        // 1. Clear state
        setToken(null);
        setUser(null);
        
        // 2. Clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    const value = {
        token,
        user,
        login,
        logout,
    };

    // Optional: Use useEffect to sync state if token changes elsewhere
    // useEffect(() => {
    //     // Logic to handle token validation on component mount/token change
    // }, [token]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};