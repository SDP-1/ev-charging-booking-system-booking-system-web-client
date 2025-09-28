import React from 'react';

const StatCard = ({ title, value, icon, bgColor, loading }) => {
    
    // Skeleton Loader effect for better loading UX
    if (loading) {
        return (
            <div className={`p-5 rounded-xl shadow-xl bg-gray-200 animate-pulse`}>
                <div className="h-6 w-1/4 bg-gray-300 rounded mb-3"></div>
                <div className="h-8 w-1/2 bg-gray-300 rounded"></div>
                <div className="h-4 w-3/4 bg-gray-300 rounded mt-2"></div>
            </div>
        );
    }
    
    return (
        <div className={`p-6 rounded-xl shadow-2xl text-white transform hover:scale-[1.02] transition duration-300 ease-in-out bg-gradient-to-br ${bgColor}`}>
            <div className="flex items-center justify-between">
                {/* Font Awesome Icons */}
                <i className={`${icon} text-4xl opacity-80`}></i>
                <div className="text-right">
                    <p className="text-4xl font-extrabold">{value}</p>
                    <p className="text-sm uppercase font-medium mt-1 tracking-wider">{title}</p>
                </div>
            </div>
        </div>
    );
};

export default StatCard;