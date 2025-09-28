import { useState, useEffect, useCallback } from 'react';
import axios from 'axios'; 

// Base URL for the API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Defines the single, unified dashboard endpoint.
 * The backend controller handles the role-specific filtering.
 */
const DASHBOARD_STATS_ENDPOINT = `${API_BASE_URL}/Dashboard/stats`;


// --- Data Mapping Functions (Aligned with C# DashboardDto) ---

const mapBackofficeDataToCards = (data) => [
    { 
        title: "Total Bookings", 
        value: data?.totalBookings?.toLocaleString() || '...', 
        icon: "fa-solid fa-chart-bar", 
        bgColor: "from-purple-500 to-indigo-600" 
    },
    { 
        title: "Upcoming Bookings", 
        value: data?.upcomingBookingsCount?.toLocaleString() || '0', 
        icon: "fa-solid fa-calendar-alt", 
        bgColor: "from-blue-500 to-sky-600" 
    },
    { 
        title: "Pending Approvals (Users)", 
        value: data?.pendingUserApprovals?.toLocaleString() || '0', 
        icon: "fa-solid fa-user-clock", 
        bgColor: "from-yellow-500 to-orange-600",
        linkTo: '/backoffice/approvals'
    },
    { 
        title: "Total Stations", 
        value: data?.totalStations?.toLocaleString() || '0', 
        icon: "fa-solid fa-charging-station", 
        bgColor: "from-green-500 to-teal-600" 
    },
];

const mapEVOwnerDataToCards = (data) => [
    { 
        title: "Total Completed Charges", 
        value: data?.totalCompletedCharges?.toLocaleString() || '0', 
        icon: "fa-solid fa-history", 
        bgColor: "from-blue-500 to-indigo-600" 
    },
    { 
        title: "Upcoming Reservations", 
        value: data?.upcomingBookingsCount?.toLocaleString() || '0', 
        icon: "fa-solid fa-car-battery", 
        bgColor: "from-green-500 to-teal-600",
        linkTo: '/reservations'
    },
    // Mocked for UX, actual value comes from other logic not in the DTO
    { 
        title: "Nearest Stations", 
        value: '5+', 
        icon: "fa-solid fa-map-marker-alt", 
        bgColor: "from-yellow-500 to-orange-600" 
    }, 
    { 
        title: "Total Bookings", 
        value: data?.totalBookings?.toLocaleString() || '0', 
        icon: "fa-solid fa-receipt", 
        bgColor: "from-gray-500 to-slate-600" 
    },
];

const mapStationOperatorDataToCards = (data) => [
    { 
        title: "Total Upcoming Bookings", 
        value: data?.upcomingBookingsCount?.toLocaleString() || '0', 
        icon: "fa-solid fa-calendar-day", 
        bgColor: "from-blue-600 to-cyan-700",
        linkTo: '/operator/schedule'
    },
    { 
        title: "Available Slots Today", 
        value: data?.availableSlotsToday?.toLocaleString() || '0', 
        icon: "fa-solid fa-plug-circle-bolt", 
        bgColor: "from-green-600 to-emerald-700" 
    },
    { 
        title: "Booked Slots Today", 
        value: data?.bookedSlotsToday?.toLocaleString() || '0', 
        icon: "fa-solid fa-calendar-check", 
        bgColor: "from-yellow-600 to-amber-700" 
    },
    { 
        title: "Total Active Slots", 
        value: (data?.availableSlotsToday + data?.bookedSlotsToday)?.toLocaleString() || 'N/A', 
        icon: "fa-solid fa-clipboard-check", 
        bgColor: "from-red-600 to-pink-700" 
    },
];


export const useDashboardData = (role, userId, token) => {
    const [data, setData] = useState(null);
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        if (!role || !token) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        
        try {
            // Use the unified endpoint. The backend handles role logic.
            const response = await axios.get(DASHBOARD_STATS_ENDPOINT, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const statsData = response.data;
            setData(statsData);

            // Map fetched stats to UI cards based on the role returned by the backend
            let newCards = [];
            if (statsData.role === 'Backoffice') {
                newCards = mapBackofficeDataToCards(statsData);
            } else if (statsData.role === 'EVOwner') {
                newCards = mapEVOwnerDataToCards(statsData);
            } else if (statsData.role === 'StationOperator') {
                newCards = mapStationOperatorDataToCards(statsData);
            }
            setCards(newCards);

        } catch (err) {
            console.error("Dashboard Fetch Error:", err);
            setError(err);
            
            // Fallback to static cards with default '...' or '0' values for better UX
            if (role === 'Backoffice') setCards(mapBackofficeDataToCards(null));
            if (role === 'EVOwner') setCards(mapEVOwnerDataToCards(null));
            if (role === 'StationOperator') setCards(mapStationOperatorDataToCards(null));
        } finally {
            setLoading(false);
        }
    }, [role, userId, token]);

    useEffect(() => {
        fetchData();
        // Set up an optional refresh interval (e.g., every 5 minutes for live data)
        const interval = setInterval(fetchData, 300000); 
        return () => clearInterval(interval); // Cleanup interval on component unmount
    }, [fetchData]);

    // Return the refetch function to allow manual refresh by the user
    return { data, cards, loading, error, refetch: fetchData };
};