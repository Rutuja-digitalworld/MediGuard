import React, { useState, useEffect } from 'react';
import { UserCircle2, Globe, Save, CheckCircle2, Activity, Dna, AlertTriangle, Phone, Camera } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import Navbar from '../components/Navbar';

function Profile({ user, navigate }) {
  const [profile, setProfile] = useState({
    name: user?.name || '', age: user?.age || '', gender: '', bloodGroup: '',
    weight: '', height: '', familyDiabetes: false, familyHeartDisease: false,
    familyCancer: false, familyBP: false, diabetes: false, heartDisease: false,
    asthma: false, bp: false, thyroid: false, kidney: false, allergies: '',
    emergencyContact: '', emergencyPhone: '', language: 'en', photo: null,
  });

  const [saved, setSaved] = useState(false);
  const { t, changeLang } = useLanguage();

  useEffect(() => {
    const savedProfile = JSON.parse(localStorage.getItem(`profile_${user?.email}`) || 'null');
    if (savedProfile) setProfile(prev => ({ ...prev, ...savedProfile }));
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleLangChange = (langCode) => setProfile(prev => ({ ...prev, language: langCode }));

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Photo 2MB se chota hona chahiye!');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile(prev => ({ ...prev, photo: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    localStorage.setItem(`profile_${user?.email}`, JSON.stringify(profile));
    changeLang(profile.language);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const sectionStyle = { marginBottom: '20px' };

  const checkboxItem = (label, name) => (
    <label key={name} style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '13px 15px',
      background: profile[name] ? 'var(--primary-light)' : '#f8fafc',
      borderRadius: '10px', cursor: 'pointer',
      border: profile[name] ? '1.5px solid #bbf0da' : '1.5px solid var(--border)',
      transition: 'all 0.2s'
    }}>
      <input type="checkbox" name={name} checked={profile[name]} onChange={handleChange}
        style={{ width: '17px', height: '17px', accentColor: 'var(--primary)', flexShrink: 0 }} />
      <span style={{ color: 'var(--text-dark)', fontSize: '0.88rem', fontWeight: '500' }}>{label}</span>
    </label>
  );

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी' },
    { code: 'mr', label: 'मराठी' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      <Navbar navigate={navigate} currentPage="profile" user={user} />

      <div style={{ maxWidth: '780px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Profile Photo Header */}
        <div className="fade-in" style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
            {/* Photo Circle */}
            <div style={{
              width: '140px', height: '140px', borderRadius: '50%',
              background: profile.photo ? 'transparent' : 'var(--primary-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '4px solid white', boxShadow: '0 8px 24px rgba(15,157,110,0.2)',
              overflow: 'hidden', position: 'relative'
            }}>
              {profile.photo
                ? <img src={profile.photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <UserCircle2 size={70} color="var(--primary)" />
              }
            </div>

            {/* Camera Upload Button */}
            <label htmlFor="photo-upload" style={{
              position: 'absolute', bottom: '6px', right: '6px',
              width: '38px', height: '38px', borderRadius: '50%',
              background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', border: '3px solid white', boxShadow: 'var(--shadow-md)'
            }}>
              <Camera size={17} color="white" />
            </label>
            <input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
          </div>

          <p style={{ color: 'var(--text-light)', fontSize: '0.8rem', marginBottom: '12px' }}>
            Click on camera icon to upload photo
          </p>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-dark)' }}>{t('profileTitle')}</h1>
          <p style={{ color: 'var(--text-light)', marginTop: '6px', fontSize: '0.92rem' }}>{t('profileSubtitle')}</p>
        </div>

        {/* Language */}
        <div className="card" style={sectionStyle}>
          <h3 style={{ color: 'var(--text-dark)', marginBottom: '16px', fontSize: '0.95rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={17} color="var(--primary)" /> {t('language')}
          </h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            {languages.map(l => (
              <button key={l.code} onClick={() => handleLangChange(l.code)} style={{
                flex: 1, padding: '11px', borderRadius: '10px',
                border: profile.language === l.code ? '1.5px solid #0f9d6e' : '1.5px solid #e2e8f0',
                background: profile.language === l.code ? '#e6f7f0' : 'white',
                color: profile.language === l.code ? '#0a7a54' : '#64748b',
                cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', fontFamily: 'Inter, sans-serif'
              }}>{l.label}</button>
            ))}
          </div>
        </div>

        {/* Basic Info */}
        <div className="card" style={sectionStyle}>
          <h3 style={{ color: 'var(--text-dark)', marginBottom: '18px', fontSize: '0.95rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={17} color="var(--primary)" /> {t('basicInfo')}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>{t('fullName')}</label>
              <input name="name" value={profile.name} onChange={handleChange} />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>{t('age')}</label>
              <input name="age" type="number" value={profile.age} onChange={handleChange} />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>{t('gender')}</label>
              <select name="gender" value={profile.gender} onChange={handleChange}>
                <option value="">--</option>
                <option value="Male">{t('male')}</option>
                <option value="Female">{t('female')}</option>
                <option value="Other">{t('other')}</option>
              </select>
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>{t('bloodGroup')}</label>
              <select name="bloodGroup" value={profile.bloodGroup} onChange={handleChange}>
                <option value="">--</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>{t('weight')}</label>
              <input name="weight" type="number" value={profile.weight} onChange={handleChange} />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>{t('height')}</label>
              <input name="height" type="number" value={profile.height} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* Existing Diseases */}
        <div className="card" style={sectionStyle}>
          <h3 style={{ color: 'var(--text-dark)', marginBottom: '16px', fontSize: '0.95rem', fontWeight: '700' }}>{t('existingDiseases')}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {checkboxItem(t('diabetes'), 'diabetes')}
            {checkboxItem(t('heartDisease'), 'heartDisease')}
            {checkboxItem(t('asthma'), 'asthma')}
            {checkboxItem(t('bp'), 'bp')}
            {checkboxItem(t('thyroid'), 'thyroid')}
            {checkboxItem(t('kidney'), 'kidney')}
          </div>
        </div>

        {/* Family Genetics */}
        <div className="card" style={sectionStyle}>
          <h3 style={{ color: 'var(--text-dark)', marginBottom: '6px', fontSize: '0.95rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Dna size={17} color="var(--primary)" /> {t('familyGenetics')}
          </h3>
          <p style={{ color: 'var(--text-light)', fontSize: '0.83rem', marginBottom: '14px' }}>{t('familyGeneticsSubtitle')}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {checkboxItem(t('familyDiabetes'), 'familyDiabetes')}
            {checkboxItem(t('familyHeart'), 'familyHeartDisease')}
            {checkboxItem(t('familyCancer'), 'familyCancer')}
            {checkboxItem(t('familyBP'), 'familyBP')}
          </div>
        </div>

        {/* Allergies */}
        <div className="card" style={sectionStyle}>
          <h3 style={{ color: 'var(--text-dark)', marginBottom: '14px', fontSize: '0.95rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={17} color="var(--warning)" /> {t('allergies')}
          </h3>
          <textarea
            name="allergies"
            value={profile.allergies}
            onChange={handleChange}
            placeholder={t('allergiesPlaceholder')}
            style={{
              width: '100%', height: '90px', resize: 'none',
              padding: '12px 16px', border: '1.5px solid var(--border)',
              borderRadius: '10px', fontSize: '0.95rem', fontFamily: 'Inter, sans-serif',
              outline: 'none', display: 'block', color: 'var(--text-dark)'
            }}
          />
        </div>

        {/* Emergency Contact */}
        <div className="card" style={sectionStyle}>
          <h3 style={{ color: 'var(--text-dark)', marginBottom: '16px', fontSize: '0.95rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Phone size={17} color="var(--danger)" /> {t('emergencyContact')}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>{t('contactName')}</label>
              <input name="emergencyContact" value={profile.emergencyContact} onChange={handleChange} />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>{t('contactPhone')}</label>
              <input name="emergencyPhone" type="tel" value={profile.emergencyPhone} onChange={handleChange} />
            </div>
          </div>
        </div>

        <button className="btn-primary" onClick={handleSave}>
          <Save size={18} /> {t('saveProfile')}
        </button>

        {saved && (
          <div className="alert alert-success">
            <CheckCircle2 size={16} /> {t('profileSaved')}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;