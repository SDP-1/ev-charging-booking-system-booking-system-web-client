import React from 'react';
import { useAuth } from '../context/AuthContext';

// Simple Card Component for Metrics
const StatCard = ({ title, value, icon, bgColor }) => (
    <div className={`p-5 rounded-lg shadow-lg text-white ${bgColor}`}>
        <div className="flex items-center justify-between">
            <i className={`${icon} text-3xl opacity-75`}></i>
            <div className="text-right">
                <p className="text-3xl font-bold">{value}</p>
                <p className="text-sm uppercase font-medium">{title}</p>
            </div>
        </div>
    </div>
);

const DashboardPage = () => {
    const { user } = useAuth();
    
    // Simulate data based on user role (based on your mobile app requirements)
    const dashboardData = {
        EVOwner: [
            { title: "Pending Reservations", value: "3", icon: "fa-solid fa-hourglass-half", bgColor: "bg-yellow-500" },
            { title: "Approved Reservations", value: "2", icon: "fa-solid fa-check-circle", bgColor: "bg-green-500" },
            { title: "Past Charges (Total)", value: "15", icon: "fa-solid fa-history", bgColor: "bg-blue-500" },
            { title: "Nearest Stations", value: "5", icon: "fa-solid fa-map-marker-alt", bgColor: "bg-indigo-500" },
        ],
        Backoffice: [
            { title: "Total Users", value: "150", icon: "fa-solid fa-users", bgColor: "bg-purple-600" },
            { title: "Active Stations", value: "24", icon: "fa-solid fa-plug", bgColor: "bg-teal-600" },
            { title: "Upcoming Bookings", value: "48", icon: "fa-solid fa-calendar-alt", bgColor: "bg-orange-600" },
            { title: "Revenue (Today)", value: "$1,200", icon: "fa-solid fa-dollar-sign", bgColor: "bg-red-600" },
        ],
        StationOperator: [
             { title: "Today's Bookings", value: "12", icon: "fa-solid fa-calendar-day", bgColor: "bg-blue-600" },
             { title: "Confirmed for Start", value: "3", icon: "fa-solid fa-clipboard-check", bgColor: "bg-green-600" },
             { title: "Slots Available", value: "7", icon: "fa-solid fa-car-battery", bgColor: "bg-yellow-600" },
             { title: "Completed Sessions", value: "9", icon: "fa-solid fa-bolt", bgColor: "bg-gray-600" },
        ]
    };

    const data = dashboardData[user?.role] || dashboardData.Backoffice; // Default to Backoffice if role is unknown

    return (
        <>
            <h2 className="text-3xl font-semibold mb-6 text-gray-800">
                {user.role} Dashboard
            </h2>

            {/* Advanced Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {data.map((item, index) => (
                    <StatCard key={index} {...item} />
                ))}
            </div>

            {/* Component Placeholder - Example for EV Owner */}
            {user.role === 'EVOwner' && (
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-semibold mb-4">Nearby Charging Stations Map</h3>
                    <div className="h-64 bg-gray-200 flex items-center justify-center text-gray-500 rounded-md">
                        [Google Maps API Integration Placeholder]
                    </div>
                </div>
            )}
            
            {/* Component Placeholder - Example for Backoffice */}
            {user.role === 'Backoffice' && (
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-semibold mb-4">Recent System Activity Log</h3>
                    <p className="text-gray-600">[Log/Audit Trail Table Placeholder]</p>
                </div>
            )}
        </>
    );
};

export default DashboardPage;