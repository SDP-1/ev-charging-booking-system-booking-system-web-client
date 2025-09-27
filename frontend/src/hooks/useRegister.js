// src/hooks/useRegister.js
import { useState } from 'react';
import { useForm } from './useForm';
import { registerUser } from '../api/AuthApi';
// Assuming the default role is 'EVOwner' for public registration
const INITIAL_FORM_STATE = {
    username: '',
    password: '',
    confirmPassword: '',
    role: 'EVOwner', 
    nic: ''
};

export const useRegister = (onSuccess) => {
    const { values, handleChange, resetForm } = useForm(INITIAL_FORM_STATE);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        // Basic client-side validation
        if (values.password !== values.confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }

        // NIC validation for EVOwner role (matching backend logic)
        if (values.role === 'EVOwner' && !values.nic) {
            setError("National Identity Card (NIC) is required for EV Owners.");
            setLoading(false);
            return;
        }

        try {
            // Registering user with the API
            const response = await registerUser(values);
            
            // Call the success callback (e.g., navigate to login, show a success toast)
            onSuccess(response);
            resetForm();
        } catch (err) {
            setError(err.message || 'An unexpected error occurred during registration.');
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