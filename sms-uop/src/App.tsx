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
import AboutPage from './pages/AboutPage';
import GuidelinesPage from './pages/GuidelinesPage';
import HelpPage from './pages/HelpPage';


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
                <Route path="/about" element={<AboutPage />} />
                <Route path="/guidelines" element={<GuidelinesPage />} />
                <Route path="/help" element={<HelpPage />} />
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