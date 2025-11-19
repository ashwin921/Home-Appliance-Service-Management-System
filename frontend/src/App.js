import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import SignupStepper from './pages/SignupStepper';
import Home from './pages/Home';
import BookService from './pages/BookService';
import Bookings from './pages/Bookings';
import Support from './pages/Support';
import Profile from './pages/Profile';
import Technician from './pages/Technician';
import Navbar from './components/Navbar';
import authService from './services/auth.service';


const ProtectedRoute = ({ children }) => {
    const user = authService.getCurrentUser();
    if (!user) {
        return <Navigate to="/login" />;
    }
    return (
        <>
            <Navbar />
            {children}
        </>
    );
};


const Dashboard = () => {
    const user = authService.getCurrentUser();
    return (
        <div style={{ padding: '20px' }}>
            <h1>Welcome, {user.fname}!</h1>
            <button onClick={() => {
                authService.logout();
                window.location.href = '/login';
            }}>
                Logout
            </button>
        </div>
    );
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<SignupStepper />} />
                <Route
                    path="/home"
                    element={
                        <ProtectedRoute>
                            <Home />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/book-service"
                    element={
                        <ProtectedRoute>
                            <BookService />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/bookings"
                    element={
                        <ProtectedRoute>
                            <Bookings />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/support"
                    element={
                        <ProtectedRoute>
                            <Support />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    }
                />
                <Route path="/technician/*" element={<Technician />} />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    );
}

export default App;