import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useDashboardData } from '../hooks/useDashboardData'; 
import DashboardContainer from '../components/Dashboard/DashboardContainer';

const DashboardPage = () => {
    const { user, token } = useAuth(); 
    
    if (!user) {
        // High-level check: No user logged in.
        return <div className="p-10 text-center text-red-500">Unauthorized Access. Please log in.</div>;
    }
    
    const userId = user?.id || ''; 
    
    // Fetch all dashboard data
    const { data: dashboardData, cards, loading, error, refetch } = useDashboardData(user.role, userId, token);

    // Determine the user's welcome message
    const roleName = {
        'Backoffice': 'System Administrator',
        'EVOwner': 'EV Owner',
        'StationOperator': 'Station Operator'
    }[user.role] || 'User';

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            {/* Header with Welcome and Refresh Button */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 tracking-tight">
                        Welcome back, {user.username}! 
                    </h2>
                    <p className="text-lg text-gray-500 mt-1">{roleName} Dashboard Overview</p>
                </div>
                <button 
                    onClick={refetch}
                    disabled={loading}
                    className={`flex items-center px-4 py-2 text-sm rounded-full transition ${
                        loading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-700 shadow hover:shadow-lg hover:bg-gray-100'
                    }`}
                >
                    <i className={`fa-solid fa-redo mr-2 ${loading ? 'animate-spin' : ''}`}></i>
                    {loading ? 'Refreshing...' : 'Refresh Data'}
                </button>
            </div>

            {/* General API Error Alert */}
            {error && (
                <div className="p-4 mb-6 text-center bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-lg shadow-md">
                    <p className="font-semibold">⚠️ Data Load Warning</p>
                    <p className="text-sm">Could not fetch all dashboard metrics ({error.message}). Displaying partial data/skeletons.</p>
                </div>
            )}
            
            {/* Pass everything to the container which handles role-specific layout */}
            <DashboardContainer 
                role={user.role} 
                dashboardData={dashboardData} 
                cards={cards} 
                loading={loading}
            />
        </div>
    );
};

export default DashboardPage;