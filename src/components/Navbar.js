import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Stethoscope, MapPin, ClipboardList, UserCircle, LogOut, MessageSquare, ShieldPlus, Settings, Moon, Sun } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

function Navbar({ navigate, currentPage, onLogout, user }) {
  const { t } = useLanguage();
  const [showSettings, setShowSettings] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  const profile = user?.email
    ? JSON.parse(localStorage.getItem(`profile_${user.email}`) || '{}')
    : {};

  const navItems = [
    { key: 'dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { key: 'symptoms', icon: Stethoscope, label: t('symptomChecker') },
    { key: 'hospitals', icon: MapPin, label: t('hospitals') },
    { key: 'records', icon: ClipboardList, label: t('records') },
  ];

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.style.setProperty('--bg-page', '#0f172a');
      document.documentElement.style.setProperty('--text-dark', '#f1f5f9');
      document.documentElement.style.setProperty('--text-medium', '#cbd5e1');
      document.documentElement.style.setProperty('--text-light', '#cbd5e1');
      document.documentElement.style.setProperty('--bg-card', '#1e293b');
      document.documentElement.style.setProperty('--border', '#334155');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.style.setProperty('--bg-page', '#ffffff');
      document.documentElement.style.setProperty('--text-dark', '#1e293b');
      document.documentElement.style.setProperty('--text-medium', '#475569');
      document.documentElement.style.setProperty('--text-light', '#94a3b8');
      document.documentElement.style.setProperty('--bg-card', '#f8fafc');
      document.documentElement.style.setProperty('--border', '#e2e8f0');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  return (
    <nav className="navbar" style={{ 
      background: isDarkMode ? '#1e293b' : 'white',
      padding: '12px 32px',
      height: 'auto',
      minHeight: 'auto'
    }}>
      {/* MediGuard Logo */}
      <span
        className="navbar-brand"
        onClick={() => navigate('dashboard')}
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', minHeight: 'auto' }}
      >
        {/* Shield + Cross Logo - HIGHLIGHTED */}
        <div className="logo-highlight" style={{
          width: '60px', 
          height: '50px',
          background: 'linear-gradient(135deg, #0fb87f, #0a8a60)',
          borderRadius: '10px',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          boxShadow: '0 0 0 3px rgba(15, 184, 127, 0.2), 0 8px 25px rgba(15, 184, 127, 0.5)',
          position: 'relative', 
          flexShrink: 0,
          cursor: 'pointer',
          border: '2px solid rgba(15, 184, 127, 0.4)',
          animation: 'logoGlow 2.5s ease-in-out infinite'
        }}>
          <ShieldPlus size={22} color="white" strokeWidth={2.5} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span style={{
            fontSize: '1.2rem', 
            fontWeight: '900',
            background: 'linear-gradient(135deg, #0fb87f, #0a8a60)',
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px'
          }}>
            MediGuard
          </span>
          <span style={{ fontSize: '0.95rem', color: 'var(--text-light)', fontWeight: '600', letterSpacing: '0.5px' }}>
            AI HEALTH PLATFORM
          </span>
        </div>
      </span>

      <div className="navbar-links" style={{ gap: '6px' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              className={currentPage === item.key ? 'active' : ''}
              onClick={() => navigate(item.key)}
              style={{ fontSize: '1.1rem', fontWeight: '600', padding: '6px 14px', height: 'auto' }}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}

        {/* Settings Button */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowSettings(!showSettings)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px 10px',
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500',
              color: 'var(--text-medium)',
              transition: 'all 0.2s',
              height: 'auto'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = isDarkMode ? '#334155' : '#f1f5f9'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <Settings size={18} />
          </button>

          {/* Settings Dropdown */}
          {showSettings && (
            <div style={{
              position: 'absolute',
              top: '40px',
              right: '0',
              background: isDarkMode ? '#1e293b' : 'white',
              border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
              borderRadius: '12px',
              padding: '12px',
              minWidth: '220px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              zIndex: 1000
            }}>
              {/* Theme Toggle */}
              <div style={{
                padding: '12px',
                borderBottom: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isDarkMode ? (
                    <Moon size={18} color="#0fb87f" />
                  ) : (
                    <Sun size={18} color="#0fb87f" />
                  )}
                  <span style={{ color: 'var(--text-dark)', fontWeight: '600', fontSize: '0.95rem' }}>
                    {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                  </span>
                </div>
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  style={{
                    width: '50px',
                    height: '26px',
                    borderRadius: '13px',
                    background: isDarkMode ? '#0fb87f' : '#cbd5e1',
                    border: 'none',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.3s',
                    padding: '2px'
                  }}
                >
                  <div style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: 'white',
                    position: 'absolute',
                    top: '2px',
                    left: isDarkMode ? '26px' : '2px',
                    transition: 'left 0.3s'
                  }} />
                </button>
              </div>

              {/* Theme Description */}
              <p style={{
                fontSize: '0.8rem',
                color: 'var(--text-light)',
                padding: '8px 12px',
                fontStyle: 'italic'
              }}>
                {isDarkMode 
                  ? '🌙 Eye-friendly dark theme' 
                  : '☀️ Bright and clean light theme'}
              </p>
            </div>
          )}
        </div>

        {/* Profile */}
        <button
          className={currentPage === 'profile' ? 'active' : ''}
          onClick={() => navigate('profile')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 10px', height: 'auto' }}
        >
          <div style={{
            width: '50px', height: '50px', borderRadius: '50%',
            background: profile.photo ? 'transparent' : 'var(--primary-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', border: '2px solid var(--border)', flexShrink: 0
          }}>
            {profile.photo
              ? <img src={profile.photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <UserCircle size={22} color="var(--primary)" />
            }
          </div>
          <span style={{ fontSize: '0.95rem', fontWeight: '600', color: currentPage === 'profile' ? 'var(--primary-dark)' : 'var(--text-medium)' }}>
            {user?.name?.split(' ')[0] || t('myProfile')}
          </span>
        </button>

        {onLogout && (
          <button onClick={onLogout} style={{ color: '#dc2626', fontSize: '1.1rem', fontWeight: '600', padding: '6px 14px', height: 'auto' }}>
            <LogOut size={18} />
            {t('logout')}
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;