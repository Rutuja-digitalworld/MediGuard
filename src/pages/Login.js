import React, { useState, useEffect } from 'react';
import { ShieldPlus, Mail, Lock, LogIn, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import DoctorIllustration from '../components/DoctorIllustration';

function Login({ onLogin, navigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();
useEffect(() => {
  const savedEmail = localStorage.getItem('lastRegisteredEmail');

  if (savedEmail) {
    setEmail(savedEmail);
  }
}, []);
  const handleLogin = async () => {
    if (!email || !password) {
      setMessage({ type: 'error', text: t('fillFields') });
      return;
    }

    setLoading(true);

    const users = JSON.parse(localStorage.getItem('healthai_users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);

    setTimeout(() => {
      if (user) {
        setMessage({ type: 'success', text: t('loginSuccess') });
        setTimeout(() => onLogin(user), 1000);
      } else {
        setMessage({ type: 'error', text: t('loginFailed') });
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0fdf9 0%, #f8fafc 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute', top: '-150px', right: '-150px',
        width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(15,157,110,0.08) 0%, transparent 70%)',
        borderRadius: '50%'
      }}/>
      <div style={{
        position: 'absolute', bottom: '-150px', left: '-150px',
        width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(26,95,122,0.06) 0%, transparent 70%)',
        borderRadius: '50%'
      }}/>

      <div style={{
        display: 'flex', alignItems: 'center', gap: '50px',
        maxWidth: '980px', width: '100%', position: 'relative', zIndex: 1,
        flexWrap: 'wrap', justifyContent: 'center'
      }}>

        {/* Left: Illustration panel */}
        <div className="fade-in" style={{ flex: '1 1 380px', maxWidth: '420px', textAlign: 'center' }}>
          <DoctorIllustration />
          <h2 style={{
            fontSize: '1.5rem', fontWeight: '800', color: '#0f172a',
            marginTop: '12px', letterSpacing: '-0.02em'
          }}>
            Your AI Health Companion
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '8px', maxWidth: '320px', margin: '8px auto 0', lineHeight: '1.5' }}>
            Instant symptom analysis, risk detection, and trusted guidance — anytime you need it.
          </p>
        </div>

        {/* Right: Form card */}
        <div className="card fade-in" style={{ width: '420px', flex: '0 0 420px' }}>

          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
  {/* MediGuard Logo */}
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '12px', marginBottom: '8px'
  }}>
    <div style={{
      width: '52px', height: '52px',
      background: 'linear-gradient(135deg, #0f9d6e, #0a7a54)',
      borderRadius: '14px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 6px 20px rgba(15,157,110,0.3)'
    }}>
      <ShieldPlus size={28} color="white" strokeWidth={2.5} />
    </div>
    <div style={{ textAlign: 'left' }}>
      <h1 style={{
        fontSize: '2rem', fontWeight: '900', lineHeight: 1,
        background: 'linear-gradient(135deg, #0f9d6e, #0a7a54)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        letterSpacing: '-0.5px'
      }}>
        MediGuard
      </h1>
      <p style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase' }}>
        AI Health Platform
      </p>
    </div>
  </div>
  <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '10px' }}>
    {t('tagline')}
  </p>
</div>

          <div className="input-group">
            <label>{t('email')}</label>
            <div style={{ position: 'relative' }}>
              <Mail size={17} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                placeholder={t('emailPlaceholder')}
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleLogin()}
                style={{ paddingLeft: '42px' }}
              />
            </div>
          </div>

          <div className="input-group">
            <label>{t('password')}</label>
            <div style={{ position: 'relative' }}>
              <Lock size={17} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                placeholder={t('passwordPlaceholder')}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleLogin()}
                style={{ paddingLeft: '42px' }}
              />
            </div>
          </div>

          <button className="btn-primary" onClick={handleLogin} disabled={loading}>
            <LogIn size={18} />
            {loading ? '...' : t('loginBtn')}
          </button>

          {message && (
            <div className={`alert alert-${message.type}`}>
              {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              {message.text}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '24px', color: '#64748b', fontSize: '0.9rem' }}>
            {t('noAccount')}{' '}
            <span
              onClick={() => navigate('register')}
              style={{ color: '#0f9d6e', fontWeight: '700', cursor: 'pointer' }}
            >
              {t('registerHere')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;