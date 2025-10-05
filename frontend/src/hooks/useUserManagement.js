import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import useDebounce from './useDebounce'; // Import the debounce hook (adjust path if needed)

// NOTE: Replace with your actual base URL
// Base URL for the API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL + "/User";

export const useUserManagement = (token) => {
    const [users, setUsers] = useState([]); // Raw users from API
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterRole, setFilterRole] = useState('all'); // 'all', 'EVOwner', 'StationOperator', etc.
    const [searchQuery, setSearchQuery] = useState(''); // Search state

    // Debounced search query
    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    // 1. Fetch All Users Function (fetches once; filters client-side)
    const fetchUsers = useCallback(async () => {
        if (!token) return;

        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/all`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setUsers(response.data);
        } catch (err) {
            console.error("Fetch Users Error:", err);
            setError('Failed to fetch user data.');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // 2. Client-side filtering based on role and debounced search
    const filteredUsers = useMemo(() => {
        let filtered = users;
        // Filter by role
        if (filterRole !== 'all') {
            filtered = filtered.filter(u => u.role === filterRole);
        }
        // Filter by search (if debounced query exists)
        if (debouncedSearchQuery) {
            const query = debouncedSearchQuery.toLowerCase();
            filtered = filtered.filter(u =>
                u.name?.toLowerCase().includes(query) ||
                u.email?.toLowerCase().includes(query) ||
                u.role?.toLowerCase().includes(query)
            );
        }
        return filtered;
    }, [users, filterRole, debouncedSearchQuery]);

    // 3. Mutation: Edit User Details
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

    // 4. Mutation: Toggle Active Status (Uses AuthController endpoints)
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
        users, // Raw users for stats
        filteredUsers, // Filtered for table
        loading,
        error,
        filterRole,
        setFilterRole, // For role filter UI
        searchQuery,
        setSearchQuery, // For search UI
        refetch: fetchUsers,
        editUser,
        toggleUserActiveStatus,
    };
};