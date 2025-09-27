// src/pages/RegisterPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom'; // Assuming you use react-router-dom
import Input from '../components/common/Input';
import { useRegister } from '../hooks/useRegister';

const RegisterPage = () => {
    const navigate = useNavigate();

    // Success handler: navigate to login or dashboard
    const handleSuccess = (responseData) => {
        alert(`Registration successful! User: ${responseData.Username}, Role: ${responseData.Role}`);
        // Redirect to the login page after successful registration
        navigate('/login'); 
    };

    const { formData, handleChange, handleSubmit, loading, error } = useRegister(handleSuccess);

    return (
        <div className="flex min-h-screen">
            {/* Left Side: Indigo Banner (5/12) */}
            <div className="w-5/12 bg-indigo-800 text-white p-12 flex flex-col justify-center">
                <h1 className="text-4xl font-bold mb-4">Welcome to EV Charging System</h1>
                <p className="text-sm leading-relaxed">
                    Register now to start managing your station or booking your next charge. Fast, reliable, and smart EV management.
                </p>
            </div>

            {/* Right Side: Registration Form (7/12) */}
            <div className="w-7/12 flex flex-col justify-center relative overflow-hidden bg-gray-50">
                <div className="ml-auto w-8/12 px-6">
                    <h2 className="text-2xl font-bold mb-1">Create an Account</h2>
                    <p className="text-sm text-gray-600 mb-6">Join us to manage your electric vehicle needs.</p>
                    
                    {/* Error Display */}
                    {error && (
                        <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded-md" role="alert">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
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
                        
                        {/* 2. NIC (Required for EVOwner) */}
                        {formData.role === 'EVOwner' && (
                            <Input
                                label="National Identity Card (NIC)"
                                id="nic"
                                name="nic"
                                value={formData.nic}
                                onChange={handleChange}
                                required
                            />
                        )}

                        {/* 3. Role Selection (For this public page, we can hide/default this) */}
                        {/* Hiding for a typical public signup, assuming only EVOwner can register publicly. */}
                        {/* To allow other roles, uncomment and expand: */}
                        
                        <div className="mb-4">
                            <label htmlFor="role" className="block text-sm font-medium mb-2">Role</label>
                            <select
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full border border-gray-200 rounded-md py-2 px-3"
                            >
                                <option value="EVOwner">EV Owner</option>
                                <option value="StationOperator">Station Operator</option>
                                <option value="Backoffice">Back Officer</option>
                            </select>
                        </div>

                        {/* 4. Password */}
                        <Input
                            label="Password"
                            id="password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength="6"
                        />
                        
                        {/* 5. Confirm Password */}
                        <Input
                            label="Confirm Password"
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />

                        {/* Sign Up Button */}
                        <button
                            type="submit"
                            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-md transition-colors mb-6 disabled:bg-indigo-300"
                            disabled={loading}
                        >
                            {loading ? 'Registering...' : 'Sign Up'}
                        </button>
                    </form>

                    {/* Navigation Link to Login */}
                    <div className="text-center">
                        <p className="text-sm text-gray-600">Already have an account?</p>
                        <button 
                            onClick={() => navigate('/login')} 
                            className="text-indigo-500 hover:text-indigo-600 transition-colors text-sm font-medium"
                        >
                            Sign in
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;