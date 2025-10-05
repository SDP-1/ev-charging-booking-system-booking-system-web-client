// src/pages/ChargingStations.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmInitModal from "../components/common/ConfirmInitModal";

const ChargingStations = () => {
    const navigate = useNavigate();
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState('');
    const [initStation, setInitStation] = useState(null);


    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const token = localStorage.getItem('token'); // 👈 get token
                const url = `${import.meta.env.VITE_API_BASE_URL}/chargingstation/all`;

                const res = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}), // 👈 attach it if exists
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

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top bar */}
            <div className="mx-auto w-full max-w-6xl px-4 py-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Charging Stations</h1>
                <div className="flex gap-3">
                    <button
                        onClick={goCreate}
                        className="px-4 py-2 rounded-md bg-indigo-500 text-white hover:bg-indigo-600 transition"
                    >
                        Create Station
                    </button>
                    <button
                        onClick={goMap}
                        className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100 transition"
                    >
                        Map View
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="mx-auto w-full max-w-6xl px-4 pb-10">
                {loading && <div className="text-gray-600">Loading stations…</div>}

                {err && (
                    <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded-md">
                        {err}
                    </div>
                )}

                {!loading && !err && stations.length === 0 && (
                    <div className="text-gray-600">No stations found.</div>
                )}

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {stations.map((s) => (
                        <div
                            key={s.id}
                            className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h3 className="text-lg font-semibold">{s.name}</h3>
                                    <p className="text-sm text-gray-600">{s.location}</p>
                                </div>
                                <span
                                    className={`px-2 py-0.5 text-xs rounded-full ${s.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                        }`}
                                >
                                    {s.active ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-base">bolt</span>
                                    <span>
                                        Type: <strong>{s.type || '—'}</strong>
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => goBook(s.id)}
                                    className="px-4 py-2 rounded-md bg-indigo-500 text-white hover:bg-indigo-600 transition"
                                >
                                    Book Slot
                                </button>
                                <button
                                    type="button"
                                    onClick={() => goDetails(s.id)}
                                    className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 transition"
                                >
                                    Details
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setInitStation(s.id)}
                                    className="px-4 py-2 rounded-md bg-yellow-500 text-white hover:bg-yellow-600 transition"
                                >
                                    Initialize Slots
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
