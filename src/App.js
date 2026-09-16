import React, { useState } from 'react';
import './App.css';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SymptomChecker from './pages/SymptomChecker';
import Profile from './pages/Profile';
import Hospitals from './pages/Hospitals';
import Records from './pages/Records';
import SOSButton from './components/SOSButton';
import { LanguageProvider } from './LanguageContext';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);

  const navigate = (page) => setCurrentPage(page);

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('login');
  };

  return (
    <LanguageProvider userEmail={user?.email}>
      <div className="App">
        {currentPage === 'login' && <Login onLogin={handleLogin} navigate={navigate} />}
        {currentPage === 'register' && <Register navigate={navigate} />}
        {currentPage === 'dashboard' && <Dashboard user={user} navigate={navigate} onLogout={handleLogout} />}
        {currentPage === 'symptoms' && <SymptomChecker user={user} navigate={navigate} />}
        {currentPage === 'profile' && <Profile user={user} navigate={navigate} />}
        {currentPage === 'hospitals' && <Hospitals navigate={navigate} user={user} />}
        {currentPage === 'records' && <Records user={user} navigate={navigate} />}

        {currentPage !== 'login' && currentPage !== 'register' && (
          <SOSButton user={user} />
        )}
      </div>
    </LanguageProvider>
  );
}

export default App;