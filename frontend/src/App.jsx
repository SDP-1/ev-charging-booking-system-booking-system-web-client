import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Dashboard Components
import DashboardLayout from './components/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import UserManagementPage from './pages/UserManagementPage';
import AllBookings from './pages/AllBookings';
import ChargingStations from './pages/ChargingStations';
import CreateStation from './pages/CreateStation';
import StationSlots from './pages/StationSlots';
import StationDetails from './pages/StationDetails';

// ----------------------------------------------------------------------
// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, token } = useAuth();

    if (!token) {
        // Not logged in: Redirect to login
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        // Logged in but wrong role: Redirect to unauthorized page (or home)
        return <h1 className="text-red-500 p-8">403 Forbidden: Insufficient role.</h1>;
    }

    return <DashboardLayout>{children}</DashboardLayout>;
};
// ----------------------------------------------------------------------

function App() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Protected Dashboard Routes 
            We use a single DashboardLayout wrapper for the main dashboard views
            */}

            {/* General Dashboard (All Roles) */}
            <Route
                path="/dashboard"
                element={<ProtectedRoute allowedRoles={["Backoffice", "StationOperator", "EVOwner"]}><DashboardPage /></ProtectedRoute>}
            />

            {/* Backoffice Admin Routes */}
            <Route
                path="/dashboard/users"
                element={<ProtectedRoute allowedRoles={["Backoffice"]}><UserManagementPage /></ProtectedRoute>}
            />
            <Route
                path="/dashboard/stations"
                element={<ProtectedRoute allowedRoles={["Backoffice", "StationOperator"]}><ChargingStations /></ProtectedRoute>}
            />
            <Route
                path="/dashboard/stations/create"
                element={<ProtectedRoute allowedRoles={["Backoffice", "StationOperator"]}><CreateStation /></ProtectedRoute>}
            />
            <Route
                path="/dashboard/stations/:stationId/book"
                element={
                    <ProtectedRoute allowedRoles={["Backoffice", "StationOperator"]}>
                        <StationSlots />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/dashboard/stations/:stationId"
                element={<ProtectedRoute allowedRoles={["Backoffice", "StationOperator", "EVOwner"]}><StationDetails /></ProtectedRoute>}
            />

            <Route
                path="/dashboard/all-bookings"
                element={<ProtectedRoute allowedRoles={["Backoffice"]}><AllBookings /></ProtectedRoute>}
            />

            {/* Fallback */}
            <Route path="*" element={<h1 className="text-red-500 p-8">404 Page Not Found</h1>} />
        </Routes>
    );
}

export default App;