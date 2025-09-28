// src/hooks/useLogin.js
import { useState } from 'react';
import { useForm } from './useForm'; // Reusing your existing form hook
import { loginUser } from '../api/AuthApi';
import { useAuth } from '../context/AuthContext'; // Reusing your Auth context
import { jwtDecode } from "jwt-decode";

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

            // 2. Extract token
            const token = response.token;

            // 3. Decode token to extract user info
            const decoded = jwtDecode(token);

            // decoded looks like:
            // {
            //   "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name": "sehandevinda1@gmail.com",
            //   "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": "Backoffice",
            //   "userId": "68d789b1863c4721a958d956",
            //   "exp": 1759078695,
            //   "iss": "http://localhost:5033",
            //   "aud": "http://localhost:3000"
            // }

            const userData = {
                userId: decoded.userId,
                username: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
                role: decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
            };

            // 4. Store token + userData in AuthContext
            login(token, userData);

            resetForm();
            return true;
        } catch (err) {
            setError(err.message || "An unexpected error occurred during login.");
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