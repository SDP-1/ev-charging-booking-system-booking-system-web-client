import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- Upcoming Reservations (Used by EVOwner and StationOperator) ---
export const UpcomingReservations = ({ bookings, loading }) => (
    <div className="bg-white p-6 rounded-xl shadow-xl border-t-4 border-teal-500 min-h-[300px]">
        <h3 className="text-xl font-bold mb-4 text-gray-700 flex items-center">
            <i className="fa-solid fa-car-battery text-teal-500 mr-3"></i> 
            Your Upcoming Charges ({loading ? '...' : bookings?.length || 0})
        </h3>
        <div className="min-h-[6rem] max-h-48 overflow-y-auto">
             {loading ? (
                // Skeleton Loader
                <div className="space-y-3 animate-pulse">
                    <div className="h-8 bg-gray-100 rounded"></div>
                    <div className="h-8 bg-gray-100 rounded w-5/6"></div>
                </div>
            ) : bookings?.length > 0 ? (
                // Actual Bookings List
                <ul className="space-y-2">
                    {bookings.map((booking, index) => (
                        <li key={index} className="flex justify-between items-center text-sm p-2 bg-teal-50 rounded-lg hover:bg-teal-100 transition">
                            <span className="font-semibold text-gray-700">{booking.stationId || 'Unknown Station'}</span>
                            <span className="text-xs text-gray-500">
                                {new Date(booking.reservationDateTime).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
                            </span>
                        </li>
                    ))}
                </ul>
            ) : (
                // Empty State
                <p className="text-center text-gray-500 py-6 border border-dashed rounded-lg">No reservations booked for the near future.</p>
            )}
        </div>
        <button className="mt-4 w-full bg-teal-500 text-white py-2 rounded-lg font-semibold hover:bg-teal-600 transition">
            Book New Slot
        </button>
    </div>
);

// --- Booking Trend Chart (Used by Backoffice) ---
export const BookingTrendChart = ({ trend, loading }) => {
    
    const totalBookings = Object.values(trend || {}).reduce((sum, count) => sum + count, 0);

    // 🎯 DATA TRANSFORMATION
    const chartData = Object.entries(trend || {})
        .map(([dateKey, count]) => ({
            // Format the date for display (e.g., "09/28")
            date: new Date(dateKey).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            bookings: count,
        }))
        // Ensure the oldest date is first if the keys didn't guarantee order
        .sort((a, b) => new Date(a.date) - new Date(b.date));


    return (
        <div className="bg-white p-6 rounded-xl shadow-xl border-t-4 border-indigo-500 col-span-full lg:col-span-2 min-h-[300px]">
            <h3 className="text-xl font-bold mb-4 text-gray-700 flex items-center">
                <i className="fa-solid fa-chart-line text-indigo-500 mr-3"></i> 
                Booking Trend (Last 7 Days)
            </h3>
            <div className="h-64 pt-4"> {/* Added padding for axes */}
                {loading ? (
                    // Skeleton Loader
                    <div className="animate-pulse h-full w-full bg-gray-100 rounded"></div>
                ) : totalBookings > 0 ? (
                    // 🎯 ACTUAL CHART RENDERING
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="date" stroke="#8884d8" tickLine={false} axisLine={false} />
                            <YAxis stroke="#8884d8" tickLine={false} axisLine={false} allowDecimals={false} />
                            <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                labelStyle={{ fontWeight: 'bold', color: '#333' }}
                                formatter={(value) => [`${value} bookings`, 'Date']}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="bookings" 
                                stroke="#8884d8" 
                                strokeWidth={2} 
                                dot={{ fill: '#8884d8', r: 4 }}
                                activeDot={{ r: 6 }} 
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    // Empty State
                    <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg">
                        <p className="text-gray-500">No booking data available for the last 7 days.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- User Approval Widget (Used by Backoffice) ---
export const UserApprovalWidget = ({ count, loading }) => (
    <div className="bg-white p-6 rounded-xl shadow-xl border-t-4 border-orange-500 min-h-[300px]">
        <h3 className="text-xl font-bold mb-4 text-gray-700 flex items-center">
            <i className="fa-solid fa-person-circle-question text-orange-500 mr-3"></i> 
            Users Pending Approval
        </h3>
         <div className="text-4xl font-extrabold text-orange-600 mb-4">
            {loading ? (
                <div className="animate-pulse h-10 w-1/3 bg-orange-200 rounded"></div>
            ) : (
                // If not loading, render the count directly inside the <div>
                count
            )}
        </div>
        <button className="w-full bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition">
            Review Applications
        </button>
    </div>
);