import React from 'react';
import StatCard from '../StatCard'; // Assuming this path and component exist
import EVOwnerDashboard from './EVOwnerDashboard';
import BackofficeDashboard from './BackofficeDashboard';
import StationOperatorDashboard from './StationOperatorDashboard';

const SkeletonCard = () => (
    <div className="p-5 rounded-xl shadow-lg bg-gray-200 animate-pulse h-32">
        <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-gray-300 rounded w-3/4"></div>
    </div>
);

const DashboardContainer = ({ role, dashboardData, cards, loading }) => {
    
    const roleDashboardMap = {
        'EVOwner': EVOwnerDashboard,
        'Backoffice': BackofficeDashboard,
        'StationOperator': StationOperatorDashboard,
    };

    const RoleSpecificDashboard = roleDashboardMap[role];

    if (!RoleSpecificDashboard) {
        return <div className="p-10 text-center text-red-500">Invalid user role assigned.</div>;
    }
    
    return (
        <>
            {/* 1. Metrics Grid (Always renders skeletons while loading) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {loading 
                    ? Array(4).fill(null).map((_, index) => <SkeletonCard key={index} />) 
                    : cards.map((item, index) => (
                        // StatCard is expected to be a default export from '../StatCard'
                        <StatCard key={index} {...item} loading={false} /> 
                    ))
                }
            </div>

            {/* 2. Role-Specific Main Content Area */}
            <RoleSpecificDashboard 
                data={dashboardData} 
                loading={loading}
            />
        </>
    );
};

export default DashboardContainer;