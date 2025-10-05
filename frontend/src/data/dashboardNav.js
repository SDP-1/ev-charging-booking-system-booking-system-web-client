// src/data/dashboardNav.js

export const DASHBOARD_ROUTES = [
    {
        name: "Dashboard",
        path: "/dashboard",
        icon: "fa-solid fa-gauge-high",
        roles: ["Backoffice", "StationOperator", "EVOwner"],
    },
    // --- Backoffice Routes (System Administration) ---
    {
        name: "User Management",
        path: "/dashboard/users",
        icon: "fa-solid fa-users-gear",
        roles: ["Backoffice"],
    },
    {
        name: "Station Management",
        path: "/dashboard/stations",
        icon: "fa-solid fa-charging-station",
        roles: ["Backoffice", "StationOperator"],
    },
    {
        name: "All Bookings",
        path: "/dashboard/all-bookings",
        icon: "fa-solid fa-list-check",
        roles: ["Backoffice"],
    },
    // --- EV Owner Routes ---
    {
        name: "My Reservations",
        path: "/dashboard/my-bookings",
        icon: "fa-solid fa-calendar-check",
        roles: ["EVOwner"],
    },
    {
        name: "New Booking",
        path: "/dashboard/new-booking",
        icon: "fa-solid fa-calendar-plus",
        roles: ["EVOwner"],
    },
    // --- Station Operator Routes ---
    {
        name: "Station Ops",
        path: "/dashboard/operator",
        icon: "fa-solid fa-clipboard-check",
        roles: ["StationOperator"],
    },
];