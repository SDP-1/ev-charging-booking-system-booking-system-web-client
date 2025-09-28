import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';



// NOTE: Replace with your actual base URL
// Base URL for the API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL + "/User";

export const useUserManagement = (token) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterRole, setFilterRole] = useState('all'); // 'all', 'EVOwner', 'StationOperator', etc.

    // 1. Fetch Users Function
    const fetchUsers = useCallback(async () => {
        if (!token) return;

        setLoading(true);
        setError(null);
        try {
            let url = `${API_BASE_URL}/all`;
            if (filterRole !== 'all') {
                url = `${API_BASE_URL}/role/${filterRole}`;
            }

            const response = await axios.get(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setUsers(response.data);
        } catch (err) {
            console.error("Fetch Users Error:", err);
            setError('Failed to fetch user data.');
        } finally {
            setLoading(false);
        }
    }, [token, filterRole]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // 2. Mutation: Edit User Details
    const editUser = async (userId, updateData) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/${userId}`, updateData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // Optimistically update the local state with the returned updated user
            setUsers(prevUsers =>
                prevUsers.map(user =>
                    user.id === userId ? { ...user, ...response.data } : user
                )
            );
            return true;
        } catch (err) {
            setError(`Failed to update user: ${err.response?.data?.Message || 'API error'}`);
            return false;
        }
    };

    // 3. Mutation: Toggle Active Status (Uses AuthController endpoints)
    const toggleUserActiveStatus = async (userId, currentStatus) => {
        const action = currentStatus ? 'deactivate' : 'activate';
        const AUTH_URL = API_BASE_URL.replace('/User', '/Auth');

        try {
            const response = await axios.post(`${AUTH_URL}/${action}/${userId}`, null, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const updatedUser = response.data;

            // Update local state
            setUsers(prevUsers =>
                prevUsers.map(user =>
                    user.id === userId ? updatedUser : user
                )
            );

            return updatedUser; // <-- full updated user
        } catch (err) {
            setError(`Failed to toggle status: ${err.response?.data?.Message || 'API error'}`);
            return null;
        }
    };



    return {
        users,
        loading,
        error,
        filterRole,
        setFilterRole, // Export filter setter for UI control
        refetch: fetchUsers,
        editUser,
        toggleUserActiveStatus,
    };
};