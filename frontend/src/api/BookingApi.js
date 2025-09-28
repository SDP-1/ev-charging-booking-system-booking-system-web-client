const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Helper function to create authenticated fetch requests.
 * Assumes AuthContext provides a token accessor.
 */
const fetchAuthenticated = async (url, method = 'GET', body = null) => {
    // NOTE: You need a way to get the token, typically by passing it from the component/hook,
    // or by making this hook accessible to AuthContext (advanced pattern).
    // For simplicity, we assume the token is accessible globally or passed in.
    const token = localStorage.getItem('token'); // Simplistic access for demonstration

    if (!token) {
        throw new Error("Authentication token not found.");
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };

    const config = {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    };

    const response = await fetch(url, config);

    if (response.status === 401 || response.status === 403) {
        // Handle token expiration/invalid role
        throw new Error("Access denied or session expired.");
    }
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch data.');
    }

    return response.json();
};

/**
 * Fetches all bookings (Backoffice only) or bookings for a specific user.
 * @param {string | null} userId Optional userId to filter bookings.
 * @returns {Array<BookingModel>} List of bookings.
 */
export const getAllBookings = async (userId = null) => {
    let url = `${API_BASE_URL}/Booking/all`;
    if (userId) {
        // Append query parameter for filtering
        url += `?userId=${userId}`;
    }
    
    // The C# controller returns a List<Booking> (which is what we expect here)
    return fetchAuthenticated(url, 'GET');
};