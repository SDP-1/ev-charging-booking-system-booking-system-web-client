// src/api/AuthApi.js

// Read the base URL from the environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; 

export const registerUser = async (userData) => {
    const url = `${API_BASE_URL}/auth/register`;
    
    // The C# backend expects the password in the 'PasswordHash' field.
    const payload = {
        username: userData.username,
        passwordHash: userData.password, // Frontend password field
        role: userData.role,
        nic: userData.nic,

    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        // Extract error message from backend response if available
        const errorData = await response.json().catch(() => ({ message: 'Registration failed.' }));
        throw new Error(errorData.title || errorData.message || 'Registration failed due to server error.');
    }

    // Backend returns { Username, Role, UserId } on success
    return response.json(); 
};

/**
 * Handles the user login request.
 * @param {object} loginData - Object containing username and password.
 * @returns {object} Response data, typically containing a JWT Token.
 */
export const loginUser = async (loginData) => {
    const url = `${API_BASE_URL}/Auth/login`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
    });

    if (!response.ok) {
        // Handle 401 Unauthorized or other errors
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 401) {
            throw new Error("Invalid username or password.");
        }
        
        throw new Error(errorData.title || errorData.message || 'Login failed due to a server error.');
    }

    // Backend returns { Token: "jwt_string..." }
    return response.json(); 
};