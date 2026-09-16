import React, { useState } from 'react';
import { Sparkles, User, Mail, Lock, Calendar, UserPlus, AlertCircle, CheckCircle2, Globe, Activity, HeartPulse, Dna, AlertTriangle, Phone, Droplet, Wind, CircleDot, Bean, Camera, UserCircle2 } from 'lucide-react';
import translations from '../translations';
import DoctorIllustration from '../components/DoctorIllustration';

function Register({ navigate }) {
  const [form, setForm] = useState({
    name: '', email: '', password: '', age: '', language: 'en',
    gender: '', bloodGroup: '', weight: '', height: '', photo: null,
    diabetes: false, heartDisease: false, asthma: false, bp: false, thyroid: false, kidney: false,
    familyDiabetes: false, familyHeartDisease: false, familyCancer: false, familyBP: false,
    allergies: '', emergencyContact: '', emergencyPhone: '',
  });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en');

  const t = (key) => translations[selectedLang]?.[key] || translations['en'][key] || key;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleLangSelect = (langCode) => {
    setSelectedLang(langCode);
    setForm({ ...form, language: langCode });
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Photo 2MB se chota hona chahiye!');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(prev => ({ ...prev, photo: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleRegister = () => {
    if (!form.name || !form.email || !form.password || !form.age) {
      setMessage({ type: 'error', text: t('fillFields') });
      return;
    }

    setLoading(true);

    const users = JSON.parse(localStorage.getItem('healthai_users') || '[]');
    const exists = users.find(u => u.email === form.email);

    if (exists) {
      setMessage({ type: 'error', text: t('emailExists') });
      setLoading(false);
      return;
    }

    setTimeout(() => {
      users.push({ name: form.name, email: form.email, password: form.password, age: form.age, language: form.language, id: Date.now() });
      localStorage.setItem('healthai_users', JSON.stringify(users));

      // Save full profile, same shape Profile.js expects, so it's pre-filled later
      const profile = {
        name: form.name, age: form.age, language: form.language, photo: form.photo,
        gender: form.gender, bloodGroup: form.bloodGroup, weight: form.weight, height: form.height,
        diabetes: form.diabetes, heartDisease: form.heartDisease, asthma: form.asthma,
        bp: form.bp, thyroid: form.thyroid, kidney: form.kidney,
        familyDiabetes: form.familyDiabetes, familyHeartDisease: form.familyHeartDisease,
        familyCancer: form.familyCancer, familyBP: form.familyBP,
        allergies: form.allergies, emergencyContact: form.emergencyContact, emergencyPhone: form.emergencyPhone,
      };
      localStorage.setItem(`profile_${form.email}`, JSON.stringify(profile));

      setMessage({ type: 'success', text: t('registerSuccess') });
      setTimeout(() => navigate('login'), 1500);
      setLoading(false);
    }, 800);
  };

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी' },
    { code: 'mr', label: 'मराठी' },
  ];

  const sectionHeader = (Icon, label, color = '#0f9d6e', bg = '#e6f7f0') => (
    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.92rem', fontWeight: '700', color: '#0f172a', marginBottom: '14px' }}>
      <span style={{ width: '26px', height: '26px', borderRadius: '8px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={14} color={color} />
      </span>
      {label}
    </h3>
  );

  const checkboxItem = (label, name, Icon = CircleDot) => (
    <label key={name} style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: '10px 12px', borderRadius: '10px', cursor: 'pointer',
      border: form[name] ? '1.5px solid #0f9d6e' : '1.5px solid #e2e8f0',
      background: form[name] ? '#e6f7f0' : 'white',
      transition: 'all 0.2s'
    }}>
      <input type="checkbox" name={name} checked={form[name]} onChange={handleChange} style={{ width: '15px', height: '15px', accentColor: '#0f9d6e' }} />
      <Icon size={14} color={form[name] ? '#0a7a54' : '#94a3b8'} />
      <span style={{ fontSize: '0.82rem', fontWeight: '600', color: form[name] ? '#0a7a54' : '#475569' }}>{label}</span>
    </label>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0fdf9 0%, #f8fafc 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '30px 20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
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
        display: 'flex', alignItems: 'flex-start', gap: '50px',
        maxWidth: '1100px', width: '100%', position: 'relative', zIndex: 1,
        flexWrap: 'wrap', justifyContent: 'center'
      }}>

        {/* Left: Illustration panel */}
        <div className="fade-in" style={{ flex: '1 1 360px', maxWidth: '400px', textAlign: 'center', position: 'sticky', top: '30px' }}>
          <DoctorIllustration />
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginTop: '12px', letterSpacing: '-0.02em' }}>
            Join HealthAI Today
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '8px', maxWidth: '320px', margin: '8px auto 0', lineHeight: '1.5' }}>
            Tell us a bit about your health upfront — so MediGuard AI can personalize advice from day one.
          </p>
        </div>

        {/* Right: Form card */}
        <div className="card fade-in" style={{ width: '480px', flex: '0 0 480px', maxHeight: '88vh', overflowY: 'auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              width: '56px', height: '56px', background: '#0f9d6e', borderRadius: '14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
            }}>
              <Sparkles size={26} color="white" />
            </div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a' }}>{t('registerTitle')}</h1>
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{t('registerSubtitle')}</p>
          </div>

          {/* Profile Photo Upload */}
          <div style={{ textAlign: 'center', marginBottom: '22px' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <div style={{
                width: '96px', height: '96px', borderRadius: '50%',
                background: form.photo ? 'transparent' : '#e6f7f0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '3px solid white', boxShadow: '0 6px 18px rgba(15,157,110,0.18)',
                overflow: 'hidden', position: 'relative'
              }}>
                {form.photo
                  ? <img src={form.photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <UserCircle2 size={48} color="#0f9d6e" />
                }
              </div>
              <label htmlFor="register-photo-upload" style={{
                position: 'absolute', bottom: '2px', right: '2px',
                width: '30px', height: '30px', borderRadius: '50%',
                background: '#0f9d6e', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', border: '2.5px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
              }}>
                <Camera size={14} color="white" />
              </label>
              <input id="register-photo-upload" type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.78rem', marginTop: '8px' }}>
              Add a profile photo (optional)
            </p>
          </div>

          {/* Language */}
          <div className="input-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Globe size={14} /> {t('language')}</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {languages.map(l => (
                <button key={l.code} onClick={() => handleLangSelect(l.code)} style={{
                  flex: 1, padding: '11px', borderRadius: '10px',
                  border: selectedLang === l.code ? '1.5px solid #0f9d6e' : '1.5px solid #e2e8f0',
                  background: selectedLang === l.code ? '#e6f7f0' : 'white',
                  color: selectedLang === l.code ? '#0a7a54' : '#64748b',
                  cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', fontFamily: 'Inter, sans-serif'
                }}>{l.label}</button>
              ))}
            </div>
          </div>

          {/* Account basics */}
          <div className="input-group">
            <label>{t('fullName')}</label>
            <div style={{ position: 'relative' }}>
              <User size={17} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input type="text" name="name" placeholder={t('namePlaceholder')} value={form.name} onChange={handleChange} style={{ paddingLeft: '42px' }} />
            </div>
          </div>

          <div className="input-group">
            <label>{t('email')}</label>
            <div style={{ position: 'relative' }}>
              <Mail size={17} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input type="email" name="email" placeholder={t('emailPlaceholder')} value={form.email} onChange={handleChange} style={{ paddingLeft: '42px' }} />
            </div>
          </div>

          <div className="input-group">
            <label>{t('password')}</label>
            <div style={{ position: 'relative' }}>
              <Lock size={17} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input type="password" name="password" placeholder={t('passwordPlaceholder')} value={form.password} onChange={handleChange} style={{ paddingLeft: '42px' }} />
            </div>
          </div>

          {/* Basic Info */}
          <div style={{ marginTop: '22px', marginBottom: '18px' }}>
            {sectionHeader(Activity, t('basicInfo'))}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>{t('age')}</label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={17} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="number" name="age" placeholder={t('agePlaceholder')} value={form.age} onChange={handleChange} style={{ paddingLeft: '42px' }} />
                </div>
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>{t('gender')}</label>
                <select name="gender" value={form.gender} onChange={handleChange}>
                  <option value="">--</option>
                  <option value="Male">{t('male')}</option>
                  <option value="Female">{t('female')}</option>
                  <option value="Other">{t('other')}</option>
                </select>
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>{t('bloodGroup')}</label>
                <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange}>
                  <option value="">--</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>{t('weight')}</label>
                <input name="weight" type="number" value={form.weight} onChange={handleChange} />
              </div>
              <div className="input-group" style={{ marginBottom: 0, gridColumn: 'span 2' }}>
                <label>{t('height')}</label>
                <input name="height" type="number" value={form.height} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* Existing diseases */}
          <div style={{ marginBottom: '18px' }}>
            {sectionHeader(HeartPulse, t('existingDiseases'), '#dc2626', '#fef2f2')}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {checkboxItem(t('diabetes'), 'diabetes', Droplet)}
              {checkboxItem(t('heartDisease'), 'heartDisease', HeartPulse)}
              {checkboxItem(t('asthma'), 'asthma', Wind)}
              {checkboxItem(t('bp'), 'bp', Activity)}
              {checkboxItem(t('thyroid'), 'thyroid', CircleDot)}
              {checkboxItem(t('kidney'), 'kidney', Bean)}
            </div>
          </div>

          {/* Family genetics */}
          <div style={{ marginBottom: '18px' }}>
            {sectionHeader(Dna, t('familyGenetics'), '#7c3aed', '#f3eaff')}
            <p style={{ color: '#94a3b8', fontSize: '0.78rem', marginBottom: '10px', marginLeft: '34px' }}>{t('familyGeneticsSubtitle')}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {checkboxItem(t('familyDiabetes'), 'familyDiabetes', Droplet)}
              {checkboxItem(t('familyHeart'), 'familyHeartDisease', HeartPulse)}
              {checkboxItem(t('familyCancer'), 'familyCancer', Dna)}
              {checkboxItem(t('familyBP'), 'familyBP', Activity)}
            </div>
          </div>

          {/* Allergies */}
          <div style={{ marginBottom: '18px' }}>
            {sectionHeader(AlertTriangle, t('allergies'), '#d97706', '#fffbeb')}
            <div className="input-group" style={{ marginBottom: 0 }}>
              <textarea name="allergies" value={form.allergies} onChange={handleChange}
                placeholder={t('allergiesPlaceholder')} style={{ height: '60px', resize: 'none' }} />
            </div>
          </div>

          {/* Emergency contact */}
          <div style={{ marginBottom: '20px' }}>
            {sectionHeader(Phone, t('emergencyContact'), '#dc2626', '#fef2f2')}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>{t('contactName')}</label>
                <input name="emergencyContact" value={form.emergencyContact} onChange={handleChange} />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>{t('contactPhone')}</label>
                <input name="emergencyPhone" type="tel" value={form.emergencyPhone} onChange={handleChange} />
              </div>
            </div>
          </div>

          <button className="btn-primary" onClick={handleRegister} disabled={loading}>
            <UserPlus size={18} />
            {loading ? '...' : t('registerBtn')}
          </button>

          {message && (
            <div className={`alert alert-${message.type}`}>
              {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              {message.text}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '20px', color: '#64748b', fontSize: '0.9rem' }}>
            {t('haveAccount')}{' '}
            <span onClick={() => navigate('login')} style={{ color: '#0f9d6e', fontWeight: '700', cursor: 'pointer' }}>
              {t('loginHere')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;