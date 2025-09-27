// src/hooks/useLogin.js
import { useState } from 'react';
import { useForm } from './useForm'; // Reusing your existing form hook
import { loginUser } from '../api/AuthApi';
import { useAuth } from '../context/AuthContext'; // Reusing your Auth context

const INITIAL_FORM_STATE = {
    username: '',
    password: ''
};

export const useLogin = () => {
    const { values, handleChange, resetForm } = useForm(INITIAL_FORM_STATE);
    const { login } = useAuth(); // Get the login function from AuthContext
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        // Basic client-side validation
        if (!values.username || !values.password) {
            setError("Both username and password are required.");
            setLoading(false);
            return;
        }

        try {
            // 1. Call the API
            const response = await loginUser(values);
            
            // 2. Extract token and store it using AuthContext
            const token = response.token;
            
            // NOTE: In a real app, you would decode the token (or make another API call) 
            // to get user details (username, role, etc.) before calling login(token, user).
            // For now, we pass the token and basic user info.
            const userData = { username: values.username, role: "Unknown" }; // Placeholder user data
            
            login(token, userData); 
            
            resetForm();
            // Optional: return success or redirect the user (handled in the component)
            return true; 
        } catch (err) {
            setError(err.message || 'An unexpected error occurred during login.');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        formData: values,
        handleChange,
        handleSubmit,
        loading,
        error
    };
};