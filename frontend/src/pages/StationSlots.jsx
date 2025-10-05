import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
    ArrowLeftIcon, 
    ChevronLeftIcon, 
    ChevronRightIcon, 
    CalendarIcon, 
    ClockIcon, 
    CheckCircleIcon, 
    XCircleIcon,
    BuildingOffice2Icon 
} from '@heroicons/react/24/outline';
import BookSlotModal from '../components/station/BookSlotModal'; 
import DeleteSlotModal from '../components/station/DeleteSlotModal';
import RemoveAllSlotsModal from '../components/station/RemoveAllSlotsModal';

const fmtDate = (d) => {
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const StationSlots = () => {
    const { stationId } = useParams();
    const navigate = useNavigate();

    const [selectedDate, setSelectedDate] = useState(() => fmtDate(new Date()));
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    const [onlyAvailable, setOnlyAvailable] = useState(false);

    // Modal states
    const [showBookModal, setShowBookModal] = useState(null); // Slot or null
    const [showDeleteModal, setShowDeleteModal] = useState(null); // Slot ID or null
    const [showRemoveAllModal, setShowRemoveAllModal] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);

    const BASE = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem("token");

    const url = useMemo(
        () => `${BASE}/chargingslot/all/${stationId}/${selectedDate}`,
        [BASE, stationId, selectedDate]
    );

    const fetchSlots = async () => {
        try {
            setLoading(true);
            setErr("");
            const res = await fetch(url, {
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error(`Failed to fetch slots (${res.status})`);
            const data = await res.json();
            setSlots(Array.isArray(data) ? data : []);
        } catch (e) {
            setErr(e.message || "Failed to load slots.");
            setSlots([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (stationId) fetchSlots();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stationId, selectedDate]);

    const changeDay = (delta) => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + delta);
        setSelectedDate(fmtDate(d));
    };

    const visible = useMemo(
        () => (onlyAvailable ? slots.filter((s) => !s.isBooked) : slots),
        [slots, onlyAvailable]
    );

    // Compute stats from slots data
    const totalSlots = slots.length;
    const availableSlots = slots.filter((s) => !s.isBooked).length;
    const bookedSlots = totalSlots - availableSlots;

    const toLocal = (iso) =>
        new Date(iso).toLocaleString([], {
            hour: "2-digit",
            minute: "2-digit",
            year: "numeric",
            month: "short",
            day: "2-digit",
        });

    // Book slot handler
    const handleBookSlot = async (slot) => {
        setModalLoading(true);
        try {
            const res = await fetch(`${BASE}/booking/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    StationId: slot.stationId,
                    SlotId: slot.id
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data?.title || `Booking failed (${res.status})`);
            }

            // Success feedback could be a toast here instead of alert
            alert("Booking successful!"); // Replace with toast lib if available
            fetchSlots();
        } catch (e) {
            throw e; // Re-throw for modal error display
        } finally {
            setModalLoading(false);
        }
    };

    // Delete single slot handler
    const handleDeleteSlot = async (slotId) => {
        setModalLoading(true);
        try {
            await fetch(`${BASE}/chargingslot/${slotId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchSlots();
        } catch {
            throw new Error("Failed to delete slot");
        } finally {
            setModalLoading(false);
        }
    };

    // Remove all slots handler
    const handleRemoveAllSlots = async () => {
        setModalLoading(true);
        try {
            await fetch(`${BASE}/chargingslot/deinit/${stationId}/${selectedDate}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchSlots();
        } catch {
            throw new Error("Failed to remove all slots");
        } finally {
            setModalLoading(false);
        }
    };

    // Loading skeleton for cards
    const renderSkeletonCard = () => (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 animate-pulse">
            <div className="flex items-center justify-between mb-4">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="h-12 bg-gray-200 rounded mb-4"></div>
            <div className="flex gap-2">
                <div className="h-10 bg-gray-200 rounded flex-1"></div>
                <div className="h-10 bg-gray-200 rounded w-20"></div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 md:p-8 lg:p-10"> {/* Matched UserManagementPage padding */}
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading slots...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 lg:p-10 bg-gray-50 min-h-screen"> {/* Matched UserManagementPage outer div */}
            {/* Header */}
            <div className="mx-auto w-full max-w-7xl px-4 flex items-center justify-between mb-6"> {/* Matched mb-6 */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-xl border border-gray-300 hover:bg-gray-100 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                        aria-label="Go back"
                    >
                        <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
                    </button>
                    <div className="flex items-center gap-3">
                        <BuildingOffice2Icon className="h-6 w-6 text-indigo-600" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Station Slots</h1> {/* Matched text-3xl */}
                            <p className="text-sm text-gray-500">ID: {stationId}</p>
                        </div>
                    </div>
                </div>

                {/* Date Controls - Wrapped in card for consistency */}
                <div className="flex items-center gap-4 bg-white rounded-xl p-3 shadow-sm border border-gray-200"> {/* Already card-like */}
                    <button
                        onClick={() => changeDay(-1)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
                        title="Previous day"
                        aria-label="Previous day"
                    >
                        <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
                    </button>

                    <div className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5 text-gray-400" />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="border-0 bg-transparent px-2 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
                        />
                    </div>

                    <button
                        onClick={() => changeDay(1)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
                        title="Next day"
                        aria-label="Next day"
                    >
                        <ChevronRightIcon className="h-5 w-5 text-gray-600" />
                    </button>

                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg">
                        <input
                            type="checkbox"
                            checked={onlyAvailable}
                            onChange={(e) => setOnlyAvailable(e.target.checked)}
                            className="accent-indigo-500 rounded"
                        />
                        Only available
                    </label>
                </div>
            </div>

            {/* Stats Section */}
            {!err && !loading && (
                <div className="mx-auto w-full max-w-7xl px-4 py-6 mb-8"> {/* Added mb-8 to match UserManagement spacing */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6"> {/* Matched gap-6 */}
                        {/* Total Slots */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 transform hover:-translate-y-1">
                            <div className="flex items-center">
                                <div className="p-3 rounded-xl bg-indigo-100 text-indigo-600">
                                    <ClockIcon className="h-6 w-6" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Slots</p>
                                    <p className="text-3xl font-bold text-gray-900">{totalSlots}</p> {/* Matched text-3xl */}
                                </div>
                            </div>
                        </div>

                        {/* Available Slots */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 transform hover:-translate-y-1">
                            <div className="flex items-center">
                                <div className="p-3 rounded-xl bg-green-100 text-green-600">
                                    <CheckCircleIcon className="h-6 w-6" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Available</p>
                                    <p className="text-3xl font-bold text-gray-900">{availableSlots}</p> {/* Matched text-3xl */}
                                </div>
                            </div>
                        </div>

                        {/* Booked Slots */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 transform hover:-translate-y-1">
                            <div className="flex items-center">
                                <div className="p-3 rounded-xl bg-red-100 text-red-600">
                                    <XCircleIcon className="h-6 w-6" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Booked</p>
                                    <p className="text-3xl font-bold text-gray-900">{bookedSlots}</p> {/* Matched text-3xl */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Actions - Wrapped in card-like row for consistency */}
            <div className="mx-auto w-full max-w-7xl px-4 mb-6 flex justify-end bg-white rounded-2xl shadow-sm border border-gray-200 p-6"> {/* Wrapped in full card */}
                <button
                    type="button"
                    onClick={() => setShowRemoveAllModal(true)}
                    className="px-6 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                    <XCircleIcon className="h-5 w-5" />
                    Remove All Slots
                </button>
            </div>

            {/* Content */}
            <div className="mx-auto w-full max-w-7xl px-4 pb-10"> {/* Matched UserManagement content wrapper */}
                {err && (
                    <div className="mb-6 p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-2xl shadow-sm flex items-center">
                        <XCircleIcon className="h-5 w-5 mr-2" />
                        {err}
                    </div>
                )}

                {!loading && !err && visible.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-200"> {/* Matched card style */}
                        <ClockIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No slots available</h3>
                        <p className="text-gray-500 mb-6">
                            No {onlyAvailable ? 'available' : ''} slots found for <strong>{selectedDate}</strong>. Try another date or initialize slots.
                        </p>
                    </div>
                )}

                {visible.length > 0 && (
                    <div className="relative">
                        {/* Timeline Container */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Matched gap-6 */}
                            {visible.map((s, idx) => (
                                <div key={s.id} className="relative group">
                                    {/* Timeline Line (vertical connector) */}
                                    {idx < visible.length - 1 && (
                                        <div className="absolute left-1/2 top-full -translate-x-1/2 h-8 w-0.5 bg-gray-200 hidden md:block"></div>
                                    )}
                                    {/* Timeline Dot */}
                                    <div className="absolute -left-3 top-6 w-1.5 h-1.5 bg-indigo-500 rounded-full hidden md:block"></div>

                                    {/* Slot Card */}
                                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group-hover:bg-indigo-50">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-mono text-gray-500 truncate" title={s.id}>
                                                    {s.id}
                                                </p>
                                            </div>
                                            <span
                                                className={`inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                                                    s.isBooked
                                                        ? "bg-red-100 text-red-800 ring-1 ring-inset ring-red-200"
                                                        : "bg-green-100 text-green-800 ring-1 ring-inset ring-green-200"
                                                }`}
                                            >
                                                {s.isBooked ? "Booked" : "Available"}
                                            </span>
                                        </div>

                                        <div className="mb-6">
                                            <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                                                <ClockIcon className="h-5 w-5 text-indigo-600" />
                                                {toLocal(s.startTime)} → {toLocal(s.endTime)}
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                disabled={s.isBooked}
                                                onClick={() => setShowBookModal(s)}
                                                className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                                                    s.isBooked
                                                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                                        : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow-md"
                                                }`}
                                            >
                                                {s.isBooked ? "N/A" : "Book Now"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setShowDeleteModal({ id: s.id, time: `${toLocal(s.startTime)} → ${toLocal(s.endTime)}` })}
                                                className="px-4 py-3 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-all shadow-sm hover:shadow-md"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Modals */}
                {showBookModal && (
                    <BookSlotModal
                        slot={showBookModal}
                        onConfirm={handleBookSlot}
                        onClose={() => setShowBookModal(null)}
                        isLoading={modalLoading}
                    />
                )}
                {showDeleteModal && (
                    <DeleteSlotModal
                        slotId={showDeleteModal.id}
                        slotTime={showDeleteModal.time}
                        onConfirm={handleDeleteSlot}
                        onClose={() => setShowDeleteModal(null)}
                        isLoading={modalLoading}
                    />
                )}
                {showRemoveAllModal && (
                    <RemoveAllSlotsModal
                        date={selectedDate}
                        onConfirm={handleRemoveAllSlots}
                        onClose={() => setShowRemoveAllModal(false)}
                        isLoading={modalLoading}
                    />
                )}
            </div>
        </div>
    );
};

export default StationSlots;