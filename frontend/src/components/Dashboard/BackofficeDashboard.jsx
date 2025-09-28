import React from 'react';
// 🎯 CORRECTED IMPORT: Use SharedComponents for named exports
import { BookingTrendChart, UserApprovalWidget } from './SharedComponents'; 

const BackofficeDashboard = ({ data, loading }) => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Occupies 2/3 of the row for the chart */}
        <BookingTrendChart 
            trend={data?.bookingTrend} 
            loading={loading}
        /> 
        {/* Occupies 1/3 for the quick action widget */}
        <UserApprovalWidget 
            count={data?.pendingUserApprovals} 
            loading={loading}
        /> 
        
        <div className="lg:col-span-full bg-white p-6 rounded-xl shadow-xl border-t-4 border-gray-500 mt-6 min-h-[150px]">
            <h3 className="text-xl font-bold mb-4 text-gray-700">Recent System Activity Log</h3>
            <p className="text-gray-500">
                {loading ? "Loading activity log..." : "[High-Priority Log/Audit Trail Table]"}
            </p>
        </div>
    </div>
);

export default BackofficeDashboard;