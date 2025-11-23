import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import HomePage from './pages/HomePage';
import RegistrationForm from './components/Registration/RegistrationForm';
import RenewalPage from './pages/RenewalPage';
import EventPermissionPage from './pages/EventPermissionPage';
import ExplorePage from './pages/ExplorePage';
import AdminPanel from './pages/AdminPanel';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from "./components/Admin/AdminDashboard.tsx";

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/register" element={<RegistrationForm />} />
                <Route path="/renewal" element={<RenewalPage />} />
                <Route path="/events" element={<EventPermissionPage />} />
                <Route path="/explore" element={<ExplorePage />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;