// src/pages/ChargingStations.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmInitModal from "../components/common/ConfirmInitModal";
import { BoltIcon, MapPinIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline'; // Assuming Heroicons for icons; install if needed: npm i @heroicons/react

const ChargingStations = () => {
    const navigate = useNavigate();
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState('');
    const [initStation, setInitStation] = useState(null);

    // Compute stats from stations data
    const totalStations = stations.length;
    const activeStations = stations.filter(s => s.active).length;
    const inactiveStations = totalStations - activeStations;

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const token = localStorage.getItem('token');
                const url = `${import.meta.env.VITE_API_BASE_URL}/chargingstation/all`;

                const res = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                });

                if (!res.ok) throw new Error(`Failed to fetch stations (${res.status})`);
                const data = await res.json();
                if (mounted) setStations(Array.isArray(data) ? data : []);
            } catch (e) {
                if (mounted) setErr(e.message || 'Failed to load stations.');
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, []);

    const goCreate = () => navigate('/dashboard/stations/create');
    const goMap = () => navigate('/dashboard/stations/map');
    const goDetails = (id) => navigate(`/dashboard/stations/${id}`);
    const goBook = (id) => navigate(`/dashboard/stations/${id}/book`);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 md:p-8 lg:p-10">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading stations...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 lg:p-10 bg-gray-50 min-h-screen"> {/* Matched UserManagementPage padding */}
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Charging Stations</h1>
                <div className="flex gap-3">
                    <button
                        onClick={goCreate}
                        className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                    >
                        + Create Station
                    </button>
                    <button
                        onClick={goMap}
                        className="px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                    >
                        Map View
                    </button>
                </div>
            </div>

            {/* Stats Section */}
            {!err && !loading && (
                <div className="w-full px-4 py-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"> {/* Matched gap and mb for consistency */}
                        {/* Total Stations Stat */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 transform hover:-translate-y-1">
                            <div className="flex items-center">
                                <div className="p-3 rounded-xl bg-indigo-100 text-indigo-600">
                                    <BuildingOfficeIcon className="h-6 w-6" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Stations</p>
                                    <p className="text-3xl font-bold text-gray-900">{totalStations}</p> {/* Matched text-3xl size */}
                                </div>
                            </div>
                        </div>

                        {/* Active Stations Stat */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 transform hover:-translate-y-1">
                            <div className="flex items-center">
                                <div className="p-3 rounded-xl bg-green-100 text-green-600">
                                    <BoltIcon className="h-6 w-6" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Active Stations</p>
                                    <p className="text-3xl font-bold text-gray-900">{activeStations}</p> {/* Matched text-3xl size */}
                                </div>
                            </div>
                        </div>

                        {/* Inactive Stations Stat */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 transform hover:-translate-y-1">
                            <div className="flex items-center">
                                <div className="p-3 rounded-xl bg-red-100 text-red-600">
                                    <MapPinIcon className="h-6 w-6" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Inactive Stations</p>
                                    <p className="text-3xl font-bold text-gray-900">{inactiveStations}</p> {/* Matched text-3xl size */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="w-full px-4 pb-10">
                {err && (
                    <div className="mb-6 p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-2xl shadow-sm">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            {err}
                        </div>
                    </div>
                )}

                {!loading && !err && stations.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-200"> {/* Wrapped in card for consistency */}
                        <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No stations found</h3>
                        <p className="text-gray-500 mb-6">Get started by creating your first charging station.</p>
                        <button
                            onClick={goCreate}
                            className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                        >
                            Create Station
                        </button>
                    </div>
                )}

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"> {/* Matched gap-6 for consistency */}
                    {stations.map((s) => (
                        <div
                            key={s.id}
                            className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.02]"
                        >
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-xl font-bold text-gray-900 truncate">{s.name}</h3>
                                    <p className="text-sm text-gray-600 mt-1 flex items-center">
                                        <MapPinIcon className="h-4 w-4 mr-1 text-gray-400" />
                                        {s.location}
                                    </p>
                                </div>
                                <span
                                    className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                        s.active
                                            ? 'bg-green-100 text-green-800 ring-1 ring-inset ring-green-600/20'
                                            : 'bg-gray-100 text-gray-800 ring-1 ring-inset ring-gray-500/10'
                                    }`}
                                >
                                    {s.active ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <div className="p-2 bg-indigo-100 rounded-lg">
                                        <BoltIcon className="h-5 w-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500">Charger Type</p>
                                        <p className="text-sm font-semibold text-gray-900">{s.type || '—'}</p>
                                    </div>
                                </div>

                                {/* Add more stats if available in the model, e.g., capacity or slots */}
                                {/* Example: <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">...</div> */}
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => goBook(s.id)}
                                    className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 text-center"
                                >
                                    Book Slot
                                </button>
                                <button
                                    type="button"
                                    onClick={() => goDetails(s.id)}
                                    className="px-4 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                                >
                                    Details
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setInitStation(s.id)}
                                    className="px-4 py-3 rounded-xl bg-yellow-500 text-white font-medium hover:bg-yellow-600 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                                >
                                    Initialize
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {initStation && (
                <ConfirmInitModal
                    stationId={initStation}
                    onClose={() => setInitStation(null)}
                />
            )}
        </div>
    );
};

export default ChargingStations;