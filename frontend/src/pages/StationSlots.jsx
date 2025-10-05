import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const fmtDate = (d) => {
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const StationSlots = () => {
    const { stationId } = useParams(); // comes from /stations/:stationId/book
    const navigate = useNavigate();

    const [selectedDate, setSelectedDate] = useState(() => fmtDate(new Date()));
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    const [onlyAvailable, setOnlyAvailable] = useState(false);

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

    const toLocal = (iso) =>
        new Date(iso).toLocaleString([], {
            hour: "2-digit",
            minute: "2-digit",
            year: "numeric",
            month: "short",
            day: "2-digit",
        });

    // Delete a single slot
    const deleteSlot = async (slotId) => {
        if (!confirm("Delete this slot?")) return;
        try {
            await fetch(`${BASE}/chargingslot/${slotId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchSlots();
        } catch {
            alert("Failed to delete slot");
        }
    };

    // Remove all slots for the selected date
    const removeAllSlots = async () => {
        if (!confirm(`Delete all slots for ${selectedDate}?`)) return;
        try {
            await fetch(`${BASE}/chargingslot/deinit/${stationId}/${selectedDate}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchSlots();
        } catch {
            alert("Failed to remove all slots");
        }
    };

    const bookSlot = async (slot) => {
        if (!confirm(`Confirm booking for slot ${toLocal(slot.startTime)} → ${toLocal(slot.endTime)}?`)) return;

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${BASE}/booking/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    StationId: slot.stationId, // Send the station ObjectId
                    SlotId: slot.id           // Send the slot ObjectId
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data?.title || `Booking failed (${res.status})`);
            }

            alert("Booking successful!");
            fetchSlots(); // Refresh slots after booking
        } catch (e) {
            alert(e.message);
        }
    };


    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top bar */}
            <div className="mx-auto w-full max-w-6xl px-4 py-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-100"
                    >
                        ← Back
                    </button>
                    <h1 className="text-2xl font-bold">Station Slots</h1>
                    <span className="text-sm text-gray-500">ID: {stationId}</span>
                </div>

                {/* date + filters */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => changeDay(-1)}
                        className="px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-100"
                        title="Previous day"
                    >
                        ◀
                    </button>

                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2"
                    />

                    <button
                        onClick={() => changeDay(1)}
                        className="px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-100"
                        title="Next day"
                    >
                        ▶
                    </button>

                    <label className="ml-2 flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={onlyAvailable}
                            onChange={(e) => setOnlyAvailable(e.target.checked)}
                            className="accent-indigo-500"
                        />
                        Only available
                    </label>
                </div>
            </div>

            {/* Remove All Slots button */}
            <div className="mx-auto w-full max-w-6xl px-4 mb-4 flex justify-end">
                <button
                    type="button"
                    className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600"
                    onClick={removeAllSlots}
                >
                    Remove All Slots
                </button>
            </div>

            {/* Content */}
            <div className="mx-auto w-full max-w-6xl px-4 pb-10">
                {loading && <div className="text-gray-600">Loading slots…</div>}

                {err && (
                    <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded-md">
                        {err}
                    </div>
                )}

                {!loading && !err && visible.length === 0 && (
                    <div className="text-gray-600">
                        No slots for <strong>{selectedDate}</strong>.
                    </div>
                )}

                {visible.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {/* Header */}
                        <div className="grid grid-cols-4 gap-4 bg-gray-100 text-gray-700 font-semibold text-sm px-4 py-3 border-b">
                            <div>Slot ID</div>
                            <div>Time</div>
                            <div>Status</div>
                            <div className="text-right">Action</div>
                        </div>

                        {/* Rows */}
                        {visible.map((s, idx) => (
                            <div
                                key={s.id}
                                className={`grid grid-cols-4 gap-4 items-center px-4 py-3 text-sm ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                                    } border-b last:border-0`}
                            >
                                {/* Slot ID */}
                                <div className="truncate text-gray-800" title={s.id}>
                                    {s.id}
                                </div>

                                {/* Time */}
                                <div className="text-gray-700">
                                    {toLocal(s.startTime)} → {toLocal(s.endTime)}
                                </div>

                                {/* Status */}
                                <div>
                                    <span
                                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.isBooked
                                            ? "bg-red-100 text-red-700"
                                            : "bg-green-100 text-green-700"
                                            }`}
                                    >
                                        {s.isBooked ? "Booked" : "Available"}
                                    </span>
                                </div>

                                {/* Action */}
                                <div className="text-right flex justify-end gap-2">
                                    <button
                                        type="button"
                                        disabled={s.isBooked}
                                        className={`px-3 py-1.5 rounded-md text-sm transition ${s.isBooked
                                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                                : "bg-indigo-500 text-white hover:bg-indigo-600"
                                            }`}
                                        onClick={() => bookSlot(s)}
                                    >
                                        {s.isBooked ? "N/A" : "Book"}
                                    </button>

                                    {/* Delete single slot button */}
                                    <button
                                        type="button"
                                        className="px-3 py-1.5 rounded-md text-sm bg-red-500 text-white hover:bg-red-600"
                                        onClick={() => deleteSlot(s.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StationSlots;
