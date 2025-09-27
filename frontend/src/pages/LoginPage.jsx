// src/pages/LoginPage.jsx
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../components/common/Input'; // Reusing the Input component
import { useLogin } from '../hooks/useLogin';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const navigate = useNavigate();
    const { handleSubmit, formData, handleChange, loading, error } = useLogin();
    const { user } = useAuth(); // Check if user is already logged in

    // If the user object exists (meaning they successfully logged in via useLogin), redirect to dashboard
    if (user) {
        navigate('/dashboard', { replace: true });
        return null; // Don't render the form while redirecting
    }

    const handleFormSubmission = async (e) => {
        const success = await handleSubmit(e);
        if (success) {
            // This navigates after the useLogin hook successfully calls the login function in AuthContext
            navigate('/dashboard'); 
        }
    }

    return (
        <div className="flex min-h-screen">
            {/* Left Side: Indigo Banner (5/12) */}
            <div className="w-5/12 bg-indigo-800 text-white p-12 flex flex-col justify-center">
                <h1 className="text-4xl font-bold mb-4">Efficient EV Management</h1>
                <p className="text-sm leading-relaxed">
                    Access your personalized dashboard to book charging slots, monitor stations, or manage backoffice tasks.
                </p>
            </div>

            {/* Right Side: Login Form (7/12) */}
            <div className="w-7/12 flex flex-col justify-center relative overflow-hidden bg-gray-50">
                <div className="ml-auto w-8/12 px-6">
                    <h2 className="text-2xl font-bold mb-1">Welcome Back!</h2>
                    <p className="text-sm text-gray-600 mb-6">Please sign in to your account</p>

                    {/* Error Display */}
                    {error && (
                        <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded-md" role="alert">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleFormSubmission}>
                        {/* 1. Username/Email */}
                        <Input
                            label="Username (Email)"
                            id="username"
                            name="username"
                            type="email"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                        
                        {/* 2. Password */}
                        <Input
                            label="Password"
                            id="password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />

                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center">
                                {/* Note: Removed the "remember me" functionality, as it requires state */}
                                <input type="checkbox" id="remember" className="mr-2 accent-indigo-500" />
                                <label htmlFor="remember" className="text-sm text-gray-600">
                                    Remember me
                                </label>
                            </div>
                            <Link to="/forgot-password" className="text-sm text-indigo-500 hover:text-indigo-600 transition-colors">
                                Forgot your password?
                            </Link>
                        </div>

                        {/* Sign In Button */}
                        <button
                            type="submit"
                            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-md transition-colors mb-6 disabled:bg-indigo-300"
                            disabled={loading}
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>

                    {/* Navigation Link to Register */}
                    <div className="text-center">
                        <p className="text-sm text-gray-600">Don't have an account?</p>
                        <Link to="/register" className="text-indigo-500 hover:text-indigo-600 transition-colors text-sm font-medium">
                            Sign up
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;