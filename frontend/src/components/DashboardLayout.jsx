import React from 'react';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children }) => {
    return (
        <div className="flex h-screen bg-gray-100">
            {/* 1. Sidebar */}
            <Sidebar />

            {/* 2. Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden ml-64"> 
                
                {/* Header/Nav (Optional - can be added here) */}
                <header className="flex items-center justify-between p-4 bg-white shadow-md">
                    <h1 className="text-xl font-bold text-gray-800">EV Charging System</h1>
                </header>

                {/* Content Container */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;