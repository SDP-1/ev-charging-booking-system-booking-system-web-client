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
export const loginUser = async ({ username, password }) => {
  const url = `${API_BASE_URL}/auth/login`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // Backend wants PascalCase:
    body: JSON.stringify({ Username: username, Password: password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (res.status === 401) {
      throw new Error(
        "Recheck username and password. OR Account is not active or you don't have authorization to access this."
      );
    }
    throw new Error(err.title || err.message || 'Login failed due to a server error.');
  }

  // Accept either { Token } or { token }
  const data = await res.json();
  const token = data.Token || data.token;
  if (!token) throw new Error('Login succeeded but no token returned by server.');
  return { token, ...data };
};